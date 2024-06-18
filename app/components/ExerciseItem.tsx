'use client'
import React, { useEffect, useState } from 'react';
import { getExerciseById, deleteExercise, getExerciseSets, addSetToExercise, Exercise, Set } from '../services/exerciseService';
import ExerciseSetsChart from './ExerciseSetsChart';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

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
      await addSetToExercise(exerciseId, { repetitions, weight });
      const updatedSets = await getExerciseSets(exerciseId);
      setExerciseSets(updatedSets);
      setRepetitions(0);
      setWeight(0);
    } catch (err) {
      console.error('Failed to add set', err);
    }
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
          {/* <Link
            href="#"
            onClick={() => onDelete(exercise.id)}
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            prefetch={false}
          >
            Delete
          </Link> */}
          <Link
            href="#"
            onClick={() => setSelected(!selected)}
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
            prefetch={false}
          >
            {selected ? 'Hide Sets' : 'View Sets'}
          </Link>
          {selected && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Add Set</h3>
              <div className="flex flex-col">
                <input
                  type="number"
                  placeholder="Repetitions"
                  value={repetitions}
                  onChange={(e) => setRepetitions(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="number"
                  placeholder="Weight"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                />
                <Link
                  href="#"
                  onClick={handleAddSet}
                  className="inline-flex h-9 items-center justify-center rounded-md bg-green-600 px-4 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-green-600/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  prefetch={false}
                >
                  Add Set
                </Link>
              </div>
              {loadingSets ? (
                <p>Loading sets...</p>
              ) : (
                <div className="mt-4">
                  <h2 className="text-lg font-bold mb-2">Sets for Exercise ID: {exercise.id}</h2>
                  <div className="bg-white p-4 rounded-lg w-full shadow-md">
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


function DumbbellIcon(props) {
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