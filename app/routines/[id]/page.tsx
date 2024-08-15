'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchRoutine, fetchExercise, createSet, deleteExerciseFromRoutine, addExerciseToRoutine, fetchExercises, Exercise, Set } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface RoutineExercise extends Exercise {
  lastDone?: string;
  isWorkoutActive: boolean;
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
      const fetchedRoutine = await fetchRoutine(id);
      const routineWithExercises = {
        ...fetchedRoutine,
        exercises: await Promise.all(fetchedRoutine.exerciseIds.map(async (exerciseId: string) => {
          const exercise = await fetchExercise(exerciseId);
          return { ...exercise, isWorkoutActive: false };
        }))
      };
      setRoutine(routineWithExercises);
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
      exercises: prevRoutine!.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, isWorkoutActive: true } : ex
      )
    }));
  };

  const handleEndWorkout = (exerciseId: string) => {
    setRoutine(prevRoutine => ({
      ...prevRoutine!,
      exercises: prevRoutine!.exercises.map(ex =>
        ex.id === exerciseId ? { ...ex, isWorkoutActive: false } : ex
      )
    }));
  };

  const handleAddSet = async (exerciseId: string, reps: number, weight: number) => {
    try {
      const newSet = await createSet(exerciseId, { repetitions: reps, weight: weight });
      setRoutine(prevRoutine => ({
        ...prevRoutine!,
        exercises: prevRoutine!.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, lastDone: new Date().toLocaleString() } : ex
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
          exercises: [...prevRoutine!.exercises, { ...newExercise, isWorkoutActive: false }]
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
                {availableExercises.map((exercise) => (
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

      {routine.exercises.map((exercise) => (
        <Card key={exercise.id} className="mb-4">
          <CardHeader>
            <CardTitle>{exercise.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{exercise.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Last done: {exercise.lastDone || 'Never'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between flex-col ">
            {exercise.isWorkoutActive ? (
              <WorkoutForm
                onAddSet={(reps, weight) => handleAddSet(exercise.id, reps, weight)}
                onEndWorkout={() => handleEndWorkout(exercise.id)}
              />
            ) : (
              <Button onClick={() => handleStartWorkout(exercise.id)}>Start Workout</Button>
            )}
            <Button variant="destructive" onClick={() => handleRemoveExercise(exercise.id)}>
              Remove
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

interface WorkoutFormProps {
  onAddSet: (reps: number, weight: number) => void;
  onEndWorkout: () => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onAddSet, onEndWorkout }) => {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reps && weight) {
      onAddSet(Number(reps), Number(weight));
      setReps('');
      setWeight('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-col">
      <div className="flex space-x-4">
        <Input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
        />
        <Input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (kg)"
        />
        <Button type="submit">Add Set</Button>
      </div>
      <Button variant="secondary" onClick={onEndWorkout}>End Workout</Button>
    </form>
  );
};