import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchRoutines, deleteRoutine } from '@/lib/api';

interface Routine {
  id: string;
  name: string;
  description: string;
}

const RoutineList: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const loadRoutines = async () => {
      const data = await fetchRoutines();
      setRoutines(data);
    };
    loadRoutines();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteRoutine(id);
    setRoutines(routines.filter(routine => routine.id !== id));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routines.map((routine) => (
          <TableRow key={routine.id}>
            <TableCell>{routine.name}</TableCell>
            <TableCell>{routine.description}</TableCell>
            <TableCell>
              <Link href={`/routines/${routine.id}`}>
                <Button variant="outline" className="mr-2">View</Button>
              </Link>
              <Button variant="destructive" onClick={() => handleDelete(routine.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RoutineList;