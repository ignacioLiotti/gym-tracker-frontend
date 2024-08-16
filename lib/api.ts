// src/lib/api.ts
// create the createsetresponse interface

// .env file
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

export interface Exercise {
	id: string;
	name: string;
	description: string;
	muscleGroup: string;
	sets: string;
}

export interface Set {
	id: string;
	repetitions: number;
	weight: number;
	timestamp: string;
	duration: number;
}

export interface CreateSetResponse {
	id: string;
	repetitions: number;
	weight: number;
	timestamp: string;
	duration: number;
	set: Set;
	updatedExercise: Exercise;
}

async function apiCall<T>(
	endpoint: string,
	method: string = "GET",
	body?: any
): Promise<T> {
	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers: {
			"Content-Type": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!response.ok) {
		throw new Error(`API call failed: ${response.statusText}`);
	}

	return response.json();
}

export const fetchExercises = (): Promise<Exercise[]> => apiCall("/exercises");

export const fetchExercise = (id: string): Promise<Exercise> =>
	apiCall(`/exercises/${id}`);

export const createExercise = (
	exercise: Omit<Exercise, "id">
): Promise<Exercise> => apiCall("/exercises", "POST", exercise);

export const deleteExercise = (id: string): Promise<void> =>
	apiCall(`/exercises/${id}`, "DELETE");

export const fetchSets = (exerciseId: string): Promise<Set[]> =>
	apiCall(`/exercises/${exerciseId}/sets`);

export const deleteRoutine = async (id: string): Promise<void> => {
	const response = await fetch(`${API_BASE_URL}/routines/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete routine");
	}
};

export const createSet = async (
	exerciseId: string,
	set: Omit<Set, "id" | "timestamp">
): Promise<CreateSetResponse> => {
	const response = await apiCall<CreateSetResponse>(
		`/exercises/${exerciseId}/sets`,
		"POST",
		set
	);
	console.log(set);
	return response;
};

export const deleteSet = (exerciseId: string, setId: string): Promise<void> =>
	apiCall(`/exercises/${exerciseId}/sets/${setId}`, "DELETE");

export interface Routine {
	id: string;
	name: string;
	exercises: string[];
}

export const fetchRoutines = (): Promise<Routine[]> => apiCall("/routines");

export const fetchRoutine = (id: string): Promise<Routine> =>
	apiCall(`/routines/${id}`);

export const createRoutine = (routine: Omit<Routine, "id">): Promise<Routine> =>
	apiCall("/routines", "POST", routine);

export const deleteExerciseFromRoutine = (
	routineId: string,
	exerciseId: string
): Promise<void> =>
	apiCall(`/routines/${routineId}/exercises/${exerciseId}`, "DELETE");

export const addExerciseToRoutine = (
	routineId: string,
	exerciseId: string
): Promise<Routine> =>
	apiCall(`/routines/${routineId}/exercises`, "POST", { exerciseId });
