'use client'

import React from 'react';
import ExerciseProgressChart from '@/components/ProgressChart';

interface ExerciseData {
  id: number; // Changed type from string to number to match the provided data
  repetitions: number;
  weight: number;
  timestamp: string;
}

export default function Home() {
  const sampleData: ExerciseData[] = [
    { id: 1, timestamp: '2023-01-01', weight: 100, repetitions: 10 }, // Removed 'reps' and corrected 'repetitions'
    { id: 2, timestamp: '2023-01-08', weight: 105, repetitions: 12 }, // Removed 'reps' and corrected 'repetitions'
    { id: 3, timestamp: '2023-01-15', weight: 110, repetitions: 10 }, // Removed 'reps' and corrected 'repetitions'
    { id: 4, timestamp: '2023-01-22', weight: 115, repetitions: 8 },  // Removed 'reps' and corrected 'repetitions'
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Gym Tracker</h1>
      <div className="w-full max-w-4xl">
        {/* <ExerciseProgressChart data={sampleData} exerciseName="Bench Press" /> */}
      </div>
    </main>
  );
}