import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL, // Asegúrate de que esta URL es correcta
});

export default api;
