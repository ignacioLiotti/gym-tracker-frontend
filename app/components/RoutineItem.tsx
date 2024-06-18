import React from 'react';
import { Routine } from '@/app/services/routineService';
import Link from 'next/link';

interface RoutineItemProps {
  routine: Routine;
  onDelete: (id: string) => void;
}

const RoutineItem: React.FC<RoutineItemProps> = ({ routine, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold">{routine.name}</h2>
      <p className="text-gray-600">{routine.description}</p>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onDelete(routine.id)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
        <Link href={`/routines/${routine.id}`}>
          View
        </Link>
      </div>
    </div>
  );
};

export default RoutineItem;
