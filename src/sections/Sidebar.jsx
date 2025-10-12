import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/log.png";
import { ImExit } from "react-icons/im";
import { MdDashboard, MdNotificationsActive, MdHelpOutline } from "react-icons/md";
import { FaUser, FaShareAltSquare } from "react-icons/fa";
import { SiPivotaltracker } from "react-icons/si";
import { GiMeal, GiHealingShield } from "react-icons/gi";
import { PiHoodieBold } from "react-icons/pi";
import { FaDumbbell, FaSheetPlastic } from "react-icons/fa6";
import { RiInkBottleFill, RiMenuSearchFill } from "react-icons/ri";
import { MdOutlineImage } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import Modal from "../components/Modal";
import { GoAlertFill } from "react-icons/go";
import { getSessionUser } from "../services/AuthServices";

function Sidebar({ setActiveTab }) {
	const location = useLocation();
	const [isOpen, setIsOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const user = getSessionUser();

	const links = [
		{ name: "Dashboard", icon: MdDashboard, path: "/dashboard" },
		{ name: "Users", icon: FaUser, path: "/users" },
		{ name: "Tracker", icon: SiPivotaltracker, path: "/tracker" },
		{ name: "Recipes", icon: GiMeal, path: "/recipes" },
		{ name: "Diet Plans", icon: PiHoodieBold, path: "/diet-plans" },
		{ name: "WorkOuts", icon: FaDumbbell, path: "/workouts" },
		{ name: "Community", icon: FaShareAltSquare, path: "/community" },
		{ name: "Supplements", icon: RiInkBottleFill, path: "/supplements" },
		{ name: "Moderators", icon: GiHealingShield, path: "/moderators" },
		{
			name: "Notifications",
			icon: MdNotificationsActive,
			path: "/notifications"
		},
		{ name: "Plans", icon: FaSheetPlastic, path: "/plans" },
		{ name: "Payments Plans", icon: GoAlertFill, path: "/payments" },
		{ name: "Banner", icon: MdOutlineImage, path: "/banners" },
		{ name: "How to use", icon: MdHelpOutline, path: "/how-to-use" }
	];
	const filteredLinks =
		user?.role?.title === "Subadmin"
			? links.filter((link) => link.name === "Dashboard" || (user.modules && user.modules.includes(link.name)))
			: links;
	return (
		<>
			{/* Toggle Button */}
			<div className="lg:hidden fixed top-6 left-5 z-10 text-[#46acbe] sm:text-gray-700">
				<button onClick={() => setIsOpen(!isOpen)}>
					{isOpen ? <FiX size={24} /> : <RiMenuSearchFill size={28} />}
				</button>
			</div>

			{/* Sidebar */}
			<div
				className={`fixed lg:static top-0 left-0 h-screen w-[270px] lg:w-[18%] bg-white text-black flex flex-col justify-between py-6 xl:px-8 px-4 border-r border-gray-300 transition-transform duration-300 overflow-y-auto z-40
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
			>
				<Link to="/dashboard">
					<img className="w-[200px]" src={logo} alt="logo" />
				</Link>

				<nav className="flex flex-col gap-3 mt-4">
					{filteredLinks.map((link, id) => {
						const Icon = link.icon;
						return (
							<Link
								key={id}
								to={link.path}
								onClick={() => {
									setActiveTab(link.name);
									setIsOpen(false); // close sidebar on link click (mobile)
								}}
								className={`flex items-center gap-2 px-4 py-2 rounded-md text-base text-gray-500 font-normal ${
									location.pathname === link.path ? "bg-[#d5f5fa] text-[#1d515b]" : "hover:bg-[#d5f5fa]"
								}`}
							>
								<Icon size={20} /> {link.name}
							</Link>
						);
					})}
				</nav>

				<p
					onClick={() => setIsModalOpen(true)}
					className="flex items-center gap-4 text-red-500 text-lg cursor-pointer md:mt-0 mt-6"
				>
					<ImExit /> Logout
				</p>
			</div>

			{/* Overlay for Mobile */}
			{isOpen && <div className="fixed inset-0 bg-black/40 lg:hidden z-30" onClick={() => setIsOpen(false)} />}

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Add Moderators"
				showTitle={false}
				showCloseIcon={false}
				showDivider={false}
				width="min-w-[300px] max-w-[400px]"
				secondaryBtnText="Logout"
				onSecondaryClick={() => {
					setIsModalOpen(false);
					// Add logout logic here
					sessionStorage.clear();
					window.location.href = "/login";
				}}
				primaryBtnText="Cancel"
				onPrimaryClick={() => setIsModalOpen(false)}
			>
				{/* Props se content pass */}
				<p className="text-gray-700 text-2xl font-normal text-center">Confirm Logout</p>
				<div className="flex text-center justify-center items-center bg-red-300 text-red-600 rounded-full w-16 h-16 mx-auto text-3xl mt-4">
					<GoAlertFill />
				</div>
			</Modal>
		</>
	);
}

export default Sidebar;
