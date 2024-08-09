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
          <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <g fill="#000000" stroke="none">
              <path d="M75,10 L85,10 L90,20 L85,30 L75,30 Z" />
              <path d="M70,30 L90,30 L95,40 L90,50 L70,50 Z" />
              <path d="M60,50 L100,50 L105,70 L100,90 L60,90 Z" />
              <path d="M55,90 L105,90 L110,110 L105,130 L55,130 Z" />
              <path d="M50,130 L110,130 L115,150 L110,170 L50,170 Z" />
              <path d="M45,170 L115,170 L120,190 L115,210 L45,210 Z" />
              <path d="M115,10 L125,10 L130,20 L125,30 L115,30 Z" />
              <path d="M110,30 L130,30 L135,40 L130,50 L110,50 Z" />
              <path d="M100,50 L140,50 L145,70 L140,90 L100,90 Z" />
              <path d="M95,90 L145,90 L150,110 L145,130 L95,130 Z" />
              <path d="M90,130 L150,130 L155,150 L150,170 L90,170 Z" />
              <path d="M85,170 L155,170 L160,190 L155,210 L85,210 Z" />
            </g>
          </svg>

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