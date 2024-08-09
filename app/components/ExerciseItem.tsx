import React, { useEffect, useState, useRef } from 'react';
import { getExerciseById, deleteExercise, getExerciseSets, addSetToExercise, Exercise, Set } from '../services/exerciseService';
import ExerciseSetsChart from './ExerciseSetsChart';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ExerciseItemProps {
  exerciseId: string;
  onDelete?: (id: string) => void;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exerciseId, onDelete }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [exerciseSets, setExerciseSets] = useState<Set[]>([]);
  const [repetitions, setRepetitions] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [selected, setSelected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSets, setLoadingSets] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const data = await getExerciseById(exerciseId);
        setExercise(data);
      } catch (err) {
        console.error(`Error fetching exercise with ID: ${exerciseId}`, err);
        setError('Failed to fetch exercise');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  useEffect(() => {
    const fetchSets = async () => {
      if (selected) {
        setLoadingSets(true);
        try {
          const sets = await getExerciseSets(exerciseId);
          setExerciseSets(sets);
          if (sets.length > 0) {
            const lastSet = sets[sets.length - 1];
            setRepetitions(parseInt(lastSet.repetitions, 10));
            setWeight(parseFloat(lastSet.weight));
          }
        } catch (err) {
          console.error(`Error fetching sets for exercise ID: ${exerciseId}`, err);
        } finally {
          setLoadingSets(false);
        }
      }
    };

    fetchSets();
  }, [selected, exerciseId]);

  const handleAddSet = async () => {
    try {
      console.log('Adding set with data:', { repetitions, weight });
      await addSetToExercise(exerciseId, {
        repetitions: repetitions,
        weight: weight,
      });
      console.log('Set added successfully');
      const updatedSets = await getExerciseSets(exerciseId);
      setExerciseSets(updatedSets);
      if (updatedSets.length > 0) {
        const lastSet = updatedSets[updatedSets.length - 1];
        setRepetitions(parseInt(lastSet.repetitions, 10));
        setWeight(parseFloat(lastSet.weight));
      }
    } catch (err) {
      console.error('Failed to add set', err);
      if (err.response) {
        console.error('Server error response:', err.response.data);
      }
      setError('Failed to add set. Please try again.');
    }
  };

  const incrementRef = useRef<NodeJS.Timeout | null>(null);
  const pressDurationRef = useRef<number>(0);

  const handleLongPress = (action: (value: number) => void, value: number) => {
    pressDurationRef.current = 0;
    incrementRef.current = setInterval(() => {
      pressDurationRef.current += 1;

      if (pressDurationRef.current >= 3) {
        const nextFactorOfFive = Math.ceil((value + 1) / 5) * 5;
        action(nextFactorOfFive - value + 5 * (pressDurationRef.current - 3));
      } else {
        action(value);
      }
    }, 1000);
  };

  const stopLongPress = () => {
    if (incrementRef.current) {
      clearInterval(incrementRef.current);
      incrementRef.current = null;
      pressDurationRef.current = 0;
    }
  };

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(prev => Math.max(0, prev + value));
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(prev => Math.max(0, prev - value));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <Card className="w-full max-w-sm p-6 grid gap-4 h-min">
      {exercise && (
        <>
          <div className="grid gap-2">
            <CardTitle>{exercise.name}</CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <DumbbellIcon className="w-5 h-5" />
              {exercise.muscleGroup}
            </div>
          </div>
          <Link
            href="#"
            onClick={() => setSelected(!selected)}
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
          >
            {selected ? 'Hide Sets' : 'View Sets'}
          </Link>
          {selected && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Add Set</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reps">Reps</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDecrement(setRepetitions, 1)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      id="reps"
                      type="number"
                      value={repetitions}
                      onChange={(e) => setRepetitions(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleIncrement(setRepetitions, 1)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight">Weight</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleDecrement(setWeight, 2.5)}
                    >
                      <MinusIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 text-center"
                      step="2.5"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleIncrement(setWeight, 2.5)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddSet} className="w-full mt-4">
                Submit
              </Button>
              {loadingSets ? (
                <p>Loading sets...</p>
              ) : (
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-lg w-full shadow-md h-72" style={{ height: '500px' }}>
                    <ExerciseSetsChart sets={exerciseSets} />
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default ExerciseItem;

function DumbbellIcon(props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.4 14.4 9.6 9.6" />
      <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
      <path d="m21.5 21.5-1.4-1.4" />
      <path d="M3.9 3.9 2.5 2.5" />
      <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z" />
    </svg>
  )
}