"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	CheckCircle2,
	ChevronUp,
	ChevronDown,
	Clock,
	Pause,
	Play,
	TimerOff,
	Timer,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
	createRoutine,
	createSet,
	deleteRoutine,
	fetchExercises,
	fetchRoutines,
	updateRoutine,
} from "@/lib/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useWorkoutProgression } from "./useWorkoutProgression";

export default function RoutinesPage() {
	// Routine states
	const [routines, setRoutines] = useState([]);
	const [selectedWorkout, setSelectedWorkout] = useState(null);
	const [newRoutineName, setNewRoutineName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);

	// Exercise states
	const [everyExercise, setEveryExercise] = useState([]);
	const [exercises, setExercises] = useState([]);
	const [workoutSets, setWorkoutSets] = useState([]);
	const { workoutSessions, getRecommendedWorkout } = useWorkoutProgression(
		everyExercise,
		{
			minReps: 10,
			maxReps: 15,
			weightIncrement: 2.5,
		}
	);
	const [activeExercises, setActiveExercises] = useState([]);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(null);

	const { toast } = useToast();

	useEffect(() => {
		loadRoutines();
		loadAllExercises();
	}, []);

	useEffect(() => {
		const interval = setInterval(updateActiveExerciseTimes, 1000);
		return () => clearInterval(interval);
	}, []);

	// API functions
	const loadRoutines = async () => {
		try {
			const fetchedRoutines = await fetchRoutines();
			setRoutines(fetchedRoutines);
		} catch (error) {
			handleApiError("Failed to fetch routines:", error);
		}
	};

	const loadAllExercises = async () => {
		const fetchedEveryExercise = await fetchExercises();
		setEveryExercise(fetchedEveryExercise);
	};

	// Helper functions
	const handleApiError = (message, error) => {
		console.error(message, error);
		toast({
			title: "Error",
			description: `${message} Please try again.`,
			variant: "destructive",
		});
	};

	const updateActiveExerciseTimes = () => {
		setActiveExercises((prev) =>
			prev.map((exercise) => ({
				...exercise,
				exerciseTime: exercise.active
					? exercise.exerciseTime + 1
					: exercise.exerciseTime,
				setTime:
					exercise.active && !exercise.resting && !exercise.paused
						? exercise.setTime + 1
						: exercise.setTime,
				restTime:
					exercise.active && exercise.resting && !exercise.paused
						? exercise.restTime + 1
						: exercise.restTime,
			}))
		);
	};

	const formatTime = (time) => {
		const minutes = Math.floor(time / 60);
		const seconds = time % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	};

	// Event handlers
	const handleCreateRoutine = async (e) => {
		e.preventDefault();
		if (newRoutineName.trim()) {
			try {
				const newRoutine = await createRoutine({
					name: newRoutineName.trim(),
					exercises: [],
					sets: {},
				});
				setRoutines((prev) => [...prev, newRoutine]);
				setNewRoutineName("");
				toast({
					title: "Success",
					description: "Routine created successfully",
				});
			} catch (error) {
				handleApiError("Failed to create routine:", error);
			}
		}
	};

	const handleDeleteRoutine = async (id) => {
		try {
			await deleteRoutine(id);
			setRoutines((prev) => prev.filter((routine) => routine.id !== id));
			toast({
				title: "Success",
				description: "Routine deleted successfully",
			});
		} catch (error) {
			handleApiError("Failed to delete routine:", error);
		}
	};

	const handleWorkoutChange = (value) => {
		const selectedRoutine = routines.find((routine) => routine.id === value);
		if (!selectedRoutine) return;

		const updatedExercises = selectedRoutine.exercises.map((exerciseId) => ({
			...everyExercise.find((e) => e.id === exerciseId),
			completed: false,
			sets: 0,
		}));

		setSelectedWorkout(selectedRoutine);
		setExercises(updatedExercises);
		setWorkoutSets(selectedRoutine.sets.split(",").map(Number));
		setActiveExercises([]);
		setCurrentExerciseIndex(null);
	};

	const toggleExercise = (index) => {
		setActiveExercises((prev) => {
			const isInList = prev.some((e) => e.index === index);
			const isActive = prev.some((e) => e.index === index && e.active);
			const activeCount = prev.filter((e) => e.active).length;

			const exerciseId = exercises[index].id;

			if (isInList && !isActive) {
				// If the exercise is in the list and not active, remove it
				return prev.filter((e) => e.index !== index);
			} else if (!isInList) {
				// Remove all inactive exercises from the list if the exercise is not in the list
				const activeExercisesOnly = prev.filter((e) => e.active);

				// If there are no active exercises or the list is empty, add the new exercise as inactive
				if (activeCount === 0 || prev.length === 0) {
					return [
						...activeExercisesOnly,
						{
							index,
							id: exerciseId,
							active: false,
							exerciseTime: 0,
							setTime: 0,
							currentSet: 1,
							currentReps: "",
							currentWeight: "",
						},
					];
				} else {
					// Just add the new one as inactive, since all inactive exercises were already removed
					return [
						...activeExercisesOnly,
						{
							index,
							id: exerciseId,
							active: false,
							exerciseTime: 0,
							setTime: 0,
							currentSet: 1,
							currentReps: "",
							currentWeight: "",
						},
					];
				}
			}
			// If the exercise is in the list and active, do nothing (keep it in the list)
			return prev;
		});
		setCurrentExerciseIndex(index);
	};

	const startExercise = (index) => {
		setActiveExercises((prev) => {
			const isInList = prev.some((e) => e.index === index);
			if (!isInList) {
				// If the exercise is not in the list, add it as active
				return [
					...prev,
					{
						index,
						active: true,
						exerciseTime: 0,
						setTime: 0,
						restTime: 0,
						resting: false,
						paused: false,
						currentSet: 1,
						currentReps: "",
						currentWeight: "",
					},
				];
			} else {
				// If the exercise is already in the list, set it as active and reset timers
				return prev.map((e) =>
					e.index === index
						? {
								...e,
								active: true,
								setTime: 0,
								restTime: 0,
								resting: false,
								paused: false,
						  }
						: e
				);
			}
		});
	};

	const togglePause = (index) => {
		setActiveExercises((prev) =>
			prev.map((exercise) =>
				exercise.index === index
					? { ...exercise, paused: !exercise.paused }
					: exercise
			)
		);
	};

	const resumeExercise = (index) => {
		setActiveExercises((prev) =>
			prev.map((exercise) =>
				exercise.index === index
					? { ...exercise, resting: false, paused: false, setTime: 0 }
					: exercise
			)
		);
	};

	const addSet = useCallback(
		async (index) => {
			const exercise = activeExercises.find((ex) => ex.index === index);
			if (!exercise) {
				console.error("Exercise not found");
				return;
			}
			try {
				const newSet = await createSet(exercise.id, {
					repetitions: exercise.currentReps,
					weight: exercise.currentWeight,
					duration: exercise.setTime,
				});

				setActiveExercises((prevActiveExercises) =>
					prevActiveExercises.map((ex) =>
						ex.index === index
							? {
									...ex,
									setTime: 0,
									restTime: 0,
									resting: true,
									paused: false,
									currentSet: ex.currentSet + 1,
									currentWorkoutSets: [
										...(ex?.currentWorkoutSets || []),
										newSet,
									],
							  }
							: ex
					)
				);

				setExercises((prevExercises) =>
					prevExercises.map((prev) => {
						if (prev.id === exercise.id) {
							const newSetInfo = `${exercise.currentReps} reps @ ${exercise.currentWeight} kg`;
							return {
								...prev,
								sets: [
									...(prev.sets || []),
									{
										reps: exercise.currentReps,
										weight: exercise.currentWeight,
									},
								],
								setHistory: [...(prev.setHistory || []), newSetInfo],
							};
						}
						return prev;
					})
				);

				toast({
					title: "Success",
					description: "Set added successfully",
				});
			} catch (error) {
				console.error("Failed to add set:", error);
				toast({
					title: "Error",
					description: "Failed to add set. Please try again.",
					variant: "destructive",
				});
			}
		},
		[activeExercises, setActiveExercises, setExercises, toast, createSet]
	);

	const finishExercise = useCallback(
		(index) => {
			const exercise = exercises[index];

			setExercises((prevExercises) =>
				prevExercises.map((ex, i) =>
					i === index
						? {
								...ex,
								completed: true,
								lastWorkoutSets: `${
									activeExercises.find((e) => e.index === index)?.currentReps
								},${
									activeExercises.find((e) => e.index === index)?.currentWeight
								}`,
						  }
						: ex
				)
			);

			setActiveExercises((prevActiveExercises) =>
				prevActiveExercises.filter((e) => e.index !== index)
			);

			if (currentExerciseIndex === index) {
				const nextIncompleteIndex = exercises.findIndex(
					(e, i) => i > index && !e.completed
				);
				setCurrentExerciseIndex(
					nextIncompleteIndex !== -1 ? nextIncompleteIndex : null
				);
			}
		},
		[
			exercises,
			setExercises,
			setActiveExercises,
			currentExerciseIndex,
			setCurrentExerciseIndex,
		]
	);

	const handleTotalSetsChange = (index, change) => {
		setWorkoutSets((prevSets) => {
			const newSets = [...prevSets];
			newSets[index] = Math.max(1, newSets[index] + change); // Ensure the minimum number of sets is 1
			return newSets;
		});

		// If we're modifying the current exercise, update its state as well
		setActiveExercises((prevExercises) =>
			prevExercises.map((exercise) =>
				exercise.index === index
					? {
							...exercise,
							currentSet: Math.min(
								exercise.currentSet,
								Math.max(1, workoutSets[index] + change)
							),
					  }
					: exercise
			)
		);
	};

	const handleUpdateRoutine = async () => {
		if (!selectedWorkout) return;

		setIsUpdating(true);
		try {
			const updatedRoutine = await updateRoutine(selectedWorkout.id, {
				exercises: selectedWorkout.exercises,
				sets: workoutSets, // Convert the array to a comma-separated string
			});
			setRoutines((prev) =>
				prev.map((routine) =>
					routine.id === updatedRoutine.id ? updatedRoutine : routine
				)
			);
			setSelectedWorkout(updatedRoutine);
			toast({
				title: "Success",
				description: "Routine updated successfully",
			});
		} catch (error) {
			handleApiError("Failed to update routine:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	useEffect(() => {
		console.log("Workout sessions updated:", workoutSessions);
	}, [workoutSessions]);

	const renderExerciseCard = (exercise, index) => {
		const activeExercise = activeExercises.find((e) => e.index === index);
		console.log("Rendering exercise card for:", exercise.name);
		const recommendedWorkout = getRecommendedWorkout(exercise.id);
		console.log(
			"previous workout sets for this exercise:",
			exercise.lastWorkoutReps,
			"reps @",
			exercise.lastWorkoutWeight
		);
		console.log(
			"Recommended workout for",
			exercise.name,
			":",
			`${recommendedWorkout?.sets[0].reps} reps`,
			"at",
			recommendedWorkout?.sets[0].weight,
			"kg"
		);

		console.log(exercise);

		return (
			<Card
				key={index}
				className={`p-2 ${
					exercise.completed
						? "bg-green-100 dark:bg-green-900"
						: index === currentExerciseIndex
						? "bg-blue-100 dark:bg-blue-900"
						: ""
				}`}>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-2'>
						{exercise.completed ? (
							<CheckCircle2 className='h-5 w-5 text-green-500' />
						) : (
							<Checkbox
								id={`exercise-${index}`}
								checked={activeExercises.some(
									(e) =>
										e.index === index &&
										(e.active || index === currentExerciseIndex)
								)}
								onCheckedChange={() => toggleExercise(index)}
							/>
						)}
						<Label
							htmlFor={`exercise-${index}`}
							className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
							{exercise.name}
						</Label>
					</div>
					<div className='flex items-center space-x-2'>
						{activeExercise &&
							activeExercise.active &&
							index !== currentExerciseIndex && (
								<Button
									size='sm'
									variant='ghost'
									onClick={() => setCurrentExercise(index)}>
									{activeExercise.resting ? (
										<TimerOff className='h-4 w-4 mr-1' />
									) : (
										<Timer className='h-4 w-4 mr-1' />
									)}
									{formatTime(
										activeExercise.resting
											? activeExercise.restTime
											: activeExercise.exerciseTime
									)}
								</Button>
							)}
						<div className='text-xs text-muted-foreground'>
							Last: {exercise.lastRecordedSet?.split(",").slice(0, 1)} reps @{" "}
							{exercise.lastRecordedSet?.split(",").slice(1, 2)} kg
						</div>
						<div className='text-xs font-semibold'>
							Sets: {exercise.sets.length}/
							<Dialog>
								<DialogTrigger asChild>
									<span className='cursor-pointer underline'>
										{workoutSets[index]}
									</span>
								</DialogTrigger>
								<DialogContent className='sm:max-w-[425px]'>
									<DialogHeader>
										<DialogTitle>Adjust Total Sets</DialogTitle>
									</DialogHeader>
									<div className='flex items-center justify-center space-x-4'>
										<Button
											onClick={() => handleTotalSetsChange(index, -1)}
											size='sm'>
											<ChevronDown className='h-4 w-4' />
										</Button>
										<span className='text-2xl font-bold'>
											{workoutSets[index]}
										</span>
										<Button
											onClick={() => handleTotalSetsChange(index, 1)}
											size='sm'>
											<ChevronUp className='h-4 w-4' />
										</Button>
									</div>
									<Button
										onClick={handleUpdateRoutine}
										disabled={isUpdating}
										className='mt-4'>
										{isUpdating ? "Updating..." : "Update Routine"}
									</Button>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
				{activeExercises.some(
					(e) =>
						e.index === index && (e.active || index === currentExerciseIndex)
				) && (
					<div className='text-xs pt-1 text-muted-foreground'>
						Recommended:{" "}
						{recommendedWorkout ? (
							<span>
								Set : {recommendedWorkout.sets[0].reps} reps @{" "}
								{
									exercise.lastWorkoutWeight?.split(",")[
										exercise.lastWorkoutWeight.split(",").length - 1
									]
								}{" "}
								kg
							</span>
						) : (
							"Unable to calculate recommendation"
						)}
					</div>
				)}
				{exercise.setHistory && exercise.setHistory.length > 0 && (
					<div className='mt-2 flex'>
						{exercise.setHistory.map((set, index) => (
							<>
								<div
									key={index}
									className='list-group-item text-xs'>
									{set}
								</div>
								<span className='block w-[1px] mx-1 bg-gray-800'></span>
							</>
						))}
					</div>
				)}
			</Card>
		);
	};

	return (
		<Card className='w-full max-w-2xl mx-auto mt-4'>
			<CardHeader>
				<CardTitle className='text-xl sm:text-2xl text-center'>
					Workout Tracker
				</CardTitle>
			</CardHeader>
			<CardContent className='p-4 sm:p-6'>
				<div className='space-y-6'>
					<Select onValueChange={handleWorkoutChange}>
						<SelectTrigger className='w-full'>
							<SelectValue placeholder='Select a workout' />
						</SelectTrigger>
						<SelectContent>
							{routines.map((workout) => (
								<SelectItem
									key={workout.id}
									value={workout.id}>
									{workout.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{selectedWorkout && (
						<div className='space-y-6'>
							{currentExerciseIndex !== null && (
								<Card className='bg-muted'>
									<CardContent className='p-4 space-y-4'>
										<div className='flex justify-between items-center'>
											<div className='text-sm font-medium'>
												Exercise:{" "}
												{formatTime(
													activeExercises.find(
														(e) => e.index === currentExerciseIndex
													)?.exerciseTime || 0
												)}
											</div>
											<div className='text-sm'>
												{activeExercises.find(
													(e) => e.index === currentExerciseIndex
												)?.resting
													? `Rest: ${formatTime(
															activeExercises.find(
																(e) => e.index === currentExerciseIndex
															)?.restTime || 0
													  )}`
													: `Set: ${formatTime(
															activeExercises.find(
																(e) => e.index === currentExerciseIndex
															)?.setTime || 0
													  )}`}
											</div>
											<div className='text-sm font-semibold'>
												Sets:{" "}
												{activeExercises.find(
													(e) => e.index === currentExerciseIndex
												)?.currentSet || 1}
												/{workoutSets[currentExerciseIndex]}
											</div>
										</div>
										<div className='flex space-x-2'>
											<div className='flex-1'>
												<Label
													htmlFor='reps'
													className='text-xs'>
													Reps
												</Label>
												<Input
													id='reps'
													type='number'
													value={
														activeExercises.find(
															(e) => e.index === currentExerciseIndex
														)?.currentReps || ""
													}
													onChange={(e) => {
														setActiveExercises((prevActiveExercises) =>
															prevActiveExercises.map((exercise) =>
																exercise.index === currentExerciseIndex
																	? { ...exercise, currentReps: e.target.value }
																	: exercise
															)
														);
													}}
													className='h-8'
												/>
											</div>
											<div className='flex-1'>
												<Label
													htmlFor='weight'
													className='text-xs'>
													Weight (lbs)
												</Label>
												<Input
													id='weight'
													type='number'
													value={
														activeExercises.find(
															(e) => e.index === currentExerciseIndex
														)?.currentWeight || ""
													}
													onChange={(e) => {
														setActiveExercises((prevActiveExercises) =>
															prevActiveExercises.map((exercise) =>
																exercise.index === currentExerciseIndex
																	? {
																			...exercise,
																			currentWeight: e.target.value,
																	  }
																	: exercise
															)
														);
													}}
													className='h-8'
												/>
											</div>
										</div>
										<div className='flex space-x-2'>
											{activeExercises.some(
												(e) => e.index === currentExerciseIndex && e.active
											) ? (
												activeExercises.find(
													(e) => e.index === currentExerciseIndex
												)?.resting ? (
													<Button
														onClick={() => resumeExercise(currentExerciseIndex)}
														size='sm'
														className='flex-1'>
														<Play className='h-4 w-4 mr-2' />
														Resume Exercise
													</Button>
												) : (
													<Button
														onClick={() => togglePause(currentExerciseIndex)}
														size='sm'
														className='flex-1'>
														{activeExercises.find(
															(e) => e.index === currentExerciseIndex
														)?.paused ? (
															<>
																<Play className='h-4 w-4 mr-2' />
																Resume
															</>
														) : (
															<>
																<Pause className='h-4 w-4 mr-2' />
																Pause
															</>
														)}
													</Button>
												)
											) : (
												<Button
													onClick={() => startExercise(currentExerciseIndex)}
													size='sm'
													className='flex-1'>
													Start Exercise
												</Button>
											)}
											<Button
												onClick={() => addSet(currentExerciseIndex)}
												disabled={
													!activeExercises.some(
														(e) =>
															e.index === currentExerciseIndex &&
															e.active &&
															!e.resting
													) ||
													activeExercises.find(
														(e) => e.index === currentExerciseIndex
													)?.currentSet >= workoutSets[currentExerciseIndex]
												}
												size='sm'
												className='flex-1'>
												Add Set
											</Button>
											<Button
												onClick={() => finishExercise(currentExerciseIndex)}
												disabled={
													!activeExercises.some(
														(e) => e.index === currentExerciseIndex
													)
												}
												size='sm'
												className='flex-1'>
												Finish Exercise
											</Button>
										</div>
									</CardContent>
								</Card>
							)}

							<div className='space-y-2'>
								{exercises.map((exercise, index) =>
									renderExerciseCard(exercise, index)
								)}
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
