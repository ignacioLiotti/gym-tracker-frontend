import { Minus, PauseCircle, PlayCircle, Plus, StopCircle, TimerIcon, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CreateSetResponse, Exercise, Set } from "@/lib/api";

interface SharedSetProperties {
  repetitions: number;
  weight: number;
  duration: number;
}

interface RoutineExercise extends Exercise {
  lastDone?: string;
  isWorkoutActive: boolean;
  workoutTimer: number;
  setTimer: number;
  isSetTimerActive: boolean;
  currentWorkoutSets: (Set | CreateSetResponse)[];
}

// Type guard function to check if an object is of type Set
function isSet(obj: Set | CreateSetResponse): obj is Set {
  return 'id' in obj;
}

// Helper function to safely access properties
function getSetProperty(set: Set | CreateSetResponse, key: string): number | undefined {
  return (set as any)?.[key];
}

interface WorkoutFormProps {
  exercise: RoutineExercise;
  onAddSet: (reps: number, weight: number, duration: number) => void;
  onEndWorkout: () => void;
  onUpdateExercise: (exercise: RoutineExercise) => void;
}

export function WorkoutForm({ exercise, onAddSet, onEndWorkout, onUpdateExercise }: WorkoutFormProps) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [localWorkoutTimer, setLocalWorkoutTimer] = useState(exercise.workoutTimer);
  const [localSetTimer, setLocalSetTimer] = useState(exercise.setTimer);
  const [lastSetSubmissionTime, setLastSetSubmissionTime] = useState<number | null>(null);

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
      setLastSetSubmissionTime(Date.now());
      setLocalSetTimer(0);
      // Pause the set timer after submission
      onUpdateExercise({
        ...exercise,
        isSetTimerActive: false
      });
    }
  };

  const pauseResumeSet = () => {
    onUpdateExercise({
      ...exercise,
      isSetTimerActive: !exercise.isSetTimerActive
    });
    // Reset lastSetSubmissionTime when resuming the timer
    if (!exercise.isSetTimerActive) {
      setLastSetSubmissionTime(null);
    }
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
          Workout Time:
          <span className='text-3xl font-bold text-black'>
            {formatTime(localWorkoutTimer)}
          </span>
        </div>
        <div className="text-lg font-semibold text-slate-400 flex flex-col">
          {lastSetSubmissionTime && !exercise.isSetTimerActive ? (
            <>
              Resting Time:
              <span className='text-3xl font-bold text-black'>
                {formatTime(Math.floor((Date.now() - lastSetSubmissionTime) / 1000))}
              </span>
            </>
          ) : (
            <>
              Set Time:
              <span className='text-3xl font-bold text-black'>
                {formatTime(localSetTimer)}
              </span>
            </>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
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