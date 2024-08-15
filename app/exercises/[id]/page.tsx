"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ExerciseProgressChart from "@/components/ProgressChart";
import { fetchExercise, fetchSets, createSet, Set, Exercise } from "@/lib/api";
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export default function ExerciseDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [allSets, setAllSets] = useState<Set[]>([]);
  const [currentWorkoutSets, setCurrentWorkoutSets] = useState<Set[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [isSetTimerActive, setIsSetTimerActive] = useState(false);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [setTimer, setSetTimer] = useState(0);
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const setTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadData() {
      if (id) {
        try {
          const [exerciseData, setsData] = await Promise.all([
            fetchExercise(id),
            fetchSets(id),
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
      workoutTimerRef.current = setInterval(() => {
        setWorkoutTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    }

    return () => {
      if (workoutTimerRef.current) {
        clearInterval(workoutTimerRef.current);
      }
    };
  }, [isWorkoutActive]);

  useEffect(() => {
    if (isSetTimerActive) {
      setTimerRef.current = setInterval(() => {
        setSetTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    } else {
      if (setTimerRef.current) {
        clearInterval(setTimerRef.current);
      }
    }

    return () => {
      if (setTimerRef.current) {
        clearInterval(setTimerRef.current);
      }
    };
  }, [isSetTimerActive]);

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutTimer(0);
    setSetTimer(0);
    setIsSetTimerActive(true);
    setCurrentWorkoutSets([]); // Clear current workout sets when starting a new workout
  };

  const pauseResumeSet = () => {
    setIsSetTimerActive(!isSetTimerActive);
  };

  const addSet = async () => {
    if (exercise && reps && weight) {
      const newSet: Omit<Set, "id" | "timestamp"> & { duration: number } = {
        repetitions: parseInt(reps),
        weight: parseFloat(weight),
        duration: setTimer,
      };
      try {
        const createdSet = await createSet(exercise.id, newSet);
        setAllSets((prevSets) => [...prevSets, createdSet] as Set[]);
        setCurrentWorkoutSets((prevSets) => [...prevSets, createdSet] as Set[]);
        setReps("");
        setWeight("");
        setSetTimer(0);
        setIsSetTimerActive(false);
      } catch (error) {
        console.error("Failed to add set:", error);
      }
    }
  };
  console.log(currentWorkoutSets);

  const endWorkout = () => {
    setIsWorkoutActive(false);
    setIsSetTimerActive(false);
    setWorkoutTimer(0);
    setSetTimer(0);
    setReps("");
    setWeight("");
    setCurrentWorkoutSets([]); // Clear current workout sets when ending the workout
  };

  const formatTime = (time: string | number): string => {
    if (typeof time === "string") {
      // Handle ISO date string
      const date = new Date(time);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else if (typeof time === "number") {
      // Handle number of seconds
      const mins = Math.floor(time / 60);
      const secs = time % 60;
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return "Invalid time format";
  };

  const calculateDifference = (current: number, previous: number) => {
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
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{exercise?.name} Details</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Workout Session
            <div className="text-2xl font-semibold">
              {formatTime(workoutTimer)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isWorkoutActive && (
            <Button onClick={startWorkout}>
              <PlayCircle className="mr-2 h-4 w-4" /> Start Workout
            </Button>
          )}
          {isWorkoutActive && (
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
                <Button onClick={addSet}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Set
                </Button>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-1">
                  <Button onClick={pauseResumeSet}>
                    {isSetTimerActive ? (
                      <PauseCircle className="mr-2 h-4 w-4" />
                    ) : (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    {isSetTimerActive ? "Pause Set" : "Resume Set"}
                  </Button>
                  <Button onClick={endWorkout} variant="destructive">
                    <StopCircle className="mr-2 h-4 w-4" /> End Workout
                  </Button>
                </div>
              </div>
              <div className="text-lg font-semibold">
                Set Time: {formatTime(setTimer)}
              </div>

              {/* Updated section for current workout sets */}
              {currentWorkoutSets.length > 0 && (
                <div className="mt-4">
                  <ul className="space-y-2">
                    {currentWorkoutSets.map((set, index) => {
                      const prevSet =
                        index > 0 ? currentWorkoutSets[index - 1] : null;
                      const repsDiff = prevSet
                        ? calculateDifference(
                            set.repetitions,
                            prevSet.repetitions
                          )
                        : null;
                      const weightDiff = prevSet
                        ? calculateDifference(set.weight, prevSet.weight)
                        : null;
                      const durationDiff = prevSet
                        ? calculateDifference(set.timestamp, prevSet.timestamp)
                        : null;

                      return (
                        <li
                          key={set.id}
                          className="bg-secondary p-2 rounded-md"
                        >
                          <div>
                            {set.repetitions} reps at {set.weight} kg (Duration:{" "}
                            {formatTime(set.timestamp)})
                          </div>
                          {prevSet && (
                            <div className="text-sm mt-1">
                              <span className="mr-2">
                                Reps: {repsDiff.icon} {repsDiff.value}
                              </span>
                              <span className="mr-2">
                                Weight: {weightDiff.icon} {weightDiff.value} kg
                              </span>
                              <span>
                                Duration: {durationDiff.icon}{" "}
                                {formatTime(durationDiff.value)}
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
