import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Exercise, createExercise } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface ExerciseFormProps {
  onExerciseCreated: (exercise: Exercise, isOptimistic: boolean) => void;
  onExerciseCreateError: () => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ onExerciseCreated, onExerciseCreateError }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [sets, setSets] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && muscleGroup) {
      setIsSubmitting(true);
      const tempExercise: Exercise = {
        id: 'temp',
        name,
        description,
        muscleGroup,
        sets,
      };

      // Optimistic update
      onExerciseCreated(tempExercise, true);

      try {
        const createdExercise = await createExercise({ name, description, muscleGroup, sets });
        // Update with the real data from the server
        onExerciseCreated(createdExercise, false);
        toast({
          title: "Success",
          description: "Exercise created successfully",
        });
        setName('');
        setDescription('');
        setMuscleGroup('');
        setSets('');
      } catch (error) {
        console.error('Error creating exercise:', error);
        // Revert the optimistic update
        onExerciseCreateError();
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to create exercise. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Exercise</CardTitle>
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
                placeholder="Enter exercise name"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter exercise description"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="muscleGroup">Muscle Group</Label>
              <Input
                id="muscleGroup"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
                placeholder="Enter muscle group"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Exercise'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExerciseForm;