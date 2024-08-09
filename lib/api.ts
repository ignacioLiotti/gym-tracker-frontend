// src/lib/api.ts

// .env file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
}

interface CreateSetResponse {
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

export const createSet = async (
	exerciseId: string,
	set: Omit<Set, "id" | "timestamp">
): Promise<CreateSetResponse> => {
	const response = await apiCall<CreateSetResponse>(
		`/exercises/${exerciseId}/sets`,
		"POST",
		set
	);
	return response;
};

export const deleteSet = (exerciseId: string, setId: string): Promise<void> =>
	apiCall(`/exercises/${exerciseId}/sets/${setId}`, "DELETE");
