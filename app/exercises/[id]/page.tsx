'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExerciseProgressChart from '@/components/ProgressChart';
import { fetchExercise, fetchSets, createSet, Set, Exercise } from '@/lib/api';

export default function ExerciseDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [allSets, setAllSets] = useState<Set[]>([]);
  const [currentWorkoutSets, setCurrentWorkoutSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      if (id) {
        try {
          const [exerciseData, setsData] = await Promise.all([
            fetchExercise(id),
            fetchSets(id)
          ]);
          setExercise(exerciseData);
          setAllSets(setsData);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      if (isWorkoutActive) {
        endWorkout();
      }
    };
  }, [id]);

  useEffect(() => {
    if (isWorkoutActive) {
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isWorkoutActive]);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setTimer(0);
    setCurrentWorkoutSets([]);
  };

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setTimer(0);
    setReps('');
    setWeight('');
    setAllSets(prevSets => [...prevSets, ...currentWorkoutSets]);
    setCurrentWorkoutSets([]);
  };

  const addSet = async () => {
    if (exercise && reps && weight) {
      const newSet: Omit<Set, 'id' | 'timestamp'> = {
        repetitions: parseInt(reps),
        weight: parseFloat(weight),
      };
      try {
        const createdSet = await createSet(exercise.id, newSet);
        setCurrentWorkoutSets(prevSets => [...prevSets, createdSet] as Set[]);
        setReps('');
        setWeight('');
      } catch (error) {
        console.error("Failed to add set:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDifferences = (index: number) => {
    if (index === 0) return null;
    const prevSet = currentWorkoutSets[index - 1];
    const currentSet = currentWorkoutSets[index];
    return {
      reps: currentSet.repetitions - prevSet.repetitions,
      weight: currentSet.weight - prevSet.weight,
      time: (new Date(currentSet.timestamp).getTime() - new Date(prevSet.timestamp).getTime()) / 1000
    };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{exercise.name} Details</h1>
        {isWorkoutActive && (
          <div className="text-2xl font-semibold">{formatTime(timer)}</div>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Workout Session</CardTitle>
        </CardHeader>
        <CardContent>
          {!isWorkoutActive ? (
            <Button onClick={startWorkout}>Start Workout</Button>
          ) : (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Input
                  type="number"
                  placeholder="Reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
                <Button onClick={addSet}>Add Set</Button>
              </div>
              {isWorkoutActive && currentWorkoutSets.length > 0 && (

                <ul>
                  {currentWorkoutSets.slice().reverse().map((set, index) => (
                    <li key={set.id} className="mb-2">
                      {set.repetitions} reps at {set.weight} kg
                      {index > 0 && (
                        <span className="ml-2 text-sm text-gray-500">
                          {`(Δ: ${calculateDifferences(index)?.reps} reps, ${calculateDifferences(index)?.weight} kg, ${formatTime(calculateDifferences(index)?.time || 0)})`}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Button onClick={endWorkout} variant="destructive">End Workout</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Exercise Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Muscle Group: {exercise.muscleGroup}</p>
          <p>Description: {exercise.description}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ExerciseProgressChart data={allSets} exerciseName={exercise.name} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Sets</CardTitle>
        </CardHeader>
        <CardContent style={{ overflowY: 'auto', maxHeight: '400px' }}> {/* Adjust maxHeight as needed */}
          <ul>
            {allSets.map((set) => (
              <li key={set.id} className="mb-2">
                {set.repetitions} reps at {set.weight} kg - {new Date(set.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}