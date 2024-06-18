import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:5000/api",
});

export interface Exercise {
	id: string;
	name: string;
	description: string;
	muscleGroup: string;
	sets?: Set[];
}

export interface Set {
	id: string;
	exerciseId: string;
	repetitions: number;
	weight: number;
}

export const getExercises = async (): Promise<Exercise[]> => {
	const response = await api.get("/exercises");
	return response.data;
};

export const getExerciseById = async (id: string): Promise<Exercise> => {
	const response = await api.get(`/exercises/${id}`);
	return response.data;
};

export const createExercise = async (exercise: Exercise): Promise<Exercise> => {
	const response = await api.post("/exercises", exercise);
	return response.data;
};

export const updateExercise = async (
	id: string,
	exercise: Partial<Exercise>
): Promise<void> => {
	await api.put(`/exercises/${id}`, exercise);
};

export const deleteExercise = async (id: string): Promise<void> => {
	await api.delete(`/exercises/${id}`);
};

export const addSetToExercise = async (
	exerciseId: string,
	set: Set
): Promise<void> => {
	console.log("exerciseId", exerciseId);
	await api.post(`/exercises/${exerciseId}/sets`, set);
};

export const getSetsByExerciseId = async (
	exerciseId: string
): Promise<Set[]> => {
	const response = await api.get(`/exercises/${exerciseId}/sets`);
	return response.data;
};

// Update the function that fetches sets for an exercise in exerciseService.ts
export const getExerciseSets = async (id: string) => {
	try {
		const response = await api.get(`/exercises/${id}/sets`);
		return response.data;
	} catch (error) {
		console.error(`Error fetching sets for exercise ID: ${id}`, error);
		throw error;
	}
};
