'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Routine, getRoutineById } from '@/app/services/routineService';
import ExerciseItem from '@/app/components/ExerciseItem';

const RoutinePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Get the routine ID from the URL
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchRoutine = async () => {
        try {
          const data = await getRoutineById(id as string);
          setRoutine(data);
        } catch (err) {
          console.error('Failed to fetch routine', err);
          setError('Failed to fetch routine');
        } finally {
          setLoading(false);
        }
      };

      fetchRoutine();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  console.log(routine?.exercises)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Routine Details</h1>
      {/* {routine && (
        <>
          <h2 className="text-xl font-semibold">{routine[1]}</h2>
           <p>{routine[2]}</p>
          <h3 className="text-lg font-semibold mt-4">Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routine?.exercises?.map(exerciseId => (
              <ExerciseItem key={exerciseId} exerciseId={exerciseId} />
            ))}
          </div>
        </>
      )} */}
    </div>
  );
};

export default RoutinePage;
