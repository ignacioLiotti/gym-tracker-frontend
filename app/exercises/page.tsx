'use client'

import React, { useState, useEffect } from 'react';
import ExerciseForm from '@/components/ExerciseForm';
import { ExerciseList } from '@/components/ExerciseList';
import { fetchExercises, deleteExercise, Exercise } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const fetchedExercises = await fetchExercises();

        setExercises(fetchedExercises);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        toast({
          title: "Error",
          description: "Failed to load exercises. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadExercises();
  }, []);

  const handleExerciseCreated = (newExercise: Exercise, isOptimistic: boolean) => {
    setExercises((prevExercises) => {
      if (isOptimistic) {
        return [...prevExercises, newExercise];
      } else {
        const updatedExercises = prevExercises.filter(ex => ex.id !== 'temp');
        return [...updatedExercises, newExercise];
      }
    });
  };

  const handleExerciseCreateError = () => {
    setExercises((prevExercises) => prevExercises.filter(ex => ex.id !== 'temp'));
  };

  const handleDeleteExercise = async (id: string) => {
    console.log('Attempting to delete exercise with ID:', id);
    try {
      await deleteExercise(id);
      setExercises((prevExercises) => prevExercises.filter(ex => ex.id !== id));
      toast({
        title: "Success",
        description: "Exercise deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      toast({
        title: "Error",
        description: "Failed to delete exercise. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Exercises</h1>
      <ExerciseForm
        onExerciseCreated={handleExerciseCreated}
        onExerciseCreateError={handleExerciseCreateError}
      />
      <ExerciseList
        exercises={exercises}
        onDeleteExercise={handleDeleteExercise}
      />
    </div>
  );
}