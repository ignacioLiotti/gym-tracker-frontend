import axios from "axios";

const api = axios.create({
	baseURL: "http://localhost:5000/api",
});

export interface Routine {
	id: string;
	name: string;
	description?: string;
	exercises: string[];
}

export const getRoutines = async (): Promise<Routine[]> => {
	const response = await api.get("/routines");
	return response.data;
};

export const getRoutineById = async (id: string): Promise<Routine> => {
	const response = await api.get(`/routines/${id}`);
	return response.data;
};

export const createRoutine = async (
	routine: Omit<Routine, "id">
): Promise<void> => {
	await api.post("/routines", routine);
};

export const updateRoutine = async (
	id: string,
	routine: Omit<Routine, "id">
): Promise<void> => {
	await api.put(`/routines/${id}`, routine);
};

export const deleteRoutine = async (id: string): Promise<void> => {
	await api.delete(`/routines/${id}`);
};
