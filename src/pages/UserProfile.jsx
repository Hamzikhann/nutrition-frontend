import React, { useState } from "react";
import bgImg from "../assets/profileBg.png";
import profile from "../assets/profileDp.png";
import Button from "../components/Button";
import ImgUploader from "../components/ImgUploader";
import { FaUserCog, FaTimes } from "react-icons/fa";
import axios from "axios";
import { setSessionUser, getToken } from "../services/AuthServices";
import { toast } from "react-toastify";

function UserProfile() {
	const [user, setUser] = useState(() => {
		const userString = sessionStorage.getItem("nutrition-user");
		try {
			return userString ? JSON.parse(userString) : null;
		} catch (e) {
			return null;
		}
	});

	const [isEditing, setIsEditing] = useState(false);
	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");
	const [email, setEmail] = useState(user?.email || "");
	const [age, setAge] = useState(user?.age || "");
	const [phoneNo, setPhoneNo] = useState(user?.phoneNo || "");
	const [about, setAbout] = useState(user?.userProfile?.about || "");
	const [selectedFile, setSelectedFile] = useState(null);

	const handleSave = async () => {
		try {
			const formData = new FormData();
			formData.append("firstName", firstName);
			formData.append("lastName", lastName);
			formData.append("email", email);
			if (age) formData.append("age", age);
			if (phoneNo) formData.append("phoneNo", phoneNo);
			if (about) formData.append("about", about);
			if (selectedFile) formData.append("image", selectedFile);

			const response = await axios.post(
				`${import.meta.env.VITE_API_BASE_URL}users/update/profile`,
				formData,
				{
					headers: {
						"access-token": getToken(),
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data.message === "Profile updated successfully.") {
				toast.success("Profile updated successfully!");
				setSessionUser(response.data.data);
				setUser(response.data.data); // Update local user state
				setIsEditing(false);
			} else {
				toast.error(response.data.message || "Failed to update profile.");
			}
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred while updating profile.");
		}
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
								className="rounded-full  w-[160px]  h-[160px] object-cover"
								src={ user?.imageURL ? `${import.meta.env.VITE_VideoBaseURL}${user?.imageURL}`  : profile}
								alt=""
							/>
							<div className="sm:mt-40">
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
								<span className="font-semibold text-base text-gray-600">{user?.phoneNo || "N/A"}</span>
							</div>
							<div className="flex flex-col gap-2">
								<span className="text-gray-800 text-base">About</span>
								<span className="font-semibold text-sm text-gray-600">{user?.userProfile?.about || "No bio available."}</span>
							</div>
						</div>
					</div>
				)}

				{isEditing && (
					<div className="bg-white rounded-xl py-8 sm:px-7 px-3 w-full shadow-lg flex flex-col gap-8 relative">
						<div className="flex justify-between items-center mb-4">
							<h1 className="text-2xl font-bold text-gray-700">Account Detail's:</h1>
							<button
								onClick={() => setIsEditing(false)}
								className="text-gray-500 hover:text-gray-700 text-2xl"
							>
								<FaTimes />
							</button>
						</div>
						<div className="flex sm:flex-row flex-col items-center gap-6">
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">First Name:</label>
								<input
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									placeholder={user?.firstName || "Abdurehman"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Last Name:</label>
								<input
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									placeholder={user?.lastName || "Zafar"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Email:</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
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
									value={age}
									onChange={(e) => setAge(e.target.value)}
									placeholder={user?.age || "N/A"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-lg font-normal text-gray-600">Phone Number:</label>
								<input
									type="text"
									value={phoneNo}
									onChange={(e) => setPhoneNo(e.target.value)}
									placeholder={user?.phoneNo || "+92 300 1234567"}
									className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-lg font-normal text-gray-600">About/Bio:</label>
							<input
								type="text"
								value={about}
								onChange={(e) => setAbout(e.target.value)}
								placeholder={
									user?.about || "A short bio about yourself."
								}
								className="w-full py-3 px-5 rounded-xl text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
							/>
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-lg font-normal text-gray-600">Profile Image:</label>
							<ImgUploader onFileSelect={setSelectedFile} existingImage={user?.imageURL} />
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
