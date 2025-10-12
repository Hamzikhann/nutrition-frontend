import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Layout from "./sections/Layout";
import Users from "./pages/Users";
import Dashboard from "./pages/DashBoard";
import Tracker from "./pages/Tracker";
import Recipes from "./pages/Recipes";
import DietPlan from "./pages/DietPlan";
import Workout from "./pages/Workout";
import Supplements from "./pages/Supplements";
import Moderators from "./pages/Moderators";
import Notifications from "./pages/Notifications";
import Plans from "./pages/Plans";
import UserProfile from "./pages/UserProfile";
import Community from "./pages/Community";
import { getToken, getSessionUser } from "./services/AuthServices";
import PaymentPlans from "./pages/PaymentPlans";
import Banner from "./pages/Banner";
import HowToUse from "./pages/HowToUse";
const ProtectedRoute = () => {
	const token = getToken();
	const user = getSessionUser();
	const location = useLocation();

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	// Module-based access for Subadmin
	if (user?.role?.title === "Subadmin") {
		const modulePathMap = {
			"/users": "Users",
			"/tracker": "Tracker",
			"/recipes": "Recipes",
			"/diet-plans": "Diet Plans",
			"/workouts": "WorkOuts",
			"/supplements": "Supplements",
			"/moderators": "Moderators",
			"/notifications": "Notifications",
			"/plans": "Plans",
			"/profile": "Profile",
			"/community": "Community",
			"/payments": "Payments Plans",
			"/banners": "Banner",
			"/how-to-use": "How to use"
		};
		const allowedPaths = ["/dashboard"];
		if (user.modules && Array.isArray(user.modules)) {
			user.modules.forEach((mod) => {
				const path = Object.keys(modulePathMap).find((p) => modulePathMap[p] === mod);
				if (path) {
					allowedPaths.push(path);
				}
			});
		}
		if (!allowedPaths.includes(location.pathname)) {
			return <Navigate to="/dashboard" replace />;
		}
	}

	return <Outlet />;
};

function App() {
	return (
		<>
			<Router>
				<Routes>
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="/login" element={<Login />} />
					<Route path="/signup" element={<SignUp />} />
					<Route element={<ProtectedRoute />}>
						<Route element={<Layout />}>
							<Route path="/dashboard" element={<Dashboard />} />
							<Route path="/users" element={<Users />} />
							<Route path="/tracker" element={<Tracker />} />
							<Route path="/recipes" element={<Recipes />} />
							<Route path="/diet-plans" element={<DietPlan />} />
							<Route path="/workouts" element={<Workout />} />
							<Route path="/supplements" element={<Supplements />} />
							<Route path="/moderators" element={<Moderators />} />
							<Route path="/notifications" element={<Notifications />} />
							<Route path="/plans" element={<Plans />} />
							<Route path="/profile" element={<UserProfile />} />
							<Route path="/community" element={<Community />} />
							<Route path="/payments" element={<PaymentPlans />} />
							<Route path="/banners" element={<Banner />} />
							<Route path="/how-to-use" element={<HowToUse />} />
						</Route>
					</Route>
				</Routes>
				{/* <ToastContainer /> */}
			</Router>
		</>
	);
}

export default App;
