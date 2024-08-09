import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchExercises } from '@/lib/api';

interface Exercise {
  id: string;
  name: string;
}

const RoutineForm: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  useEffect(() => {
    const loadExercises = async () => {
      const data = await fetchExercises();
      setExercises(data);
    };
    loadExercises();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description && selectedExercises.length > 0) {
      // await createRoutine({ name, description, exercises: selectedExercises });
      setName('');
      setDescription('');
      setSelectedExercises([]);
      // You might want to trigger a refetch of the routine list here
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Routine</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter routine name"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter routine description"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="exercises">Exercises</Label>
              <Select
                onValueChange={(value) => setSelectedExercises([...selectedExercises, value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exercises" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id}>{exercise.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              Selected exercises:
              {selectedExercises.map((id) => (
                <span key={id} className="ml-2 p-1 bg-gray-200 rounded">
                  {exercises.find(e => e.id === id)?.name}
                  <button onClick={() => setSelectedExercises(selectedExercises.filter(e => e !== id))}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Create Routine</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoutineForm;