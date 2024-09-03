import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash } from "lucide-react";
import { WorkoutForm } from "@/components/WorkoutForm";
import { fetchExerciseLastWorkout } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";

// interface RoutineExercise {
//   id: string;
//   name: string;
//   isWorkoutActive: boolean;
//   setTimer?: number;
//   workoutTimer: number;
//   isSetTimerActive: boolean;
//   currentWorkoutSets: any[]; // Replace 'any' with the correct type if known
//   description: string;
//   // Add any other properties that RoutineExercise might have
// }

// interface Set {
//   id: string;
//   reps: number;
//   weight: number;
// }

// interface ExerciseCardProps {
//   exercise: RoutineExercise;
//   handleRemoveExercise: (id: string) => void;
//   handleAddSet: (exerciseId: string, reps: number, weight: number, setTimer?: number) => void;
//   handleEndWorkout: (exerciseId: string) => void;
//   updateExercise: (exercise: RoutineExercise) => void;
//   handleStartWorkout: (exerciseId: string) => void;
// }

const ExerciseCard = ({
	exercise,
	handleRemoveExercise,
	handleAddSet,
	handleEndWorkout,
	updateExercise,
	handleStartWorkout,
}) => {
	const [lastSets, setLastSets] = useState([]);
	const [isChecked, setIsChecked] = useState(false);

	useEffect(() => {
		const fetchLastSets = async () => {
			try {
				const sets = await fetchExerciseLastWorkout(exercise.id);
				console.log("Last sets:", sets);
				// Ensure that the returned sets match the Set interface
				const setsArray = Array.isArray(sets)
					? sets.map((set) => ({
							id: set.id || "",
							reps: set.reps || 0,
							weight: set.weight || 0,
					  }))
					: [];
				setLastSets(typedSets);
			} catch (error) {
				console.error("Error fetching last sets:", error);
				setLastSets([]);
			}
		};

		fetchLastSets();
	}, [exercise.id]);

	const handleCheckboxChange = (checked) => {
		setIsChecked(checked);
	};

	const handleEndWorkout2 = (exerciseId) => {
		setIsChecked(true);
		handleEndWorkout(exerciseId);
	};

	return (
		<Card
			key={exercise.id}
			className='mb-4'>
			<CardHeader>
				<CardTitle className='flex justify-between items-center'>
					<div className='flex items-center space-x-2'>
						<Checkbox
							id={`exercise-${exercise.id}`}
							checked={isChecked}
							onCheckedChange={handleCheckboxChange}
						/>
						<label
							htmlFor={`exercise-${exercise.id}`}
							className={`font-medium text-2xl ${
								isChecked ? "line-through" : ""
							}`}>
							{exercise.name}
						</label>
					</div>
					<div className='flex gap-2'>
						<Button
							size='icon'
							variant='destructive'
							className='size-7'
							onClick={() => handleRemoveExercise(exercise.id)}>
							<Trash className='size-4' />
						</Button>
						<Button
							variant='outline'
							size='icon'
							className='size-7'>
							<Link href={`/exercises/${exercise.id}`}>
								<Eye className='w-4 h-4' />
								<span className='sr-only'>View</span>
							</Link>
						</Button>
					</div>
				</CardTitle>
			</CardHeader>
			<CardFooter className='flex justify-between items-start flex-col'>
				{exercise.isWorkoutActive ? (
					<WorkoutForm
						exercise={exercise}
						onAddSet={(reps, weight) =>
							handleAddSet(exercise.id, reps, weight, exercise.setTimer)
						}
						onEndWorkout={() => handleEndWorkout2(exercise.id)}
						onUpdateExercise={updateExercise}
					/>
				) : (
					<Button onClick={() => handleStartWorkout(exercise.id)}>
						Start Workout
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};

export default ExerciseCard;
