'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import ExerciseForm from '../../../components/ExerciseForm';
import { updateExercise, getExerciseById, createExercise, getExercises } from '../../../services/exerciseService';

export const action = async (data: FormData) => {
  const exercise = {
    id: data.get('id') as string,
    name: data.get('name') as string,
    description: data.get('description') as string,
    muscleGroup: data.get('muscleGroup') as string,
  };

  try {
    await updateExercise(Number(exercise.id), exercise);
    // redirect('/exercises');
  } catch (error) {
    console.error('Failed to update exercise', error);
  }
};

const EditExercisePage: React.FC = ({ params }) => {
  const [exercise, setExercise] = React.useState(null);

  React.useEffect(() => {
    const fetchExercise = async () => {
      const data = await getExerciseById(params.id);
      setExercise(data);
    };

    fetchExercise();
  }, [params.id]);

  if (!exercise) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Exercise</h1>
      <ExerciseForm action={action} defaultValues={exercise} />
    </div>
  );
};

export default EditExercisePage;
