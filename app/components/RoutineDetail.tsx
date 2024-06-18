// RoutineDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getRoutineById, Routine } from '../services/routineService';
import { getExercises, Exercise } from '../services/exerciseService';
import ExerciseItem from './ExerciseItem';

const RoutineDetail: React.FC = () => {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();
  useEffect(() => {
    const fetchRoutine = async () => {
      if (id) {
        try {
          const routineData = await getRoutineById(id as string);
          setRoutine(routineData);
          const exerciseData = await getExercises();
          const filteredExercises = exerciseData.filter(exercise => routineData.exercises.includes(exercise.id));
          setExercises(filteredExercises);
        } catch (err) {
          console.error('Failed to fetch routine details', err);
          setError('Failed to fetch routine details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRoutine();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-4">
      {routine && (
        <>
          <h1 className="text-2xl font-bold mb-4">{routine.name}</h1>
          <p className="text-gray-600 mb-4">{routine.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map(exercise => (
              <ExerciseItem key={exercise.id} exerciseId={exercise.id} onDelete={() => { }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RoutineDetail;
