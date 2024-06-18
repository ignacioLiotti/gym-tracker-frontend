// CreateRoutine.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createRoutine } from '../services/routineService';
import ExerciseSelector from './ExerciseSelector';

const CreateRoutine: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createRoutine({ name, description, exercises: selectedExercises });
      router.push('/routines');
    } catch (error) {
      console.error('Failed to create routine', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Routine</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <ExerciseSelector selectedExercises={selectedExercises} setSelectedExercises={setSelectedExercises} />
        <button
          type="submit"
          className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Routine
        </button>
      </form>
    </div>
  );
};

export default CreateRoutine;
