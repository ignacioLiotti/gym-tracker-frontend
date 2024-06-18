'use server'
import React from 'react';
import ExerciseForm from '../../components/ExerciseForm';
import { redirect } from 'next/navigation';
import { createExercise } from '../../services/exerciseService';

export const action = async (data: FormData) => {
  const exercise = {
    name: data.get('name') as string,
    description: data.get('description') as string,
    muscleGroup: data.get('muscleGroup') as string,
  };

  try {
    await createExercise(exercise);
    // redirect('/exercises');
  } catch (error) {
    console.error('Failed to create exercise', error);
  }
};

const NewExercisePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Exercise</h1>
      <ExerciseForm action={action} />
    </div>
  );
};

export default NewExercisePage;
