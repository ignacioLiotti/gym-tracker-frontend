'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ExerciseForm from '../../../components/ExerciseForm';
import { updateExercise, getExerciseById, Exercise } from '../../../services/exerciseService';

const EditExercisePage: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const data = await getExerciseById(id as string);
        setExercise(data);
      } catch (err) {
        console.error('Failed to fetch exercise', err);
        setError('Failed to fetch exercise');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [id]);

  const handleSave = async (data: FormData) => {
    const exerciseData = {
      id: data.get('id') as string,
      name: data.get('name') as string,
      description: data.get('description') as string,
      muscleGroup: data.get('muscleGroup') as string,
    };

    try {
      await updateExercise(id as string, exerciseData);
      router.push('/exercises');
    } catch (error) {
      console.error('Failed to update exercise', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Exercise</h1>
      {exercise && <ExerciseForm action={handleSave} defaultValues={exercise} />}
    </div>
  );
};

export default EditExercisePage;
