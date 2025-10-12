import React, { useState } from "react";
import bgImg from "../assets/profileBg.png";
import profile from "../assets/profileDp.png";
import Button from "../components/Button";
import ImgUploader from "../components/ImgUploader";
import { FaUserCog } from "react-icons/fa";

function UserProfile() {
	const userString = sessionStorage.getItem("nutrition-user");
	let user = null;
	try {
		user = userString ? JSON.parse(userString) : null;
	} catch (e) {
		user = null;
	}

	const [isEditing, setIsEditing] = useState(false);

	const handleSave = () => {
		console.log("Changes saved!");
		setIsEditing(false);
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen">
				{!isEditing && (
					<div className="flex sm:gap-10 gap-5 flex-col">
						<div className="w-full">
							<img src={bgImg} alt="" />
						</div>

						<div className="flex sm:flex-row flex-col sm:justify-between justify-start gap-10 sm:items-center items-start sm:px-10 px-2 sm:-mt-36 -mt-12">
							<img
								className="rounded-full border border-yellow-700 sm:w-auto w-[150px] sm:h-auto h-[150px] object-cover"
								src={profile}
								alt=""
							/>
							<div className="sm:mt-20">
								{" "}
								<Button
									text="Edit Profile"
									onClick={() => setIsEditing(true)}
									icon={FaUserCog}
									bg="bg-[#46abbd]"
									textColor="text-white"
									borderColor="border-[#46abbd]"
								/>
							</div>
						</div>

						<div className="bg-white rounded-md px-8 py-7 flex flex-wrap gap-10 mt-10 shadow-lg">
							<div className="flex flex-col gap-2 w-[200px]">
								<span className="text-gray-800 text-base">Full Name</span>
								<span className="font-semibold text-base text-gray-600">
									{user?.firstName + " " + user?.lastName || "N/A"}
								</span>
							</div>
							<div className="flex flex-col gap-2 w-[250px]">
								<span className="text-gray-800 text-base">Email</span>
								<span className="font-semibold text-base text-gray-600">{user?.email || "N/A"}</span>
							</div>
							<div className="flex flex-col gap-2 w-[200px]">
								<span className="text-gray-800 text-base">Age</span>
								<span className="font-semibold text-base text-gray-600">{user?.age || "N/A"}</span>
							</div>
							<div className="flex flex-col gap-2 w-[200px]">
								<span className="text-gray-800 text-base">Phone</span>
								<span className="font-semibold text-base text-gray-600">{user?.phone || "N/A"}</span>
							</div>
							<div className="flex flex-col gap-2">
								<span className="text-gray-800 text-base">About</span>
								<span className="font-semibold text-sm text-gray-600">{user?.about || "No bio available."}</span>
							</div>
						</div>
					</div>
				)}

				{isEditing && (
					<div className="bg-white rounded-xl py-8 sm:px-7 px-3 w-full shadow-lg flex flex-col gap-8">
						<h1 className="text-2xl font-bold text-gray-700 mb-4">Account Detail's:</h1>
						<div className="flex sm:flex-row flex-col items-center gap-6">
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Full Name:</label>
								<input
									type="text"
									placeholder={user?.name || "Abdurehman"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Email:</label>
								<input
									type="email"
									placeholder={user?.email || "abdurehmanzafar14@gmail.com"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
						</div>
						<div className="flex sm:flex-row flex-col items-center gap-6">
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Age:</label>
								<input
									type="text"
									placeholder={user?.age || "21"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Location:</label>
								<input
									type="text"
									placeholder={user?.location || "Lahore, Pakistan"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-lg font-normal text-gray-600">About/Bio:</label>
							<input
								type="text"
								placeholder={
									user?.about ||
									"In the fast-paced world of corporate life, it's crucial to prioritize your mental peace. Take moments to breathe, reflect, and recharge."
								}
								className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
							/>
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-lg font-normal text-gray-600">Profile Image:</label>
							<ImgUploader />
						</div>
						<div className="w-full flex sm:justify-end justify-center">
							<Button
								onClick={handleSave}
								text="Save Changes"
								bg="bg-[#46abbd]"
								textColor="text-white"
								borderColor="border-[#46abbd]"
							/>
						</div>
					</div>
				)}
			</section>
		</>
	);
}

export default UserProfile;
