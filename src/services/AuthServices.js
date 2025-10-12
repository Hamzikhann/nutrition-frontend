import axios from "axios";

const baseUrl = import.meta.env.VITE_API_BASE_URL + "auth/";

const login = (payload) => {
	return axios.post(`${baseUrl}login`, payload);
};

const setToken = (token) => {
	sessionStorage.setItem("nutrition-token", token);
};

const setUserId = (id) => {
	sessionStorage.setItem("nutrition-userId", id);
};

const setSessionUser = (user) => {
	sessionStorage.setItem("nutrition-user", JSON.stringify(user));
};

const getToken = () => {
	return sessionStorage.getItem("nutrition-token");
};

const getSessionUser = () => {
	return JSON.parse(sessionStorage.getItem("nutrition-user") || "{}");
};

const getUserId = () => {
	return sessionStorage.getItem("nutrition-userId") || "{}";
};

const loggedIn = () => {
	return sessionStorage.getItem("nutrition-token") !== null;
};

const logOut = () => {
	sessionStorage.removeItem("nutrition-userId");
	sessionStorage.removeItem("nutrition-user");
	sessionStorage.removeItem("nutrition-token");
	// navigate("/Signin");
};

export { login, setToken, setUserId, setSessionUser, getToken, getSessionUser, getUserId, loggedIn, logOut };
