import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Eye, Trash2 } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  set?: string;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onDeleteExercise: (id: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onDeleteExercise }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onDeleteExercise={onDeleteExercise}
        />
      ))}
    </div>
  );
};

interface Exercise {
  id: string;
  name: string;
  set?: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onDeleteExercise: (id: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onDeleteExercise }) => {
  const parseSet = (setString?: string) => {
    if (!setString) return { reps: 'N/A', weight: 'N/A', lastDone: 'Not done yet' };
    const [reps, weight, timestamp] = setString.split(',');
    const date = new Date(timestamp);
    return {
      reps,
      weight,
      lastDone: date.toLocaleDateString(),
    };
  };

  const { reps, weight, lastDone } = parseSet(exercise.set);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="font-medium">{exercise.name}</div>
          <div className="text-sm text-muted-foreground">
            Last done {lastDone}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-medium">{weight} kg</div>
            <div className="text-sm text-muted-foreground">{reps} reps</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
            >
              <Link href={`/exercises/${exercise.id}`}>
                <Eye className="w-4 h-4" />
                <span className="sr-only">View</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDeleteExercise(exercise.id)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};