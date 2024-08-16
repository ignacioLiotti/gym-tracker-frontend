"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExerciseProgressChart from "@/components/ProgressChart";
import { fetchExercise, fetchSets, createSet, Set, Exercise } from "@/lib/api";
import { PlayCircle } from "lucide-react";
import { WorkoutForm } from "@/components/WorkoutForm";

interface WorkoutExercise extends Exercise {
  isWorkoutActive: boolean;
  workoutTimer: number;
  setTimer: number;
  isSetTimerActive: boolean;
  currentWorkoutSets: Set[];
}

export default function ExerciseDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [exercise, setExercise] = useState<WorkoutExercise | null>(null);
  const [allSets, setAllSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = (time: string | number): string => {
    if (typeof time === "string") {
      const date = new Date(time);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else if (typeof time === "number") {
      const mins = Math.floor(time / 60);
      const secs = time % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return "Invalid time format";
  };

  useEffect(() => {
    async function loadData() {
      if (id) {
        try {
          const [exerciseData, setsData] = await Promise.all([
            fetchExercise(id),
            fetchSets(id),
          ]);
          setExercise({
            ...exerciseData,
            isWorkoutActive: false,
            workoutTimer: 0,
            setTimer: 0,
            isSetTimerActive: false,
            currentWorkoutSets: []
          });
          setAllSets(setsData);
        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadData();
  }, [id]);

  const handleStartWorkout = () => {
    if (exercise) {
      setExercise({
        ...exercise,
        isWorkoutActive: true,
        workoutTimer: 0,
        setTimer: 0,
        isSetTimerActive: true,
        currentWorkoutSets: []
      });
    }
  };

  const handleAddSet = async (reps: number, weight: number) => {
    if (exercise) {
      const duration = exercise.setTimer;
      try {
        const newSet = await createSet(exercise.id, { repetitions: reps, weight: weight, duration: duration });
        // Ensure newSet is of type Set before adding it to the state
        const typedNewSet: Set = {
          id: newSet.id,
          repetitions: newSet.repetitions,
          weight: newSet.weight,
          timestamp: newSet.timestamp,
          duration: newSet.duration,
        };
        setAllSets(prevSets => [...prevSets, typedNewSet]);
        setExercise({
          ...exercise,
          setTimer: 0,
          isSetTimerActive: true,
          currentWorkoutSets: [...exercise.currentWorkoutSets, typedNewSet]
        });
      } catch (error) {
        console.error('Failed to add set:', error);
      }
    }
  };

  const handleEndWorkout = () => {
    if (exercise) {
      setExercise({
        ...exercise,
        isWorkoutActive: false,
        workoutTimer: 0,
        setTimer: 0,
        isSetTimerActive: false,
        currentWorkoutSets: []
      });
    }
  };

  const updateExercise = (updatedExercise: WorkoutExercise) => {
    setExercise(updatedExercise);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{exercise.name} Details</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Workout Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!exercise.isWorkoutActive ? (
            <Button onClick={handleStartWorkout}>
              <PlayCircle className="mr-2 h-4 w-4" /> Start Workout
            </Button>
          ) : (
            <WorkoutForm
              exercise={exercise}
              onAddSet={handleAddSet}
              onEndWorkout={handleEndWorkout}
              onUpdateExercise={updateExercise}
            />
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

      <ExerciseProgressChart data={allSets} exerciseName={exercise.name} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>All Sets</CardTitle>
        </CardHeader>
        <CardContent style={{ overflowY: "auto", maxHeight: "400px" }}>
          <ul>
            {allSets.map((set) => (
              <li key={set.id} className="mb-2">
                {set.repetitions} reps at {set.weight} kg -{" "}
                {new Date(set.timestamp).toLocaleString()} (Duration:{" "}
                {formatTime(set.duration)})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}