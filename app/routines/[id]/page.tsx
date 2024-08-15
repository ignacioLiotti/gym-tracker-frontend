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

interface RoutineExercise extends Exercise {
  lastDone?: string;
  isWorkoutActive: boolean;
  workoutTimer: number;
  setTimer: number;
  isSetTimerActive: boolean;
  currentWorkoutSets: (Set | CreateSetResponse)[];
}

interface SharedSetProperties {
  repetitions: number;
  weight: number;
  duration: number;
}

// Type guard function to check if an object is of type Set
function isSet(obj: Set | CreateSetResponse): obj is Set {
  return 'id' in obj;
}

// Helper function to safely access properties
function getSetProperty(set: Set | CreateSetResponse, key: string): number | undefined {
  return (set as any)?.[key];
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
        ex.id === exerciseId ? { ...ex, isWorkoutActive: true, isSetTimerActive: true } : ex
      )
    }));
  };

  const handleEndWorkout = (exerciseId: string) => {
    setRoutine(prevRoutine => ({
      ...prevRoutine!,
      exercises: prevRoutine!.exercises.map(ex =>
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
        exercises: prevRoutine!.exercises.map(ex =>
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
      exercises: prevRoutine!.exercises.map(ex =>
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

interface WorkoutFormProps {
  exercise: RoutineExercise;
  onAddSet: (reps: number, weight: number, duration: number) => void;
  onEndWorkout: () => void;
  onUpdateExercise: (exercise: RoutineExercise) => void;
}

function WorkoutForm({ exercise, onAddSet, onEndWorkout, onUpdateExercise }: WorkoutFormProps) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [localWorkoutTimer, setLocalWorkoutTimer] = useState(exercise.workoutTimer);
  const [localSetTimer, setLocalSetTimer] = useState(exercise.setTimer);

  useEffect(() => {
    let workoutInterval: NodeJS.Timeout | null = null;
    let setTimerInterval: NodeJS.Timeout | null = null;

    if (exercise.isWorkoutActive) {
      workoutInterval = setInterval(() => {
        setLocalWorkoutTimer(prev => prev + 1);
      }, 1000);
    }

    if (exercise.isSetTimerActive) {
      setTimerInterval = setInterval(() => {
        setLocalSetTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (workoutInterval) clearInterval(workoutInterval);
      if (setTimerInterval) clearInterval(setTimerInterval);
    };
  }, [exercise.isWorkoutActive, exercise.isSetTimerActive]);

  useEffect(() => {
    onUpdateExercise({
      ...exercise,
      workoutTimer: localWorkoutTimer,
      setTimer: localSetTimer
    });
  }, [localWorkoutTimer, localSetTimer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reps && weight) {
      onAddSet(Number(reps), Number(weight), localSetTimer);
      setReps("");
      setWeight("");
      setLocalSetTimer(0);
    }
  };

  const pauseResumeSet = () => {
    onUpdateExercise({
      ...exercise,
      isSetTimerActive: !exercise.isSetTimerActive
    });
  };

  const formatTime = (time: number): string => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  function calculateDifference(current: number | undefined, previous: number | undefined) {
    if (current === undefined || previous === undefined) {
      return { icon: <Minus className="w-4 h-4 text-gray-500" />, value: 0 };
    }
    const diff = current - previous;
    if (diff > 0)
      return {
        icon: <TrendingUp className="w-4 h-4 text-green-500" />,
        value: diff,
      };
    if (diff < 0)
      return {
        icon: <TrendingDown className="w-4 h-4 text-red-500" />,
        value: Math.abs(diff),
      };
    return { icon: <Minus className="w-4 h-4 text-gray-500" />, value: 0 };
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold text-slate-400 flex flex-col ">
          Workout Timer:
          <span className='text-3xl font-bold text-black'>
            {formatTime(localWorkoutTimer)}
          </span>
        </div>
        <div className="text-lg font-semibold text-slate-400 flex flex-col">
          Set Time:
          <span className='text-3xl font-bold text-black'>
            {formatTime(localSetTimer)}
          </span>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 flex-col">
        <div className="flex space-x-4">
          <Input
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder={exercise.isSetTimerActive ? "Reps" : "----------------"}
            disabled={!exercise.isSetTimerActive}
          />
          <Input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={exercise.isSetTimerActive ? "Weight (kg)" : "----------------"}
            disabled={!exercise.isSetTimerActive}
          />
          <Button type="submit" disabled={!exercise.isSetTimerActive}>
            <Plus className="mr-2 h-4 w-4" />
            Add Set
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button onClick={pauseResumeSet}>
            {exercise.isSetTimerActive ? (
              <PauseCircle className="mr-2 h-4 w-4" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            {exercise.isSetTimerActive ? "Pause Set" : "Resume Set"}
          </Button>
          <Button variant="destructive" onClick={onEndWorkout}>
            <StopCircle className="mr-2 h-4 w-4" /> End Workout
          </Button>
        </div>
      </form>

      {exercise.currentWorkoutSets.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Current Workout Sets:</h3>
          <ul className="space-y-2">
            {exercise.currentWorkoutSets.map((set, index) => {
              const prevSet = index > 0 ? exercise.currentWorkoutSets[index - 1] : null;
              const repsDiff = prevSet ? calculateDifference(
                getSetProperty(set, 'repetitions'),
                getSetProperty(prevSet, 'repetitions')
              ) : null;
              const weightDiff = prevSet ? calculateDifference(
                getSetProperty(set, 'weight'),
                getSetProperty(prevSet, 'weight')
              ) : null;
              const durationDiff = prevSet ? calculateDifference(
                getSetProperty(set, 'duration'),
                getSetProperty(prevSet, 'duration')
              ) : null;
              return (
                <li
                  key={isSet(set) ? set.id : index}
                  className="bg-secondary p-2 rounded-md"
                >
                  <div className="flex gap-2 justify-between" >
                    <div className="flex gap-2 justify-start items-center">
                      <b className="text-lg flex items-center">{getSetProperty(set, 'repetitions') ?? 'N/A'} Reps</b>
                      at
                      <b className="text-lg">{getSetProperty(set, 'weight') ?? 'N/A'}kg </b>
                    </div>
                    <div className="flex items-center font-bold">
                      <TimerIcon className="mr-1 h-4 w-4" />
                      {getSetProperty(set, 'duration') ?? 'N/A'}s
                    </div>
                  </div>
                  {prevSet && (
                    <div className="text-sm mt-1">
                      <div className="flex justify-between">
                        <span className="mr-2 flex justify-start items-center">
                          Reps: {repsDiff?.value} {repsDiff?.icon}
                        </span>
                        <span className="mr-2 flex justify-start items-center">
                          Weight: {weightDiff?.value} kg {weightDiff?.icon}
                        </span>
                      </div>
                      <span className="flex justify-start items-center">
                        Duration: {durationDiff?.value}s {durationDiff?.icon}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}