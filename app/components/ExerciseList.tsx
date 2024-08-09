'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

interface Exercise {
  id: string;
  name: string;
}

interface Set {
  id: string;
  exerciseId: string;
  repetitions: number;
  weight: number;
  timestamp: string;
}

const GymTrackerApp = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [sets, setSets] = useState<Set[]>([]);
  const [newSet, setNewSet] = useState({ repetitions: '', weight: '' });

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      fetchSets(selectedExercise);
    }
  }, [selectedExercise]);

  const fetchExercises = async () => {
    const response = await fetch('http://localhost:3002/api/exercises');
    const data = await response.json();
    setExercises(data);
  };

  const fetchSets = async (exerciseId: string) => {
    const response = await fetch(`http://localhost:3002/api/sets/${exerciseId}`);
    const data = await response.json();
    setSets(data);
  };

  const handleAddSet = async () => {
    if (selectedExercise && newSet.repetitions && newSet.weight) {
      const response = await fetch('http://localhost:3002/api/sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: selectedExercise,
          repetitions: parseInt(newSet.repetitions),
          weight: parseFloat(newSet.weight),
        }),
      });
      if (response.ok) {
        fetchSets(selectedExercise);
        setNewSet({ repetitions: '', weight: '' });
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gym Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Exercises</h2>
          </CardHeader>
          <CardContent>
            {exercises.map((exercise) => (
              <Button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise.id)}
                className="mr-2 mb-2"
                variant={selectedExercise === exercise.id ? "default" : "outline"}
              >
                {exercise.name}
              </Button>
            ))}
          </CardContent>
        </Card>
        {selectedExercise && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Sets</h2>
            </CardHeader>
            <CardContent>
              {sets.map((set) => (
                <div key={set.id} className="mb-2">
                  {set.repetitions} reps @ {set.weight} kg
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Input
                type="number"
                placeholder="Reps"
                value={newSet.repetitions}
                onChange={(e) => setNewSet({ ...newSet, repetitions: e.target.value })}
                className="mr-2"
              />
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={newSet.weight}
                onChange={(e) => setNewSet({ ...newSet, weight: e.target.value })}
                className="mr-2"
              />
              <Button onClick={handleAddSet}>Add Set</Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GymTrackerApp;