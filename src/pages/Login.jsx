import React, { useState } from "react";
import logo from "/src/assets/Log.png";
import books from "/src/assets/Books pic.png";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import ApiService from "../services/ApiServices";
import { setToken, setUserId, setSessionUser } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";

function Login() {
	const [user, setUser] = useState({
		email: "",
		password: ""
	});
	const [errors, setErrors] = useState({
		email: "",
		password: "",
		general: ""
	});
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setUser((prevUser) => ({
			...prevUser,
			[name]: value
		}));
		// Clear error for the specific field when user starts typing
		setErrors((prevErrors) => ({
			...prevErrors,
			[name]: "",
			general: ""
		}));
	};

	const validate = () => {
		let tempErrors = { email: "", password: "", general: "" };
		let isValid = true;

		// Email validation
		if (!user.email) {
			tempErrors.email = "Email is required";
			isValid = false;
		} else if (!/\S+@\S+\.\S+/.test(user.email)) {
			tempErrors.email = "Email is not valid";
			isValid = false;
		}

		// Password validation
		if (!user.password) {
			tempErrors.password = "Password is required";
			isValid = false;
		} else if (user.password.length < 6) {
			tempErrors.password = "Password must be at least 6 characters";
			isValid = false;
		}

		setErrors(tempErrors);
		return isValid;
	};

	const login = async () => {
		if (!validate()) return;

		let data = {
			path: "auth/login/v2",
			payload: {
				email: user.email,
				password: user.password
			}
		};

		try {
			let res = await ApiService.postRequest(data);
			const userRoleTitle = res.data.data.user.role?.title;

			if (userRoleTitle?.toLowerCase() === "user") {
				setErrors({ ...errors, general: "Invalid email or password" });
				return;
			}

			if (res.data.token) {
				setToken(res.data.token);
				// dispatch(setUser(res.data.data.user));
				setUserId(res.data.data.user.id);
				// Parse modules string to array
				const user = res.data.data.user;
				if (user.modules) {
					try {
						user.modules = JSON.parse(user.modules);
					} catch (e) {
						// If not JSON, assume comma-separated string
						user.modules = user.modules.split(",");
					}
				}
				setSessionUser(user);
				navigate("/dashboard");
			} else {
				setErrors({ ...errors, general: "Invalid login credentials" });
			}
		} catch (error) {
			setErrors({ ...errors, general: "Login failed. Please try again." });
		}
	};

	return (
		<>
			<section className="flex md:h-screen h-auto md:py-0 py-14 overflow-hidden">
				<div className="md:w-[45%] w-full flex flex-col gap-8 items-start justify-center sm:px-10 px-5">
					<img className="mb-4" src={logo} alt="Logo" />
					<div className="w-full">
						<h1 className="text-4xl font-normal mb-8">Login</h1>
						<form action="#" className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Email Address</label>
								<input
									type="email"
									value={user.email}
									name="email"
									onChange={handleChange}
									placeholder="Enter Email"
									className={`w-full py-4 px-3 rounded-lg ${errors.email ? "border border-red-500" : "bg-gray-200"}`}
								/>
								{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Password</label>
								<input
									type="password"
									value={user.password}
									name="password"
									onChange={handleChange}
									placeholder="Enter Password"
									className={`w-full py-4 px-3 rounded-lg ${errors.password ? "border border-red-500" : "bg-gray-200"}`}
								/>
								{errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
							</div>
						</form>

						<p className="text-sm font-normal text-black mt-3 underline cursor-pointer">Forgot Password</p>
						{errors.general && <p className="text-red-500 text-sm mt-2">{errors.general}</p>}
					</div>

					<Button
						text="Login"
						bg="bg-[#46abbd]"
						textColor="text-white"
						width="w-full"
						borderColor="border-[#46abbd]"
						onClick={login}
					/>

					<Link to="/signup" className="text-center w-full">
						<p className="text-sm font-normal text-black text-center">
							Don't have an account? <span className="underline cursor-pointer text-[#47acb7]">Sign Up</span>
						</p>
					</Link>
				</div>
				<div className="md:w-[55%] w-0">
					<img className="h-[100%]" src={books} alt="" />
				</div>
			</section>
		</>
	);
}

export default Login;
