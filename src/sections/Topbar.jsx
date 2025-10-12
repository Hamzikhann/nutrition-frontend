import React from "react";
import { Link } from "react-router-dom";
import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineNotificationsActive } from "react-icons/md";

function Topbar({ activeTab }) {
	const userString = sessionStorage.getItem("nutrition-user");
	let user = null;
	try {
		user = userString ? JSON.parse(userString) : null;
	} catch (e) {
		user = null;
	}

	const token = sessionStorage.getItem("nutrition-token");

	return (
		<div className="w-full md:h-[80px] h-[73px] bg-white border-b border-gray-300 flex items-center justify-between md:px-8 px-4 py-2">
			<h2 className="text-2xl font-bold text-[#46acbe] sm:text-gray-700 lg:ml-0 ml-12">{activeTab}</h2>
			<div className="flex items-center sm:gap-5 gap-3 mt-1">
				<div className="relative">
					<Link to="/notifications" className="text-gray-500 hover:text-gray-700 focus:outline-none text-3xl">
						<MdOutlineNotificationsActive />
					</Link>
					<span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-light rounded-full p-1.5"></span>
				</div>

				<Link to="/profile" className="flex items-center gap-2">
					<button className="text-3xl text-gray-600">
						<FaRegUserCircle />
					</button>
					<p className="hidden sm:flex text-xl font-normal text-gray-500">
						{user?.firstName + " " + user?.lastName || "User"}
					</p>
				</Link>
			</div>
		</div>
	);
}

export default Topbar;
