'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchRoutine, fetchExercise, createSet, deleteExerciseFromRoutine, addExerciseToRoutine, fetchExercises, Exercise, Set, fetchSets, CreateSetResponse } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Minus, PauseCircle, PlayCircle, Plus, StopCircle, TimerIcon, Trash, TrendingDown, TrendingUp } from 'lucide-react';
import { WorkoutForm } from '@/components/WorkoutForm';

interface RoutineExercise extends Exercise {
  lastDone?: string;
  isWorkoutActive: boolean;
  workoutTimer: number;
  setTimer: number;
  isSetTimerActive: boolean;
  currentWorkoutSets: (Set | CreateSetResponse)[];
}

interface RoutineState {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export default function RoutineDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [routine, setRoutine] = useState<{ id: string; name: string; exercises: RoutineExercise[] } | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadRoutine();
    loadAvailableExercises();
  }, [id]);

  const loadRoutine = async () => {
    try {
      const fetchedRoutine = await fetchRoutine(id as string);
      console.log('Fetched routine:', fetchedRoutine);

      // Check if fetchedRoutine.exercises is an array of strings (exercise IDs)
      if (Array.isArray(fetchedRoutine.exercises)) {
        const routineWithExercises = {
          ...fetchedRoutine,
          exercises: await Promise.all(fetchedRoutine.exercises.map(async (exerciseId: string) => {
            const exercise = await fetchExercise(exerciseId);
            return {
              ...exercise,
              isWorkoutActive: false,
              workoutTimer: 0,
              setTimer: 0,
              isSetTimerActive: false,
              currentWorkoutSets: []
            };
          }))
        };
        setRoutine(routineWithExercises);
      } else {
        setRoutine(fetchedRoutine as unknown as RoutineState);
      }
    } catch (error) {
      console.error('Failed to fetch routine:', error);
      toast({
        title: "Error",
        description: "Failed to load routine. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadAvailableExercises = async () => {
    try {
      const exercises = await fetchExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Failed to fetch available exercises:', error);
      toast({
        title: "Error",
        description: "Failed to load available exercises. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartWorkout = (exerciseId: string) => {
    setRoutine(prevRoutine => ({
      ...prevRoutine!,
      exercises: prevRoutine!.exercises?.map(ex =>
        ex.id === exerciseId ? { ...ex, isWorkoutActive: true, isSetTimerActive: true } : ex
      )
    }));
  };

  const handleEndWorkout = (exerciseId: string) => {
    setRoutine(prevRoutine => ({
      ...prevRoutine!,
      exercises: prevRoutine!.exercises?.map(ex =>
        ex.id === exerciseId ? {
          ...ex,
          isWorkoutActive: false,
          isSetTimerActive: false,
          workoutTimer: 0,
          setTimer: 0,
          currentWorkoutSets: []
        } : ex
      )
    }));
  };

  const handleAddSet = async (exerciseId: string, reps: number, weight: number, duration: number) => {
    try {
      const newSet = await createSet(exerciseId, { repetitions: reps, weight: weight, duration: duration });
      setRoutine(prevRoutine => ({
        ...prevRoutine!,
        exercises: prevRoutine!.exercises?.map(ex =>
          ex.id === exerciseId ? {
            ...ex,
            lastDone: new Date().toLocaleString(),
            currentWorkoutSets: [...ex.currentWorkoutSets, newSet],
            setTimer: 0,
            isSetTimerActive: false
          } : ex
        )
      }));
      toast({
        title: "Success",
        description: "Set added successfully",
      });
    } catch (error) {
      console.error('Failed to add set:', error);
      toast({
        title: "Error",
        description: "Failed to add set. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      await deleteExerciseFromRoutine(id, exerciseId);
      setRoutine(prevRoutine => ({
        ...prevRoutine!,
        exercises: prevRoutine!.exercises.filter(ex => ex.id !== exerciseId)
      }));
      toast({
        title: "Success",
        description: "Exercise removed from routine",
      });
    } catch (error) {
      console.error('Failed to remove exercise:', error);
      toast({
        title: "Error",
        description: "Failed to remove exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddExercise = async () => {
    if (selectedExercise) {
      try {
        await addExerciseToRoutine(id, selectedExercise);
        const newExercise = await fetchExercise(selectedExercise);
        setRoutine(prevRoutine => ({
          ...prevRoutine!,
          exercises: [...prevRoutine!.exercises, {
            ...newExercise,
            isWorkoutActive: false,
            workoutTimer: 0,
            setTimer: 0,
            isSetTimerActive: false,
            currentWorkoutSets: []
          }]
        }));
        setSelectedExercise('');
        toast({
          title: "Success",
          description: "Exercise added to routine",
        });
      } catch (error) {
        console.error('Failed to add exercise to routine:', error);
        toast({
          title: "Error",
          description: "Failed to add exercise to routine. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const updateExercise = (updatedExercise: RoutineExercise) => {
    setRoutine(prevRoutine => ({
      ...prevRoutine!,
      exercises: prevRoutine!.exercises?.map(ex =>
        ex.id === updatedExercise.id ? updatedExercise : ex
      )
    }));
  };

  if (!routine) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{routine.name}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Exercise to Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                {availableExercises?.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddExercise}>Add to Routine</Button>
          </div>
        </CardContent>
      </Card>

      {routine.exercises?.map((exercise) => (
        <Card key={exercise.id} className="mb-4">
          <CardHeader>
            <CardTitle className='flex justify-between'>
              {exercise.name}
              <Button size={"icon"} variant="destructive" className='size-7' onClick={() => handleRemoveExercise(exercise.id)}>
                <Trash className='size-4' />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex justify-between items-start flex-col">
            {exercise.isWorkoutActive ? (
              <WorkoutForm
                exercise={exercise}
                onAddSet={(reps, weight) => handleAddSet(exercise.id, reps, weight, exercise.setTimer)}
                onEndWorkout={() => handleEndWorkout(exercise.id)}
                onUpdateExercise={updateExercise}
              />
            ) : (
              <Button onClick={() => handleStartWorkout(exercise.id)}>Start Workout</Button>
            )}

          </CardFooter>
        </Card>
      ))}
    </div>
  );
}