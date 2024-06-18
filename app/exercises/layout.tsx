import { ReactNode } from 'react';

export default function ExercisesLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <h1>Exercises</h1>
      {children}
    </div>
  );
}
