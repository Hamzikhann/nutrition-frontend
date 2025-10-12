import axios from "axios";
import { getToken } from "./AuthServices";
import { toast } from "react-toastify";
const ApiService = {
	baseurl: import.meta.env.VITE_API_BASE_URL,

	postRequest: async (data) => {
		axios.defaults.headers.common["access-token"] = getToken();
		const { path, payload } = data;
		try {
			const response = await axios.post(`${ApiService.baseurl}${path}`, payload);
			return response;
		} catch (error) {
			toast.error(error.response.data.message);
			// console.error("Error in postRequest:", error);
		}
	},

	getRequest: async () => {
		try {
			const response = await axios.get(`${ApiService.baseurl}`);
			return response.data;
		} catch (error) {
			console.error("Error in getRequest:", error);
			throw error;
		}
	}
};

export default ApiService;
