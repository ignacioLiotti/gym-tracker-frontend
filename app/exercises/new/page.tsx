'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExerciseForm from '../../components/ExerciseForm';
import { createExercise } from '../../services/exerciseService';

export interface ExerciseInput {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
}

const NewExercisePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (data: FormData) => {
    const exercise: ExerciseInput = {
      id: data.get('id') as string,
      name: data.get('name') as string,
      description: data.get('description') as string,
      muscleGroup: data.get('muscleGroup') as string,
    };

    try {
      setLoading(true);
      await createExercise(exercise);
      router.push('/exercises');
    } catch (error) {
      console.error('Failed to create exercise', error);
      setError('Failed to create exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Exercise</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ExerciseForm />
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default NewExercisePage;

