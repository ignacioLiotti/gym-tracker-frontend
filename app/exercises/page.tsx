import Link from 'next/link';
import ExerciseList from '../components/ExerciseList';

export default function ExercisesPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Exercises</h1>
        <Link href="/exercises/new">
          Add Exercise
        </Link>
      </div>
      <ExerciseList />
    </div>
  );
}
