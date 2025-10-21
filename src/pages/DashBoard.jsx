import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { GiMeal } from "react-icons/gi";
import { FaUser } from "react-icons/fa";
import { FaShareAltSquare } from "react-icons/fa";
import ApiService from "../services/ApiServices";

const Dashboard = () => {
	// Data for the line chart - will be updated with API data
	const getLineChartData = () => {
		if (!lineChartData || lineChartData.length === 0) {
			return [
				{ month: "Jan", active: 0, notActive: 0 },
				{ month: "Feb", active: 0, notActive: 0 },
				{ month: "Mar", active: 0, notActive: 0 },
				{ month: "Apr", active: 0, notActive: 0 },
				{ month: "May", active: 0, notActive: 0 },
				{ month: "Jun", active: 0, notActive: 0 },
				{ month: "Jul", active: 0, notActive: 0 },
				{ month: "Aug", active: 0, notActive: 0 },
				{ month: "Sep", active: 0, notActive: 0 },
				{ month: "Oct", active: 0, notActive: 0 },
				{ month: "Nov", active: 0, notActive: 0 },
				{ month: "Dec", active: 0, notActive: 0 }
			];
		}

		// Create a map for quick lookup of API data by month
		const apiDataMap = {};
		lineChartData.forEach((item) => {
			apiDataMap[item.month] = {
				active: item.active || 0,
				notActive: item.inactive || 0
			};
		});

		// Define the order of months
		const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

		// Return data in correct month order, using API data where available
		return monthOrder.map((month) => ({
			month,
			active: apiDataMap[month]?.active || 0,
			notActive: apiDataMap[month]?.notActive || 0
		}));
	};

	// Data for the pie chart - will be updated with API data
	const getPieChartData = () => {
		if (!dashboardData || !dashboardData.userStats) {
			return [
				{ name: "Active", value: 0, color: "#22d3ee" },
				{ name: "Inactive", value: 0, color: "#10b981" },
				{ name: "Total", value: 0, color: "#f97316" }
			];
		}

		const { active, inactive, total } = dashboardData.userStats;
		return [
			{ name: "Active", value: active || 0, color: "#22d3ee" },
			{ name: "Inactive", value: inactive || 0, color: "#10b981" },
			{ name: "Total", value: total || 0, color: "#f97316" }
		];
	};

	const getStatCard = () => {
		if (!dashboardData) return [];

		return [
			{
				title: "Total Users",
				value: dashboardData.totalUsers?.toLocaleString() || "0",
				change: `${dashboardData.userGrowthPercentage || 0}%`,
				changeType: (dashboardData.userGrowthPercentage || 0) >= 0 ? "increase" : "decrease",
				bgColor: "bg-green-200",
				iconColor: "text-green-500",
				icon: FaUser
			},
			{
				title: "Active Recipes",
				value: dashboardData.activeRecipes?.toString() || "0",
				change: `${dashboardData.recipeGrowthPercentage || 0}%`,
				changeType: (dashboardData.recipeGrowthPercentage || 0) >= 0 ? "increase" : "decrease",
				bgColor: "bg-cyan-200",
				iconColor: "text-[#1d515e]",
				icon: GiMeal
			},
			{
				title: "Community Posts",
				value: dashboardData.communityPosts?.toLocaleString() || "0",
				change: `${dashboardData.postsGrowthPercentage || 0}%`,
				changeType: (dashboardData.postsGrowthPercentage || 0) >= 0 ? "increase" : "decrease",
				bgColor: "bg-pink-400",
				iconColor: "text-[#a43664]",
				icon: FaShareAltSquare
			}
		];
	};

	const [dashboardData, setDashboardData] = useState(null);
	const [lineChartData, setLineChartData] = useState([]);
	const getDashboardData = async () => {
		try {
			let data = {
				path: "dashboard/stats",
				payload: {}
			};

			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				setDashboardData(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		}
	};

	const getLinecahrtdata = async () => {
		try {
			let data = {
				path: "dashboard/user-growth",
				payload: {}
			};

			let res = await ApiService.postRequest(data);
			if (res) {
				setLineChartData(res.data.data);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		getDashboardData();
		getLinecahrtdata();
	}, []);

	return (
		<div className="min-h-scree sm:p-8 p-4 py-5">
			<div className="w-full mx-auto">
				{/* Header */}
				<h1 className="sm:text-3xl text-2xl font-semibold text-gray-800 mb-8">Welcome to Fitcysters!</h1>

				{/* Stats Cards xl */}
				<div className="hidden md:flex items-center justify-between gap-6 mb-8 bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
					{getStatCard().map((card, index) => {
						const Icon = card.icon;
						return (
							<div
								key={index}
								className={`flex-1 bg-white ${index !== getStatCard().length - 1 ? "border-r border-gray-200" : ""}`}
							>
								<div className="flex items-center gap-6 pr-6">
									{/* Icon Circle */}
									<div className={`w-20 h-20 rounded-full flex items-center justify-center ${card.bgColor}`}>
										<span className={`text-white text-3xl ${card.iconColor}`}>
											<Icon />
										</span>
									</div>

									{/* Text Section */}
									<div>
										<p className="text-gray-500 text-sm font-medium">{card.title}</p>
										<p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
										<div className="flex items-center mt-2">
											<span
												className={`text-sm font-medium ${
													card.changeType === "increase" ? "text-green-600" : "text-red-600"
												}`}
											>
												{card.changeType === "increase" ? "↗" : "↘"} {card.change}
											</span>
											<span className="text-gray-500 text-sm ml-1">
												{card.title === "Community Posts" ? "this week" : "this month"}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Stats Cards sm */}
				<div className="md:hidden flex flex-wrap items-center justify-center gap-2 mb-8 bg-white rounded-xl">
					{getStatCard().map((card, index) => {
						const Icon = card.icon;
						return (
							<div
								key={index}
								className="bg-white sm:w-[250px] w-full h-[110px]  shadow-sm border border-gray-100 py-4 px-3 rounded-lg"
							>
								<div className="flex items-center justify-center gap-4">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center ${card.bgColor}`}>
										<span className={`text-white text-2xl ${card.iconColor}`}>
											<Icon />
										</span>
									</div>
									<div>
										<p className="text-gray-500 text-sm font-medium">{card.title}</p>
										<p className="text-xl font-semibold text-gray-900 mt-1">{card.value}</p>
										<div className="flex items-center mt-2">
											<span
												className={`text-xs font-medium ${
													card.changeType === "increase" ? "text-green-600" : "text-red-600"
												}`}
											>
												{card.changeType === "increase" ? "↗" : "↘"} {card.change}
											</span>
											<span className="text-gray-500 text-xs ml-1">
												{card.title === "Community Posts" ? "this week" : "this month"}
											</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Charts Section */}
				<div className="flex lg:flex-row flex-col gap-3 ">
					<div className="bg-white lg:w-[30%] w-full rounded-xl p-5 shadow-sm border border-gray-100">
						<h2 className="text-xl font-semibold text-gray-900 mb-2">Total Users</h2>
						<p className="text-3xl font-bold text-gray-900 mt-5 mb-2 text-center">
							{dashboardData?.userStats?.total?.toLocaleString() || "0"}
						</p>

						<div className="relative h-56 mb-6">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={getPieChartData()}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={100}
										paddingAngle={5}
										dataKey="value"
									>
										{getPieChartData().map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>

							{/* Center Avatar */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
									<span className="text-white text-xl">👤</span>
								</div>
							</div>
						</div>

						<div className="flex justify-between text-sm">
							<div>
								<div className="flex items-center">
									<div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
									<span className="text-gray-600">Active</span>
								</div>
								<span className="font-semibold text-base">
									{dashboardData?.userStats?.active?.toLocaleString() || "0"}
								</span>
							</div>
							<div>
								<div className="flex items-center">
									<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
									<span className="text-gray-600">Inactive</span>
								</div>
								<span className="font-semibold text-base">
									{dashboardData?.userStats?.inactive?.toLocaleString() || "0"}
								</span>
							</div>
							<div>
								<div className="flex items-center">
									<div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
									<span className="text-gray-600">Total</span>
								</div>
								<span className="font-semibold text-base">
									{dashboardData?.userStats?.total?.toLocaleString() || "0"}
								</span>
							</div>
						</div>
					</div>

					<div className="bg-white lg:w-[70%] w-full rounded-xl p-5 shadow-sm border border-gray-100 overflow-x-auto">
						<div className="sm:w-full w-[600px]">
							<div className="flex justify-between mb-6">
								<div>
									<h2 className="text-xl font-semibold text-gray-900">App usage</h2>
									<p className="text-3xl font-bold text-gray-900 mt-2">
										{dashboardData?.appUsage
											? (dashboardData.appUsage.active + dashboardData.appUsage.inactive)?.toLocaleString()
											: "0"}
									</p>
								</div>
								<div className="flex space-x-4 text-sm">
									<div className="flex items-center">
										<div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
										<span className="text-gray-600">Active</span>
									</div>
									<div className="flex items-center">
										<div className="w-3 h-3 bg-cyan-400 rounded-full mr-2"></div>
										<span className="text-gray-600">Not Active</span>
									</div>
								</div>
							</div>

							<div className="h-72 -ml-10">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={getLineChartData()}>
										<XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
										<YAxis
											axisLine={false}
											tickLine={false}
											tick={{ fontSize: 12, fill: "#6b7280" }}
											domain={[0, 12]}
										/>
										<Line type="monotone" dataKey="active" stroke="#f97316" strokeWidth={3} dot={false} />
										<Line type="monotone" dataKey="notActive" stroke="#22d3ee" strokeWidth={3} dot={false} />
									</LineChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
