// ExerciseSelector.tsx
import React, { useEffect, useState } from 'react';
import { getExercises, Exercise } from '../../services/exerciseService';

interface ExerciseSelectorProps {
  selectedExercises: string[];
  setSelectedExercises: (exercises: string[]) => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ selectedExercises, setSelectedExercises }) => {
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

  const handleSelect = (id: string) => {
    setSelectedExercises(
      selectedExercises.includes(id)
        ? selectedExercises.filter(exerciseId => exerciseId !== id)
        : [...selectedExercises, id]
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold mb-2">Select Exercises</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map(exercise => (
          <div
            key={exercise.id}
            className={`p-4 rounded-lg shadow-md cursor-pointer ${selectedExercises.includes(exercise.id) ? 'bg-blue-200' : 'bg-white'
              }`}
            onClick={() => handleSelect(exercise.id)}
          >
            <h4 className="text-xl font-semibold">{exercise.name}</h4>
            <p className="text-gray-600">{exercise.description}</p>
            <span className="text-sm text-gray-500">Muscle Group: {exercise.muscleGroup}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseSelector;
