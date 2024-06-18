'use client';
import React, { useEffect, useState } from 'react';
import { getExercises, deleteExercise, Exercise } from '../services/exerciseService';
import ExerciseItem from './ExerciseItem';

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        console.error('Failed to fetch exercises', err);
        setError('Failed to fetch exercises');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteExercise(id);
      setExercises(exercises.filter(exercise => exercise.id !== id));
    } catch (err) {
      console.error('Failed to delete exercise', err);
      setError('Failed to delete exercise');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  console.log(exercises);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exercises.map(exercise => (
        <ExerciseItem key={exercise.id} exerciseId={exercise.id} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default ExerciseList;
