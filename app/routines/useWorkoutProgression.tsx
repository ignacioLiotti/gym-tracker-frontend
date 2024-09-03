import { useState, useEffect, useCallback } from 'react';

interface Exercise {
  id: string;
  name: string;
  lastWorkoutReps: string;
  lastWorkoutWeight: string;
}

interface WorkoutSet {
  reps: number;
  weight: number;
}

interface WorkoutSession {
  exerciseId: string;
  sets: WorkoutSet[];
}

interface ProgressionConfig {
  minReps: number;
  maxReps: number;
  weightIncrement: number;
}

const defaultConfig: ProgressionConfig = {
  minReps: 10,
  maxReps: 15,
  weightIncrement: 2.5,
};

function mean(numbers: number[]): number {
  return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
}

function mode(numbers: number[]): number {
  const counts = numbers.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  let maxCount = 0;
  let modeValue = numbers[0];

  for (const [num, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      modeValue = parseInt(num);
    }
  }

  return modeValue;
}

export function useWorkoutProgression(exercises: Exercise[], initialConfig: Partial<ProgressionConfig> = {}) {
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [progressionConfig, setProgressionConfig] = useState<ProgressionConfig>({ ...defaultConfig, ...initialConfig });

  useEffect(() => {
    const initialSessions = exercises.map(exercise => ({
      exerciseId: exercise.id,
      sets: exercise.lastWorkoutReps.split(',').map((reps, index) => ({
        reps: parseInt(reps, 10) || 0,
        weight: parseFloat(exercise.lastWorkoutWeight.split(',')[index]) || 0
      }))
    }));
    setWorkoutSessions(initialSessions);
  }, [exercises]);

  const calculateNextSession = useCallback((exerciseId: string): WorkoutSession => {
    const currentSession = workoutSessions.find(session => session.exerciseId === exerciseId);
    if (!currentSession) throw new Error("Exercise not found");

    const { sets } = currentSession;
    const { minReps, maxReps, weightIncrement } = progressionConfig;

    // Remove faulty first set if applicable
    const validSets = sets[0].reps < 0.7 * mean(sets.slice(1).map(set => set.reps))
      ? sets.slice(1)
      : sets;

    // Handle mid-workout weight changes
    const mostCommonWeight = mode(validSets.map(set => set.weight));
    const setsWithCommonWeight = validSets.filter(set => set.weight === mostCommonWeight);

    const workoutMean = mean(setsWithCommonWeight.map(set => set.reps));
    const maxRepsAchieved = Math.max(...setsWithCommonWeight.map(set => set.reps));

    let newWeight = mostCommonWeight;
    let targetReps = maxRepsAchieved;

    if (workoutMean < minReps) {
      newWeight = Math.max(0, mostCommonWeight - weightIncrement);
      targetReps = Math.min(maxRepsAchieved + 1, maxReps);
    } else if (workoutMean > maxReps) {
      newWeight = mostCommonWeight + weightIncrement;
      targetReps = minReps;
    } else {
      targetReps = Math.min(maxRepsAchieved + 1, maxReps);
    }

    const newSets = sets.map(() => ({
      reps: targetReps,
      weight: newWeight
    }));

    return { exerciseId, sets: newSets };
  }, [workoutSessions, progressionConfig]);

  const getRecommendedWorkout = useCallback((exerciseId: string): WorkoutSession | undefined => {
    try {
      return calculateNextSession(exerciseId);
    } catch (error) {
      console.error(`Error calculating next session for exercise ${exerciseId}:`, error);
      return undefined;
    }
  }, [calculateNextSession]);

  return { workoutSessions, getRecommendedWorkout };
}