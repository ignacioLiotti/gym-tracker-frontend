'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';
import { fetchRoutines, createRoutine, Routine } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const fetchedRoutines = await fetchRoutines();
      setRoutines(fetchedRoutines);
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      toast({
        title: "Error",
        description: "Failed to load routines. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoutineName.trim()) {
      try {
        const newRoutine = await createRoutine({ name: newRoutineName.trim() });
        setRoutines([...routines, newRoutine]);
        setNewRoutineName('');
        toast({
          title: "Success",
          description: "Routine created successfully",
        });
      } catch (error) {
        console.error('Failed to create routine:', error);
        toast({
          title: "Error",
          description: "Failed to create routine. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Routines</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Routine</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRoutine} className="flex gap-2">
            <Input
              value={newRoutineName}
              onChange={(e) => setNewRoutineName(e.target.value)}
              placeholder="Enter routine name"
            />
            <Button type="submit">Add Routine</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routines.map((routine) => (
          <Card key={routine.id}>
            <CardHeader>
              <CardTitle>{routine.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/routines/${routine.id}`}>
                <Button>View Routine</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}