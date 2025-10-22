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
	},

	// Custom Notification APIs
	createNotification: async (payload) => {
		return await ApiService.postRequest({ path: "customNotification/create", payload });
	},

	getNotifications: async () => {
		return await ApiService.postRequest({ path: "customNotification/list", payload: {} });
	},

	updateNotification: async (id, payload) => {
		return await ApiService.postRequest({ path: `customNotification/update/${id}`, payload });
	},

	deleteNotification: async (id) => {
		return await ApiService.postRequest({ path: `customNotification/delete/${id}`, payload: {} });
	},

	sendNotification: async (id) => {
		return await ApiService.postRequest({ path: `customNotification/send/${id}`, payload: {} });
	},

	// Notification Categories Folder APIs
	createFolder: async (payload) => {
		return await ApiService.postRequest({ path: "notificationCategoriesFolder/create", payload });
	},

	getFolders: async () => {
		return await ApiService.postRequest({ path: "notificationCategoriesFolder/list", payload: {} });
	},

	updateFolder: async (id, payload) => {
		return await ApiService.postRequest({ path: `notificationCategoriesFolder/update/${id}`, payload });
	},

	deleteFolder: async (id) => {
		return await ApiService.postRequest({ path: `notificationCategoriesFolder/delete/${id}`, payload: {} });
	},

	getUsersByCategories: async (payload) => {
		return await ApiService.postRequest({ path: "notificationCategoriesFolder/users", payload });
	}
};

export default ApiService;
