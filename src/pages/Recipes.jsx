import React, { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import Card from "../components/Card";
import Inputs from "../components/Inputs";

import { IoMdAdd } from "react-icons/io";
import ApiService from "../services/ApiServices";
function Recipes() {
	const [activeTab, setActiveTab] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("");
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newSubCategoryName, setNewSubCategoryName] = useState("");
	const [categoryErrors, setCategoryErrors] = useState({});
	const [recepies, setRecepies] = useState([]);
	const [categories, setCategories] = useState([]);
	const [subCategories, setSubCategories] = useState([]);
	const [filteredSubCategories, setFilteredSubCategories] = useState([]);
	const [activeSubTab, setActiveSubTab] = useState("");
	const [selectedRecipe, setSelectedRecipe] = useState(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedRecipeForEdit, setSelectedRecipeForEdit] = useState(null);
	const [formData, setFormData] = useState({
		title: "",
		categoryId: "",
		subCategoryId: "",
		ingredients: "",
		directions: "",
		nutritions: "",
		note: ""
	});
	const [file, setFile] = useState(null);
	const [recipeErrors, setRecipeErrors] = useState({});
	const [searchText, setSearchText] = useState("");

	const fields = [
		{ name: "title", label: "Recipe Name", type: "text", placeholder: "Enter recipe name" },
		{
			name: "categoryId",
			label: "Category",
			type: "select",
			options: categories,
			placeholder: "Select category"
		},
		{
			name: "subCategoryId",
			label: "Sub Category",
			type: "select",
			options: filteredSubCategories,
			placeholder: "Select sub category"
		},
		{ name: "ingredients", label: "Ingredients details", type: "textarea", placeholder: "Enter details" },
		{ name: "directions", label: "Cooking Steps", type: "textarea", placeholder: "Enter steps" },
		{
			name: "nutritions",
			label: "Nutritions",
			type: "textarea",
			placeholder: "Enter nutritions eg. fats 100, protein 100 and so on "
		},
		{
			name: "note",
			label: "Note",
			type: "textarea",
			placeholder: "Enter note "
		}
	];

	useEffect(() => {
		getCategories();
		getRecepies();
	}, []);

	useEffect(() => {
		if (formData.categoryId) {
			const filtered = subCategories.filter((sub) => sub.categoryId === formData.categoryId);
			setFilteredSubCategories(filtered);
		} else {
			setFilteredSubCategories([]);
		}
	}, [formData.categoryId, subCategories]);

	useEffect(() => {
		const activeCategory = recepies.find((cat) => cat.id === activeTab);
		if (activeCategory && activeCategory.dishesCategories && activeCategory.dishesCategories.length > 0) {
			setActiveSubTab(activeCategory.dishesCategories[0].id);
		}
	}, [recepies, activeTab]);

	const getCategories = useCallback(async () => {
		let data = {
			path: "dishes/list/category",
			payload: {}
		};

		const res = await ApiService.postRequest(data);

		if (res && res.data) {
			setCategories(res.data.list);

			// Set active tab to first category if available
			if (res.data.list.length > 0 && !activeTab) {
				setActiveTab(res.data.list[0].id);
			}

			// extract all subcategories from list
			const allSubCategories = res.data.list.flatMap((cat) => cat.dishesCategories);
			setSubCategories(allSubCategories);
		}
	}, [activeTab]);

	const getRecepies = useCallback(async () => {
		let data = {
			path: "dishes/list",
			payload: {}
		};

		let response = await ApiService.postRequest(data);

		if (response && response.data && response.data.data) {
			setRecepies(response.data.data);
		}
	}, []);

	const handleAddCategory = async (value) => {
		if (value && value.trim()) {
			const trimmed = value.trim();
			const existing = categories.find((cat) => cat.title === trimmed);
			if (existing) {
				setFormData((prev) => ({ ...prev, categoryId: existing.id, newCategory: null }));
			} else {
				// Call API to add new category
				const newCat = await addCategoryAPI(trimmed);
				if (newCat) {
					setFormData((prev) => ({ ...prev, categoryId: newCat.id, newCategory: null }));
				}
			}
		}
	};

	const addCategoryAPI = async (name, subCategoryName) => {
		try {
			console.log(name);
			console.log(subCategoryName);
			let formData = new FormData();
			formData.append("name", name);
			formData.append("subCategoryName", subCategoryName);
			formData.append("image", file);

			let data = {
				path: "dishes/create/maincategory",
				payload: formData
			};
			console.log(data);
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				// Refresh categories
				getCategories();
				return response.data;
			}
		} catch (error) {
			console.error("Error adding category:", error);
			alert("Failed to add category");
		}
	};

	const addSubCategoryAPI = async (name, categoryId) => {
		try {
			console.log(name);
			console.log(categoryId);
			let formData = new FormData();
			formData.append("title", name);
			formData.append("categoryId", categoryId);
			formData.append("image", file);

			let data = {
				path: "dishes/create/category",
				payload: formData
			};
			console.log(data);
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				// Refresh categories and sub categories
				getCategories();
				return response.data;
			}
		} catch (error) {
			console.error("Error adding sub category:", error);
			alert("Failed to add sub category");
		}
	};

	const handleAddSubCategory = (value) => {
		if (value && value.trim()) {
			const trimmed = value.trim();
			const existing = subCategories.find((sub) => sub.title === trimmed);
			if (existing) {
				setFormData((prev) => ({ ...prev, subCategoryId: existing.id, newSubCategory: null }));
			} else {
				// For now, keep local update, but in future replace with API call
				const newSub = { id: Date.now(), title: trimmed };
				setSubCategories((prev) => [...prev, newSub]);
				setFormData((prev) => ({ ...prev, subCategoryId: newSub.id, newSubCategory: null }));
			}
		}
	};

	const validateCategoryForm = () => {
		const errors = {};
		if (!selectedCategory) {
			errors.selectedCategory = "Please select a category or choose to add a new one.";
		}
		// if (selectedCategory === "addNew") {
		// 	if (!newCategoryName.trim()) {
		// 		errors.newCategoryName = "New category name is required.";
		// 	}
		// }
		if (!newSubCategoryName.trim()) {
			errors.newSubCategoryName = "New sub category name is required.";
		}
		setCategoryErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleAddRecipe = async () => {
		// Validate required fields
		const errors = {};
		if (!formData.title.trim()) {
			errors.title = "Recipe name is required.";
		}
		if (!formData.categoryId) {
			errors.categoryId = "Category is required.";
		}
		if (!formData.subCategoryId) {
			errors.subCategoryId = "Sub Category is required.";
		}
		if (!formData.ingredients.trim()) {
			errors.ingredients = "Ingredients are required.";
		}
		if (!formData.directions.trim()) {
			errors.directions = "Cooking steps are required.";
		}
		setRecipeErrors(errors);
		if (Object.keys(errors).length > 0) {
			return;
		}

		let dataForm = new FormData();

		if (file) {
			dataForm.append("image", file);
		}

		Object.keys(formData).forEach((key) => {
			dataForm.append(key, formData[key]);
		});

		try {
			let data = {
				path: "dishes/create",
				payload: dataForm
			};
			console.log(data);
			const response = await ApiService.postRequest(data);

			if (response && response.status === 200) {
				alert("Recipe added successfully!");
				// Reset form
				setFormData({
					title: "",
					categoryId: "",
					subCategoryId: "",
					ingredients: "",
					nutritions: "",
					directions: "",
					note: ""
				});
				setRecipeErrors({});
				// Close modal
				setIsModalOpen(false);
				// Refresh recipes list
				getRecepies();
			} else {
				// alert("Failed to add recipe. Please try again.");
			}
		} catch (error) {
			console.error("Error adding recipe:", error);
			alert("An error occurred while adding the recipe.");
		}
	};

	const handleEdit = (item) => {
		setSelectedRecipeForEdit(item);
		console.log(item);
		console.log(subCategories);
		// Find the subcategory to get the categoryId
		const subCat = subCategories.find((sub) => sub.id === item.dishesCategoryId);
		console.log("subCat", subCat);
		const categoryId = subCat ? subCat.categoryId : "";
		console.log("categoryId", categoryId);
		const matchingSubCategory = subCategories.find((sub) => sub.id === item.dishesCategoryId);
		console.log("matchingSubCategory", matchingSubCategory);

		setFormData({
			title: item.title || "",
			categoryId: categoryId,
			subCategoryId: matchingSubCategory ? matchingSubCategory.id : "",

			ingredients: item.ingredients || "",
			directions: item.directions || "",
			nutritions: item.nutritions || "",
			note: item.note || ""
		});
		setIsEditModalOpen(true);
	};

	const handleDelete = async (item) => {
		// if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
		try {
			let data = {
				path: `dishes/delete`,
				payload: { id: item }
			};
			const response = await ApiService.postRequest(data);
			if (response && response.status === 200) {
				alert("Recipe deleted successfully!");
				getRecepies();
			} else {
				alert("Failed to delete recipe.");
			}
		} catch (error) {
			console.error("Error deleting recipe:", error);
			alert("An error occurred while deleting the recipe.");
		}
	};

	const handleUpdateRecipe = async () => {
		// Validate required fields
		const errors = {};
		if (!formData.title.trim()) {
			errors.title = "Recipe name is required.";
		}
		if (!formData.categoryId) {
			errors.categoryId = "Category is required.";
		}
		if (!formData.subCategoryId) {
			errors.subCategoryId = "Sub Category is required.";
		}
		if (!formData.ingredients.trim()) {
			errors.ingredients = "Ingredients are required.";
		}
		if (!formData.directions.trim()) {
			errors.directions = "Cooking steps are required.";
		}
		setRecipeErrors(errors);
		if (Object.keys(errors).length > 0) {
			return;
		}

		let dataForm = new FormData();

		if (file) {
			dataForm.append("image", file);
		}

		Object.keys(formData).forEach((key) => {
			dataForm.append(key, formData[key]);
		});

		dataForm.append("id", selectedRecipeForEdit.id);

		try {
			let data = {
				path: "dishes/update",
				payload: dataForm
			};
			console.log(data);
			const response = await ApiService.postRequest(data);
			console.log(response);
			if (response && response.status === 200) {
				alert("Recipe updated successfully!");
				// Reset form
				setFormData({
					title: "",
					categoryId: "",
					subCategoryId: "",
					ingredients: "",
					nutritions: "",
					directions: "",
					note: ""
				});
				setRecipeErrors({});
				// Close modal
				setIsEditModalOpen(false);
				setSelectedRecipeForEdit(null);
				// Refresh recipes list
				getRecepies();
			} else {
				alert("Failed to update recipe.");
			}
		} catch (error) {
			console.error("Error updating recipe:", error);
			alert("An error occurred while updating the recipe.");
		}
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-6 flex-col">
				{/* Controls Section - Always Visible at Top */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 w-full">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
						<div className="w-full sm:w-auto">
							<Searchbar searchText={searchText} setSearchText={setSearchText} placeholder="Search recipes..." />
						</div>
					</div>
					<div className="flex items-stretch sm:items-center gap-2">
						<Button
							onClick={() => setIsCategoryModalOpen(true)}
							text="Add Category"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
						<Button
							onClick={() => setIsModalOpen(true)}
							text="Add Recipe"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Category Navigation - Responsive */}
				<div className="w-full">
					<div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-start">
						{categories.map((category, index) => (
							<div
								key={index}
								className="flex flex-col items-center cursor-pointer flex-shrink-0 min-w-0"
								onClick={() => setActiveTab(category.id)}
							>
								<p
									className={`text-base sm:text-lg hover:text-[#46acbe] whitespace-nowrap transition-colors duration-200 ${
										activeTab === category.id ? "text-[#46acbe]" : "text-gray-500"
									}`}
								>
									{category.title}
								</p>
								{activeTab === category.id && (
									<span className="h-[2px] w-full bg-[#46acbe] mt-1 rounded transition-all duration-200"></span>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Recipes Content */}
				{(() => {
					const activeCategory = recepies.find((cat) => cat.id === activeTab);
					if (!activeCategory) return null;
					const subCats = activeCategory.dishesCategories || [];
					const activeSub = activeSubTab || (subCats.length > 0 ? subCats[0].id : "");
					return (
						<div className="flex flex-col gap-8">
							<div className="flex items-center gap-8">
								{subCats.map((subCat) => (
									<div
										key={subCat.id}
										className="flex flex-col items-center cursor-pointer"
										onClick={() => setActiveSubTab(subCat.id)}
									>
										<p
											className={`text-lg hover:text-[#46acbe] ${
												activeSub === subCat.id ? "text-[#46acbe]" : "text-gray-500"
											}`}
										>
											{subCat.title}
										</p>
										{activeSub === subCat.id && <span className="h-[2px] w-[100%] bg-[#46acbe] mt-1 rounded"></span>}
									</div>
								))}
							</div>
							<div className="flex flex-wrap justify-center items-center gap-3">
								{subCats
									.find((sub) => sub.id === activeSub)
									?.dishes?.filter((dish) => dish.isActive === "Y")
									.filter((dish) => searchText === "" || dish.title.toLowerCase().includes(searchText.toLowerCase()))
									.map((dish, index) => (
										<div
											key={index}
											// onClick={() => {
											// 	setSelectedRecipe(dish);
											// 	setIsDetailModalOpen(true);
											// }}
											className="cursor-pointer"
										>
											<Card
												name={dish.title}
												date={dish.createdAt}
												pic={import.meta.env.VITE_VideoBaseURL + dish.image}
												setSelected={setSelectedRecipe}
												setIsViewModalOpen={setIsDetailModalOpen}
												item={dish}
												handleDelete={handleDelete}
												handleEdit={handleEdit}
											/>
										</div>
									))}
							</div>
						</div>
					);
				})()}
			</section>
			{!isEditModalOpen && (
				<Modal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setRecipeErrors({});
					}}
					title="Add New Recipe"
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[300px] max-w-2xl"
					secondaryBtnText="Cancel"
					primaryBtnText="Add"
					onPrimaryClick={handleAddRecipe}
				>
					<div className="flex flex-col gap-4 pb-4">
						<div className="w-full flex flex-col gap-2">
							<label className="text-lg font-normal text-gray-600">Upload Video:</label>
							<ImgUploader onFileSelect={setFile} />
						</div>
						<div className="w-full flex flex-col gap-2">
							<Inputs
								fields={fields}
								formData={formData}
								setFormData={setFormData}
								handleAddCategory={handleAddCategory}
								handleAddSubCategory={handleAddSubCategory}
								errors={recipeErrors}
							/>
						</div>
					</div>
				</Modal>
			)}

			<Modal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedRecipeForEdit(null);
					setFormData({
						title: "",
						category: "",
						subCategory: "",
						categoryId: "",
						subCategoryId: "",
						ingredients: "",
						directions: "",
						nutritions: "",
						note: ""
					});
					setRecipeErrors({});
					setFile(null);
				}}
				title="Edit Recipe"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={handleUpdateRecipe}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image (optional):</label>
						<ImgUploader
							onFileSelect={setFile}
							existingImage={
								selectedRecipeForEdit ? import.meta.env.VITE_VideoBaseURL + selectedRecipeForEdit.image : null
							}
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<Inputs
							fields={fields}
							formData={formData}
							setFormData={setFormData}
							handleAddCategory={handleAddCategory}
							handleAddSubCategory={handleAddSubCategory}
							errors={recipeErrors}
						/>
					</div>
				</div>
			</Modal>

			{/* New Modal for Adding Categories and Sub Categories */}
			<Modal
				isOpen={isCategoryModalOpen}
				onClose={() => {
					setIsCategoryModalOpen(false);
					setSelectedCategory("");
					setNewCategoryName("");
					setNewSubCategoryName("");
					setCategoryErrors({});
				}}
				title="Add New Category / Sub Category"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-lg"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={async () => {
					if (!validateCategoryForm()) return;
					let categoryId = selectedCategory;
					if (selectedCategory === "addNew" && newCategoryName.trim() && newSubCategoryName.trim()) {
						const newCat = await addCategoryAPI(newCategoryName.trim(), newSubCategoryName.trim());
						if (newCat) {
							categoryId = newCat.id;
						}
					}
					if (newSubCategoryName.trim() && categoryId && categoryId !== "addNew") {
						await addSubCategoryAPI(newSubCategoryName.trim(), categoryId);
					}
					setSelectedCategory("");
					setNewCategoryName("");
					setNewSubCategoryName("");
					setCategoryErrors({});
					setIsCategoryModalOpen(false);
				}}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Select Category:</label>
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">-- Select Category --</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.title}
								</option>
							))}
							<option value="addNew">Add New Category</option>
						</select>
						{categoryErrors.selectedCategory && (
							<p className="text-red-500 text-sm mt-1">{categoryErrors.selectedCategory}</p>
						)}
					</div>
					{selectedCategory === "addNew" && (
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">New Category Name:</label>
							<input
								type="text"
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								placeholder="Enter new category name"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
							/>
							{categoryErrors.newCategoryName && (
								<p className="text-red-500 text-sm mt-1">{categoryErrors.newCategoryName}</p>
							)}
						</div>
					)}
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">New Sub Category Name:</label>
						<input
							type="text"
							value={newSubCategoryName}
							onChange={(e) => setNewSubCategoryName(e.target.value)}
							placeholder="Enter new sub category name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
						{categoryErrors.newSubCategoryName && (
							<p className="text-red-500 text-sm mt-1">{categoryErrors.newSubCategoryName}</p>
						)}
						<div className="w-full flex flex-col gap-2">
							<label className="text-lg font-normal text-gray-600">Upload Image:</label>
							<ImgUploader onFileSelect={setFile} />
						</div>
					</div>
				</div>
			</Modal>

			{selectedRecipe && (
				<Modal
					isOpen={isDetailModalOpen}
					onClose={() => {
						setIsDetailModalOpen(false);
						setSelectedRecipe(null);
					}}
					title={selectedRecipe.title}
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[600px] max-w-5xl"
					secondaryBtnText="Close"
					className="rounded-xl shadow-lg"
				>
					<div className="flex flex-col gap-8 pb-6">
						<div className="w-full flex justify-center">
							<img
								src={import.meta.env.VITE_VideoBaseURL + selectedRecipe.image}
								alt={selectedRecipe.title}
								className="w-full max-w-xl h-72 object-cover rounded-xl shadow-md"
							/>
						</div>
						<div className="flex flex-col gap-6">
							<label className="text-lg font-semibold text-gray-800">Ingredients:</label>
							<div className="bg-gray-100 p-5 rounded-lg max-h-40 overflow-y-auto shadow-inner">
								<p className="text-base text-gray-900 whitespace-pre-wrap">{selectedRecipe.ingredients}</p>
							</div>
						</div>
						<div className="flex flex-col gap-6">
							<label className="text-lg font-semibold text-gray-800">Cooking Steps:</label>
							<div className="bg-gray-100 p-5 rounded-lg max-h-52 overflow-y-auto shadow-inner">
								<p className="text-base text-gray-900 whitespace-pre-wrap">{selectedRecipe.directions}</p>
							</div>
						</div>
						<div className="flex flex-col gap-6">
							<label className="text-lg font-semibold text-gray-800">Nutritions:</label>
							<div className="bg-gray-100 p-5 rounded-lg shadow-inner">
								<p className="text-base text-gray-900 whitespace-pre-wrap">{selectedRecipe.nutritions}</p>
							</div>
						</div>
						{selectedRecipe.note && (
							<div className="flex flex-col gap-6">
								<label className="text-lg font-semibold text-gray-800">Note:</label>
								<div className="bg-gray-100 p-5 rounded-lg shadow-inner">
									<p className="text-base text-gray-900 whitespace-pre-wrap">{selectedRecipe.note}</p>
								</div>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
}

export default Recipes;
