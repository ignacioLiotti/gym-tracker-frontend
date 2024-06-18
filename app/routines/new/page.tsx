'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getExercises, Exercise } from '../../services/exerciseService';
import { createRoutine } from '../../services/routineService';

const NewRoutinePage: React.FC = () => {
  // const router = useRouter();
  const [name, setName] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createRoutine({ name, exercises: selectedExercises });
      // router.push('/routines');
    } catch (err) {
      console.error('Failed to create routine', err);
      setError('Failed to create routine');
    }
  };

  const handleExerciseChange = (exerciseId: string) => {
    setSelectedExercises(prevState =>
      prevState.includes(exerciseId)
        ? prevState.filter(id => id !== exerciseId)
        : [...prevState, exerciseId]
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Routine</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Routine Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">Select Exercises</h2>
          {exercises.map(exercise => (
            <div key={exercise.id} className="mb-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={exercise.id}
                  onChange={() => handleExerciseChange(exercise.id)}
                  className="form-checkbox"
                />
                <span className="ml-2">{exercise.name}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Create Routine
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRoutinePage;
