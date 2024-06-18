'use client'
import React, { useEffect, useState } from 'react';
import RoutineItem from './RoutineItem';  // Ensure RoutineItem is properly implemented and imported
import Link from 'next/link';
import { Routine, deleteRoutine, getRoutines } from '@/app/services/routineService';

const RoutineList: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const data = await getRoutines();
        setRoutines(data);
      } catch (err) {
        console.error('Failed to fetch routines', err);
        setError('Failed to fetch routines');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteRoutine(id);
      setRoutines(routines.filter(routine => routine.id !== id));
    } catch (err) {
      console.error('Failed to delete routine', err);
      setError('Failed to delete routine');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Routines</h1>
      <Link href="/routines/new">
        Create Routine
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {routines.map(routine => (
          <RoutineItem key={routine.id} routine={routine} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default RoutineList;
