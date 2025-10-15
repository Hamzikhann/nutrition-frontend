import React, { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import ApiService from "../services/ApiServices";
import { IoMdAdd } from "react-icons/io";

function HowToUse() {
	const [howToUseData, setHowToUseData] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [isContentModalOpen, setIsContentModalOpen] = useState(false);
	const [categoryForm, setCategoryForm] = useState({ title: "" });
	const [contentForm, setContentForm] = useState({ categoryId: "", title: "", description: "", video: "" });
	const [file, setFile] = useState(null);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedContent, setSelectedContent] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [contentToDelete, setContentToDelete] = useState(null);
	const [openMenu, setOpenMenu] = useState(null);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setOpenMenu(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const fetchHowToUse = async () => {
		try {
			let data = {
				path: "howToUse/list",
				payload: {}
			};
			const res = await ApiService.postRequest(data);
			setHowToUseData(res.data.howToUse || []);
			if (res.data.howToUse && res.data.howToUse.length > 0 && !selectedCategory) {
				setSelectedCategory(res.data.howToUse[0].id);
			}
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		fetchHowToUse();
	}, []);

	const validateCategoryForm = () => {
		const newErrors = {};
		if (!categoryForm.title.trim()) {
			newErrors.title = "Category title is required";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateContentForm = () => {
		const newErrors = {};
		if (!contentForm.categoryId) {
			newErrors.categoryId = "Category is required";
		}
		if (!contentForm.title.trim()) {
			newErrors.title = "Title is required";
		}
		if (!contentForm.description.trim()) {
			newErrors.description = "Description is required";
		}
		if (!contentForm.video.trim() && !file) {
			newErrors.media = "Video URL or Image is required";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddCategory = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		if (!validateCategoryForm()) return;
		setLoading(true);
		try {
			let data = {
				path: "howToUse/createCategory",
				payload: { title: categoryForm.title }
			};
			await ApiService.postRequest(data);
			setCategoryForm({ title: "" });
			setIsCategoryModalOpen(false);
			setErrors({});
			fetchHowToUse();
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddContent = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		if (!validateContentForm()) return;
		setLoading(true);
		try {
			let formData = new FormData();
			if (file) formData.append("media", file);
			formData.append("categoryId", contentForm.categoryId);
			formData.append("title", contentForm.title);
			formData.append("description", contentForm.description);
			// formData.append("video", contentForm.video);

			let data = {
				path: "howToUse/create",
				payload: formData
			};
			await ApiService.postRequest(data);
			setContentForm({ categoryId: "", title: "", description: "", video: "" });
			setFile(null);
			setIsContentModalOpen(false);
			setErrors({});
			fetchHowToUse();
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditContent = (item) => {
		console.log(item);
		setSelectedContent(item);
		setContentForm({ categoryId: item.howTouseCategoryId, title: item.title, description: item.description || "", video: item.media || "" });
		setFile(null);
		setIsEditMode(true);
		setIsContentModalOpen(true);
		setOpenMenu(null);
	};

	const handleUpdateContent = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		if (!validateContentForm()) return;
		setLoading(true);
		try {
			let formData = new FormData();
			if (file) formData.append("media", file);
			formData.append("id", selectedContent.id);
			formData.append("categoryId", contentForm.categoryId);
			formData.append("title", contentForm.title);
			formData.append("description", contentForm.description);
			// formData.append("media", contentForm.video);

			let data = {
				path: "howToUse/update",
				payload: formData
			};
			await ApiService.postRequest(data);
			setContentForm({ categoryId: "", title: "", description: "", video: "" });
			setFile(null);
			setIsContentModalOpen(false);
			setIsEditMode(false);
			setSelectedContent(null);
			setErrors({});
			fetchHowToUse();
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteContent = (id) => {
		setContentToDelete(id);
		setIsDeleteModalOpen(true);
		setOpenMenu(null);
	};

	const deleteContent = async () => {
		try {
			let data = {
				path: "howToUse/delete",
				payload: { id: contentToDelete }
			};
			await ApiService.postRequest(data);
			setIsDeleteModalOpen(false);
			setContentToDelete(null);
			fetchHowToUse();
		} catch (error) {
			console.log(error);
		}
	};

	const selectedCategoryData = howToUseData.find((cat) => cat.id === selectedCategory);

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-10 flex-col">
				{/* upper div */}
				<div className="flex xl:flex-row flex-col-reverse gap-8 justify-between items-center">
					<div></div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							onClick={() => setIsCategoryModalOpen(true)}
							text="Add Category"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
						<Button
							onClick={() => setIsContentModalOpen(true)}
							text="Add Content"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Categories Navigation */}
				{howToUseData.length > 0 && (
					<div className="flex gap-4 border-b border-gray-300 pb-2 overflow-x-auto">
						{howToUseData.map((cat) => (
							<button
								key={cat.id}
								className={`px-4 py-2 rounded ${
									cat.id === selectedCategory ? "bg-[#46acbe] text-white" : "bg-gray-200 text-gray-700"
								}`}
								onClick={() => setSelectedCategory(cat.id)}
							>
								{cat.title}
							</button>
						))}
					</div>
				)}

				{/* Content Cards */}
				<div className="flex flex-wrap justify-center items-center gap-3 mt-4">
					{selectedCategoryData && selectedCategoryData.howTouses && selectedCategoryData.howTouses.length > 0 ? (
						selectedCategoryData.howTouses.map((item) => (
							<div
								key={item.id}
								className="w-full sm:w-[300px] p-4 rounded-xl bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition relative"
							>
								<div className="text-lg font-bold text-[#234c50]">{item.title}</div>
								<div className="text-sm text-gray-600 mt-1">{item.description}</div>
								<div className="relative">
									{item.media.includes(".mp4") ? (
										<video
											loading="lazy"
											className="rounded-lg h-40 w-full object-contain bg-black"
											src={import.meta.env.VITE_VideoBaseURL + item.media}
											controls
										/>
									) : !item.media.includes(".mp4") ? (
										<img
											loading="lazy"
											className="rounded-lg h-40 w-full object-cover"
											src={import.meta.env.VITE_VideoBaseURL + item.media}
											alt={item.title}
										/>
									) : (
										<div className="rounded-lg h-40 w-full bg-gray-200 flex items-center justify-center text-gray-500">
											No Media
										</div>
									)}
								</div>
								<div
									className="absolute top-2 right-2 text-xl text-gray-500 cursor-pointer"
									onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
								>
									...
								</div>
								{openMenu === item.id && (
									<div
										ref={dropdownRef}
										className="absolute right-2 top-8 bg-white shadow-lg rounded-lg w-28 flex flex-col text-sm z-10"
									>
										<button className="px-4 py-2 hover:bg-gray-100 text-left" onClick={() => handleEditContent(item)}>
											Edit
										</button>
										<button
											className="px-4 py-2 hover:bg-gray-100 text-left text-red-500"
											onClick={() => handleDeleteContent(item.id)}
										>
											Delete
										</button>
									</div>
								)}
							</div>
						))
					) : (
						<div className="py-8 text-center">
							<h3 className="mt-2 text-sm font-medium text-gray-900">No content found for this category</h3>
						</div>
					)}
				</div>

				{/* Add Category Modal */}
				<Modal
					isOpen={isCategoryModalOpen}
					onClose={() => setIsCategoryModalOpen(false)}
					title="Add Category"
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[300px] max-w-lg"
					secondaryBtnText="Cancel"
					primaryBtnText={loading ? "Adding..." : "Add"}
					onPrimaryClick={handleAddCategory}
					primaryBtnDisabled={loading}
				>
					<div className="flex flex-col gap-4 pb-4">
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Category Title:</label>
							<input
								type="text"
								placeholder="Enter category title"
								value={categoryForm.title}
								onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
								className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
									errors.title ? "border-red-500" : "border-gray-300"
								} focus:outline-none focus:border-[#46acbe]`}
							/>
							{errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
						</div>
					</div>
				</Modal>

				{/* Add/Edit Content Modal */}
				<Modal
					isOpen={isContentModalOpen}
					onClose={() => {
						setIsContentModalOpen(false);
						if (isEditMode) {
							setIsEditMode(false);
							setSelectedContent(null);
							setContentForm({ categoryId: "", title: "", description: "", video: "" });
							setFile(null);
						}
					}}
					title={isEditMode ? "Edit Content" : "Add Content"}
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[300px] max-w-lg"
					secondaryBtnText="Cancel"
					primaryBtnText={loading ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update" : "Add"}
					onPrimaryClick={isEditMode ? handleUpdateContent : handleAddContent}
					primaryBtnDisabled={loading}
				>
					<div className="flex flex-col gap-4 pb-4">
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Category:</label>
							<select
								value={contentForm.categoryId}
								onChange={(e) => setContentForm({ ...contentForm, categoryId: e.target.value })}
								className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
									errors.categoryId ? "border-red-500" : "border-gray-300"
								} focus:outline-none focus:border-[#46acbe]`}
							>
								<option value="">Select Category</option>
								{howToUseData.map((cat) => (
									<option key={cat.id} value={cat.id}>
										{cat.title}
									</option>
								))}
							</select>
							{errors.categoryId && <p className="text-red-500 text-xs">{errors.categoryId}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Title:</label>
							<input
								type="text"
								placeholder="Enter title"
								value={contentForm.title}
								onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
								className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
									errors.title ? "border-red-500" : "border-gray-300"
								} focus:outline-none focus:border-[#46acbe]`}
							/>
							{errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Description:</label>
							<textarea
								placeholder="Enter description"
								value={contentForm.description}
								onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
								className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
									errors.description ? "border-red-500" : "border-gray-300"
								} focus:outline-none focus:border-[#46acbe] resize-none`}
								rows="3"
							/>
							{errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Upload Image/Video :</label>
							<ImgUploader
								onFileSelect={setFile}
								existingImage={import.meta.env.VITE_VideoBaseURL + selectedContent?.video}
							/>
							{errors.media && <p className="text-red-500 text-xs">{errors.media}</p>}
							{/* {file && (
								<img className="w-full h-32 object-cover rounded-lg" src={URL.createObjectURL(file)} alt="Preview" />
							)}
							{isEditMode && selectedContent?.image && !file && (
								<img className="w-full h-32 object-cover rounded-lg" src={selectedContent.image} alt="Current" />
							)} */}
						</div>
					</div>
				</Modal>

				{/* Delete Confirmation Modal */}
				<Modal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					title="Confirm Delete"
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[300px] max-w-md"
					secondaryBtnText="Cancel"
					primaryBtnText="Delete"
					onPrimaryClick={deleteContent}
					primaryBtnDisabled={false}
					danger={true}
				>
					<div className="flex flex-col gap-4 pb-4">
						<p className="text-gray-600">Are you sure you want to delete this content? This action cannot be undone.</p>
					</div>
				</Modal>
			</section>
		</>
	);
}

export default HowToUse;
