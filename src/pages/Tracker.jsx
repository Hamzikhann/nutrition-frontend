import React, { useState, useEffect, useCallback, memo } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import Card from "../components/Card";
import { IoMdAdd } from "react-icons/io";
import ApiService from "../services/ApiServices";
import Inputs from "../components/Inputs";
import { toast } from "react-toastify";

function Tracker() {
	const statuses = ["HighLights", "Habits"];
	const [activeTab, setActiveTab] = useState("HighLights");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [selectedHighlight, setSelectedHighlight] = useState(null);
	const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
	const [itemFormData, setItemFormData] = useState({ caption: "", duration: "" });
	const [itemFile, setItemFile] = useState(null);
	const [itemErrors, setItemErrors] = useState({});
	const [highlights, setHighlights] = useState([]);
	const [habits, setHabits] = useState([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedItem, setSelectedItem] = useState(null);
	const [isEditItemMode, setIsEditItemMode] = useState(false);
	const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
	const [hasFetchedHighlights, setHasFetchedHighlights] = useState(false);
	const [hasFetchedHabits, setHasFetchedHabits] = useState(false);
	const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
	const [itemToDeleteId, setItemToDeleteId] = useState(null);

	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		setFormData(
			modalConfig[activeTab].fields.reduce((acc, field) => {
				if (field.type === "checkbox") {
					acc[field.name] = field.options ? [] : false;
				} else {
					acc[field.name] = "";
				}
				return acc;
			}, {})
		);
		setFormErrors({});
		setFile(null);
	}, [activeTab]);

	const highlightsFields = [
		{ name: "title", label: "Title", type: "text", placeholder: "Enter title" },
		{ name: "caption", label: "Caption", type: "text", placeholder: "Enter Caption" },
		{ name: "duration", label: "Duration", type: "number" }
	];

	const habitsFields = [
		{ name: "name", label: "Title", type: "text", placeholder: "Enter title" },
		{ name: "description", label: "Description", type: "text", placeholder: "Enter description" },
		{ name: "mandatory", label: "Mandatory", type: "checkbox" }
	];

	const addItemFields = [
		{ name: "caption", label: "Caption", type: "text", placeholder: "Enter Caption" },
		{ name: "duration", label: "Duration", type: "number" }
	];
	const edithighlightsFields = [{ name: "title", label: "Title", type: "text", placeholder: "Enter title" }];

	const editHabitsFields = [
		{ name: "name", label: "Title", type: "text", placeholder: "Enter title" },
		{ name: "description", label: "Description", type: "text", placeholder: "Enter description" },
		{ name: "mandatory", label: "Mandatory", type: "checkbox" }
	];

	const getHabits = useCallback(async () => {
		try {
			let data = { path: "habits/list", payload: {} };
			let response = await ApiService.postRequest(data);
			if (response) toast.success("Habits Retrived");
			setHabits(response.data.data.habits);
		} catch (error) {
			console.log(error);
		}
	}, []);

	const getHighlights = useCallback(async () => {
		try {
			let data = { path: "highlights/list", payload: {} };
			let response = await ApiService.postRequest(data);
			if (response) toast.success("Highlights Retrived");
			setHighlights(response.data.data);
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => {
		if (activeTab === "Habits") {
			if (!hasFetchedHabits) {
				getHabits();
				setHasFetchedHabits(true);
			}
			setHasFetchedHighlights(false);
		} else {
			if (!hasFetchedHighlights) {
				getHighlights();
				setHasFetchedHighlights(true);
			}
			setHasFetchedHabits(false);
		}
	}, [activeTab, hasFetchedHabits, hasFetchedHighlights, getHabits, getHighlights]);

	const handleEditHighlight = (highlight) => {
		setSelectedItem(highlight);
		setFormData({
			title: highlight.title,
			highlightId: highlight.id
		});
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	const handleDeleteHighlight = async (id) => {
		try {
			let data = { path: "highlights/delete", payload: { id } };
			await ApiService.postRequest(data);
			setHighlights(highlights.filter((h) => h.id !== id));
		} catch (error) {
			console.log(error);
		}
	};

	const handleEditHabit = (habit) => {
		setSelectedItem(habit);
		setFormData({
			id: habit.id,
			name: habit.name,
			description: habit.description,
			mandatory: habit.mandatory
		});
		setFile(habit.image);
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	const handleDeleteHabit = async (id) => {
		try {
			let data = { path: "habits/delete", payload: { id } };
			await ApiService.postRequest(data);
			setHabits(habits.filter((h) => h.id !== id));
		} catch (error) {
			console.log(error);
		}
	};

	const handleEditItem = (item) => {
		setSelectedItemForEdit(item);
		setItemFormData({
			caption: item.caption,
			duration: item.duration
		});
		// set;
		setIsEditItemMode(true);
		setIsAddItemModalOpen(true);
	};

	const handleDeleteItem = async (id) => {
		try {
			let data = { path: "highlights/delete/item", payload: { id } };
			await ApiService.postRequest(data);
		} catch (error) {
			console.log(error);
		}
	};

	const confirmDeleteItem = async () => {
		if (itemToDeleteId) {
			await handleDeleteItem(itemToDeleteId);
			setIsDeleteItemModalOpen(false);
			setItemToDeleteId(null);
		}
	};

	// Modal for editing and deleting highlights, habits, and highlight items

	// Add edit and delete buttons for highlight items in the view modal

	// 🔹 pick modal fields based on tab
	const modalConfig = {
		HighLights: {
			title: isEditMode ? "Edit Highlight" : "Add New Highlight",
			uploadLabel: "Upload Video:",
			fields: isEditMode ? edithighlightsFields : highlightsFields
		},
		Habits: {
			title: isEditMode ? "Edit Habit" : "Add New Habit",
			uploadLabel: "Upload Image:",
			fields: isEditMode ? editHabitsFields : habitsFields
		}
	};

	const [formData, setFormData] = useState(
		modalConfig[activeTab].fields.reduce((acc, field) => {
			if (field.type === "checkbox") {
				acc[field.name] = field.options ? [] : false;
			} else {
				acc[field.name] = "";
			}
			return acc;
		}, {})
	);
	const [file, setFile] = useState(null);
	const [formErrors, setFormErrors] = useState({});

	const validateForm = useCallback(() => {
		const errors = {};
		if (activeTab === "HighLights") {
			if (!file) errors.media = "Media file is required.";
			if (!formData.title.trim()) errors.title = "Title is required.";
			if (!formData.caption.trim()) errors.caption = "Caption is required.";
			if (!formData.duration || formData.duration <= 0) errors.duration = "Duration must be a positive number.";
		} else {
			if (!file) errors.media = "Media file is required.";

			if (!formData.name.trim()) errors.name = "Title is required.";
			if (!formData.description.trim()) errors.description = "Description is required.";
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	}, [file, formData, activeTab]);

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) return;

		const dataForm = new FormData();

		// Append file
		if (file && activeTab === "HighLights") dataForm.append("media", file);
		else if (file && activeTab === "Habits") dataForm.append("image", file);

		// Append other fields
		modalConfig[activeTab].fields.forEach((field) => {
			dataForm.append(field.name, formData[field.name]);
		});

		// Send to backend
		let path;
		if (isEditMode) {
			path = activeTab === "HighLights" ? "highlights/update" : "habits/update";
			dataForm.append("id", selectedItem.id);
		} else {
			path = activeTab === "HighLights" ? "highlights/create" : "habits/create";
		}
		let data = {
			path: path,
			payload: dataForm
		};

		let response = await ApiService.postRequest(data);

		if (response.data) {
			if (activeTab === "HighLights") {
				if (isEditMode) {
					// setHighlights(highlights.map((h) => (h.id === selectedItem.id ? response.data.data : h)));
					getHighlights();
				} else {
					getHighlights();
					// setHighlights((prev) => [response.data.data, ...prev]);
				}
			} else {
				if (isEditMode) {
					getHabits();
					// setHabits(habits.map((h) => (h.id === selectedItem.id ? response.data.data : h)));
				} else {
					// setHabits((prev) => [response.data.data, ...prev]);
					getHabits();
				}
			}
			setIsModalOpen(false);
			setIsEditMode(false);
			setSelectedItem(null);
			setFormData(
				modalConfig[activeTab].fields.reduce((acc, field) => {
					if (field.type === "checkbox") {
						acc[field.name] = field.options ? [] : false;
					} else {
						acc[field.name] = "";
					}
					return acc;
				}, {})
			);
			setFile(null);
			setFormErrors({});
		}
	}, [validateForm, file, formData, activeTab, modalConfig, isEditMode, selectedItem, highlights, habits]);

	const validateItemForm = useCallback(() => {
		const errors = {};
		if (!itemFile) errors.media = "Media file is required.";
		if (!itemFormData.caption.trim()) errors.caption = "Caption is required.";
		if (!itemFormData.duration || itemFormData.duration <= 0) errors.duration = "Duration must be a positive number.";
		setItemErrors(errors);
		return Object.keys(errors).length === 0;
	}, [itemFile, itemFormData]);

	const handleAddItemSubmit = useCallback(async () => {
		if (!validateItemForm()) return;

		const dataForm = new FormData();

		// Append file
		if (itemFile) dataForm.append("media", itemFile);

		// Append other fields
		Object.keys(itemFormData).forEach((key) => {
			dataForm.append(key, itemFormData[key]);
		});

		// Send to backend
		let path;
		if (isEditItemMode) {
			path = "highlights/update/item";
			dataForm.append("id", selectedItemForEdit.id);
		} else {
			path = "highlights/create/items";
			dataForm.append("highlightId", selectedHighlight.id);
		}
		let data = {
			path: path,
			payload: dataForm
		};

		let response = await ApiService.postRequest(data);

		if (response) {
			if (isEditItemMode) {
				// Update the item
				const updatedHighlights = highlights.map((h) => {
					if (h.id === selectedHighlight.id) {
						return {
							...h,
							highlightItems: h.highlightItems.map((i) => (i.id === selectedItemForEdit.id ? response.data.data : i))
						};
					}
					return h;
				});
				setHighlights(updatedHighlights);
				setSelectedHighlight({
					...selectedHighlight,
					highlightItems: selectedHighlight.highlightItems.map((i) =>
						i.id === selectedItemForEdit.id ? response.data.data : i
					)
				});
			} else {
				// Add new item
				const updatedHighlights = highlights.map((h) => {
					if (h.id === selectedHighlight.id) {
						return { ...h, highlightItems: [...h.highlightItems, response.data.data] };
					}
					return h;
				});
				setHighlights(updatedHighlights);
				setSelectedHighlight({
					...selectedHighlight,
					highlightItems: [...selectedHighlight.highlightItems, response.data.data]
				});
			}
		}

		setIsAddItemModalOpen(false);
		setIsEditItemMode(false);
		setSelectedItemForEdit(null);
		setItemFormData({ caption: "", duration: "" });
		setItemFile(null);
		setItemErrors({});
	}, [validateItemForm, itemFile, itemFormData, selectedHighlight, highlights, isEditItemMode, selectedItemForEdit]);

	const updatedHighlights = async () => {
		let data = {
			path: "highlights/update",
			payload: formData
		};

		const response = await ApiService.postRequest(data);
		// setHighlights(response.data.data);
		if (response) {
			getHighlights();
			setHasFetchedHighlights(true);
			// setIsEditMode(false);
			setIsModalOpen(false);
		}
	};

	const updatedHabits = async () => {
		let data = {
			path: "habits/update",
			payload: formData
		};
		const response = await ApiService.postRequest(data);
		if (response) {
			getHabits();
			setHasFetchedHabits(true);
			// setIsEditMode(false);
			setIsModalOpen(false);
		}
	};

	const updatedHighlightsItem = async () => {
		try {
			const dataForm = new FormData();

			// Append required highlightItemId
			dataForm.append("highlightItemId", selectedItemForEdit.id);

			// Append optional fields
			if (itemFormData.caption) dataForm.append("caption", itemFormData.caption);
			if (itemFormData.duration) dataForm.append("duration", itemFormData.duration);

			// Append file if updated
			if (itemFile) dataForm.append("media", itemFile);

			let data = {
				path: "highlights/update/item",
				payload: dataForm
			};

			const response = await ApiService.postRequest(data);

			if (response) {
				// Update the highlights state
				getHighlights();

				// Reset states
				setIsAddItemModalOpen(false);
				setIsViewModalOpen(false);
				setIsEditItemMode(false);
				setSelectedItemForEdit(null);
				setItemFormData({ caption: "", duration: "" });
				setItemFile(null);
				setItemErrors({});
			}
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<>
			<section className="bg-gray-50 p-7 min-h-screen flex gap-10 flex-col">
				{/* Tabs + Actions */}
				{/* Header Section */}
				<div className="flex md:flex-row flex-col-reverse gap-8 justify-between items-center">
					<div className="flex items-center gap-8">
						{statuses.map((status, index) => (
							<div
								key={index}
								className="flex flex-col items-center cursor-pointer"
								onClick={() => setActiveTab(status)}
							>
								<p
									className={`text-lg hover:text-[#46acbe] ${
										-activeTab === status ? "text-[#46acbe]" : "text-gray-500"
									}`}
								>
									{status}
								</p>
								{activeTab === status && <span className="h-[2px] w-[100%] bg-[#46acbe] mt-1 rounded"></span>}
							</div>
						))}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Searchbar searchText={searchText} setSearchText={setSearchText} placeholder={`Search ${activeTab}`} />
						<Button
							onClick={() => setIsModalOpen(true)}
							text={`Add ${activeTab}`}
							// text="Add Item"
							icon={IoMdAdd}
							bg={activeTab === "HighLights" ? "bg-[#46abbd]" : "bg-white"}
							textColor={activeTab === "HighLights" ? "text-white" : "text-[#46abbd]"}
							// bg="bg-[#46abbd]"
							// textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Content */}
				{activeTab === "HighLights" && (
					<div className="flex flex-wrap justify-center items-center gap-3">
						{highlights.length > 0 ? (
							highlights
								.filter((item) => {
									const lowerSearch = searchText.toLowerCase();
									const titleMatch = item.title.toLowerCase().includes(lowerSearch);
									const itemsMatch =
										item.highlightItems &&
										item.highlightItems.some((hi) => hi.caption.toLowerCase().includes(lowerSearch));
									return titleMatch || itemsMatch;
								})
								.map((item, index) => (
									<div key={index} className="flex flex-col items-center gap-2">
										<div
											// onClick={() => {
											// 	setSelectedHighlight(item);
											// 	setIsViewModalOpen(true);
											// }}
											className="cursor-pointer"
										>
											<Card
												name={item.title}
												date={item.createdAt}
												pic={import.meta.env.VITE_VideoBaseURL + item?.highlightItems[0]?.mediaUrl}
												setSelected={setSelectedHighlight}
												setIsViewModalOpen={setIsViewModalOpen}
												item={item}
												handleEdit={handleEditHighlight}
												handleDelete={handleDeleteHighlight}
											/>
										</div>
									</div>
								))
						) : (
							<p>No highlights available</p>
						)}
					</div>
				)}

				{activeTab === "Habits" && (
					<div className="flex flex-wrap justify-center items-center gap-4">
						{habits.length > 0 ? (
							habits
								.filter((item) => {
									const lowerSearch = searchText.toLowerCase();
									const nameMatch = item.name.toLowerCase().includes(lowerSearch);
									const descMatch = item.description.toLowerCase().includes(lowerSearch);
									return nameMatch || descMatch;
								})
								.map((item, index) => (
									<div key={index} className="flex flex-col items-center gap-2">
										<Card
											name={item.name}
											date={item.createdAt}
											pic={import.meta.env.VITE_VideoBaseURL + item.image}
											handleEdit={handleEditHabit}
											handleDelete={handleDeleteHabit}
											item={item}
										/>
									</div>
								))
						) : (
							<p>No habits available</p>
						)}
					</div>
				)}
				{/* Content Area */}
			</section>

			{/* 🔹 Dynamic Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setIsEditMode(false);
					setSelectedItem(null);
				}}
				title={modalConfig[activeTab].title}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText={isEditMode ? "Update" : "Add"}
				onPrimaryClick={
					isEditMode && activeTab === "HighLights"
						? updatedHighlights
						: isEditItemMode && activeTab === "Habits"
						? updatedHabits
						: handleSubmit
				}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						{isEditMode && activeTab == "Habits" ? (
							<>
								<label className="text-lg font-normal text-gray-600">{modalConfig[activeTab].uploadLabel}</label>
								<ImgUploader
									onFileSelect={setFile ? (file) => setFile(file) : null}
									existingImage={isEditMode ? import.meta.env.VITE_VideoBaseURL + file : null}
								/>
							</>
						) : isEditMode && activeTab == "Highlights" ? (
							<>
								<label className="text-lg font-normal text-gray-600">{modalConfig[activeTab].uploadLabel}</label>
								{/* <ImgUploader
									onFileSelect={setFile ? (file) => setFile(file) : null}
									existingImage={isEditMode ? import.meta.env.VITE_VideoBaseURL + file : null}
								/> */}
							</>
						) : (
							<>
								<label className="text-lg font-normal text-gray-600">{modalConfig[activeTab].uploadLabel}</label>
								<ImgUploader onFileSelect={setFile ? (file) => setFile(file) : null} />
							</>
						)}
						{formErrors.media && <p className="text-red-500 text-sm">{formErrors.media}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						{isEditMode && activeTab === "HighLights" ? (
							<Inputs fields={edithighlightsFields} formData={formData} setFormData={setFormData} />
						) : activeTab === "Habits" ? (
							<Inputs fields={editHabitsFields} formData={formData} setFormData={setFormData} />
						) : (
							<>
								<Inputs fields={modalConfig[activeTab].fields} formData={formData} setFormData={setFormData} />
								{formErrors.title && <p className="text-red-500 text-sm">{formErrors.title}</p>}
								{formErrors.caption && <p className="text-red-500 text-sm">{formErrors.caption}</p>}
								{formErrors.duration && <p className="text-red-500 text-sm">{formErrors.duration}</p>}
								{formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
								{formErrors.description && <p className="text-red-500 text-sm">{formErrors.description}</p>}
							</>
						)}
					</div>
				</div>
			</Modal>

			{/* 🔹 View Highlight Modal */}
			{selectedHighlight && (
				<Modal
					isOpen={isViewModalOpen}
					onClose={() => setIsViewModalOpen(false)}
					title={selectedHighlight.title}
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[400px] max-w-3xl"
					secondaryBtnText="Close"
					onSecondaryClick={() => setIsViewModalOpen(false)}
				>
					<div className="flex flex-col gap-6 pb-4">
						<div className="flex justify-between items-center">
							<Button
								text="Add Item"
								onClick={() => setIsAddItemModalOpen(true)}
								icon={IoMdAdd}
								bg="bg-[#46abbd]"
								textColor="text-white"
								borderColor="border-[#46abbd]"
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							{selectedHighlight.highlightItems.map((highlightItem, idx) => (
								<div key={idx} className="flex flex-col gap-2">
									{highlightItem.mediaType === "photo" && (
										<img
											src={import.meta.env.VITE_VideoBaseURL + highlightItem.mediaUrl}
											alt={highlightItem.caption}
											className="rounded-lg max-h-60 w-full object-cover"
										/>
									)}
									{highlightItem.mediaType === "video" && (
										<video
											controls
											preload="metadata"
											className="rounded-lg max-h-60 w-full object-cover"
											src={import.meta.env.VITE_VideoBaseURL + highlightItem.mediaUrl}
										/>
									)}
									<p className="text-lg font-semibold">{highlightItem.caption}</p>
									<p className="text-sm text-gray-500">Viewed: {highlightItem.viewedCount}</p>
									<p className="text-sm text-gray-500">Created: {highlightItem.createdAt}</p>
									<div className="flex gap-2 mt-2">
										<button
											onClick={() => handleEditItem(highlightItem)}
											className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
										>
											Edit
										</button>
										<button
											onClick={() => {
												setItemToDeleteId(highlightItem.id);
												setIsDeleteItemModalOpen(true);
											}}
											className="px-3 py-1 bg-red-500 text-white rounded text-sm"
										>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				</Modal>
			)}

			{/* 🔹 Add/Edit Highlight Item Modal */}
			<Modal
				isOpen={isAddItemModalOpen}
				onClose={() => {
					setIsAddItemModalOpen(false);
					setIsEditItemMode(false);
					setSelectedItemForEdit(null);
				}}
				title={isEditItemMode ? "Edit Highlight Item" : "Add Highlight Item"}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText={isEditItemMode ? "Update" : "Add"}
				onPrimaryClick={isEditItemMode ? updatedHighlightsItem : handleAddItemSubmit}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Media:</label>
						<ImgUploader
							onFileSelect={setItemFile}
							existingImage={isEditItemMode ? import.meta.env.VITE_VideoBaseURL + selectedItemForEdit.mediaUrl : null}
						/>
						{itemErrors.media && <p className="text-red-500 text-sm">{itemErrors.media}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<Inputs fields={addItemFields} formData={itemFormData} setFormData={setItemFormData} />
						{itemErrors.caption && <p className="text-red-500 text-sm">{itemErrors.caption}</p>}
						{itemErrors.duration && <p className="text-red-500 text-sm">{itemErrors.duration}</p>}
					</div>
				</div>
			</Modal>

			{/* Delete Highlight Item Confirmation Modal */}
			<Modal
				isOpen={isDeleteItemModalOpen}
				onClose={() => setIsDeleteItemModalOpen(false)}
				title="Confirm Delete"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Delete"
				onPrimaryClick={confirmDeleteItem}
				onSecondaryClick={() => setIsDeleteItemModalOpen(false)}
			>
				<p>Are you sure you want to delete this highlight item? This action cannot be undone.</p>
			</Modal>
		</>
	);
}
export default memo(Tracker);
