import React, { useState, useCallback, useEffect } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import Card from "../components/Card";
import MultiSelectDropdown from "../components/MultiSelectDropdown";

import { IoMdAdd } from "react-icons/io";
import { MdEdit, MdDelete } from "react-icons/md";
import ApiService from "../services/ApiServices";

function DietPlan() {
	const [categories, setCategories] = useState([]);
	const [activeTab, setActiveTab] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [selectedDietPlan, setSelectedDietPlan] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [selectedDietPlanForEdit, setSelectedDietPlanForEdit] = useState(null);

	const [searchText, setSearchText] = useState("");
	const [selectedKcal, setSelectedKcal] = useState([]);
	const [subCategories, setSubCategories] = useState([]);
	const [filteredSubCategories, setFilteredSubCategories] = useState([]);
	const [activeSubTabs, setActiveSubTabs] = useState({});

	const [formData, setFormData] = useState({
		title: "",
		mealType: "",
		category: "",
		subCategory: "",
		ingredients: "",
		directions: "",
		calories: "",
		protein: "",
		carbs: "",
		fat: "",
		note: ""
	});
	const [file, setFile] = useState(null);
	const [errors, setErrors] = useState({});
	const [dietPlans, setDietPlans] = useState([]);
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [categoryAction, setCategoryAction] = useState("addNew");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [newCategoryName, setNewCategoryName] = useState("");
	const [newSubCategoryName, setNewSubCategoryName] = useState("");
	const [categoryErrors, setCategoryErrors] = useState({});
	const [fileCategory, setFileCategory] = useState(null);
	const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
	const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null);
	const [isEditSubCategoryModalOpen, setIsEditSubCategoryModalOpen] = useState(false);
	const [selectedSubCategoryForEdit, setSelectedSubCategoryForEdit] = useState(null);
	const [editCategoryForm, setEditCategoryForm] = useState({ title: "" });
	const [editSubCategoryForm, setEditSubCategoryForm] = useState({ title: "", image: null });

	useEffect(() => {
		getDietPlans();
		getCategories();
	}, []);

	useEffect(() => {
		if (formData.category) {
			const filtered = subCategories.filter((sub) => sub.categoryId === formData.category);
			setFilteredSubCategories(filtered);
		} else {
			setFilteredSubCategories([]);
		}
	}, [formData.category, subCategories]);

	useEffect(() => {
		const filteredMeals = dietPlans.filter((meal) => meal.categoryId === activeTab);
		const mealTypes = [...new Set(filteredMeals.map((m) => m.mealType.title))];
		const newActiveSubTabs = {};
		mealTypes.forEach((mealType) => {
			const dishesCats = [
				...new Set(filteredMeals.filter((m) => m.mealType.title === mealType).map((m) => m.dishesCategory.title))
			];
			if (dishesCats.length > 0) {
				newActiveSubTabs[mealType] = dishesCats[0];
			}
		});
		setActiveSubTabs(newActiveSubTabs);
	}, [dietPlans, activeTab]);

	const getDietPlans = useCallback(async () => {
		let data = {
			path: "meals/list",
			payload: {}
		};

		const res = await ApiService.postRequest(data);

		let plans = [];
		if (res && res.data && Array.isArray(res.data)) {
			plans = res.data;
		} else if (res && res.data && Array.isArray(res.data.data)) {
			plans = res.data.data;
		} else {
			plans = [];
		}
		setDietPlans(plans);
	}, []);

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

	const addCategoryAPI = async (name, subCategoryName) => {
		try {
			let formData = new FormData();
			formData.append("name", name);
			formData.append("subCategoryName", subCategoryName);
			formData.append("image", fileCategory);

			let data = {
				path: "dishes/create/maincategory",
				payload: formData
			};
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
			let formData = new FormData();
			formData.append("title", name);
			formData.append("categoryId", categoryId);
			formData.append("image", fileCategory);

			let data = {
				path: "dishes/create/category",
				payload: formData
			};
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

	const handleDeleteCategory = async (categoryId) => {
		if (window.confirm("Are you sure you want to delete this category?")) {
			try {
				let data = {
					path: "categories/deleteCategory",
					payload: { id: categoryId }
				};
				const response = await ApiService.postRequest(data);
				if (response && response.status === 200) {
					alert("Category deleted successfully!");
					getCategories();
				} else {
					alert("Failed to delete category.");
				}
			} catch (error) {
				console.error("Error deleting category:", error);
				alert("An error occurred while deleting the category.");
			}
		}
	};

	const handleDeleteSubCategory = async (subCategoryId) => {
		if (window.confirm("Are you sure you want to delete this subcategory?")) {
			try {
				let data = {
					path: "categories/delete/subcategory",
					payload: { id: subCategoryId }
				};
				const response = await ApiService.postRequest(data);
				if (response ) {
					alert("Subcategory deleted successfully!");
					getDietPlans();
				} else {
					alert("Failed to delete subcategory.");
				}
			} catch (error) {
				console.error("Error deleting subcategory:", error);
				alert("An error occurred while deleting the subcategory.");
			}
		}
	};

	const handleEditCategory = (category) => {
		setSelectedCategoryForEdit(category);
		setEditCategoryForm({ title: category.title });
		setIsEditCategoryModalOpen(true);
	};

	const handleEditSubCategory = (subCategory) => {
		setSelectedSubCategoryForEdit(subCategory);
		setEditSubCategoryForm({ title: subCategory.title, image: null });
		setIsEditSubCategoryModalOpen(true);
	};

	const validateCategoryForm = () => {
		const errors = {};
		if (categoryAction === "addSub") {
			if (!selectedCategory) {
				errors.selectedCategory = "Please select an existing category.";
			}
		} else if (categoryAction === "addNew") {
			if (!newCategoryName.trim()) {
				errors.newCategoryName = "Category name is required.";
			}
		}
		if (!newSubCategoryName.trim()) {
			errors.newSubCategoryName = "Sub category name is required.";
		}
		setCategoryErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.title) newErrors.title = "Title is required.";
		if (!formData.mealType) newErrors.mealType = "Meal type is required.";
		if (!formData.category) newErrors.category = "Category is required.";
		if (!formData.subCategory) newErrors.subCategory = "Sub Category is required.";
		if (!formData.ingredients.trim()) newErrors.ingredients = "Ingredients are required.";
		if (!formData.directions.trim()) newErrors.directions = "Cooking steps are required.";
		if (!formData.calories.trim()) newErrors.calories = "Calories are required.";
		if (!formData.protein.trim()) newErrors.protein = "Protein is required.";
		if (!formData.carbs.trim()) newErrors.carbs = "Carbs are required.";
		if (!formData.fat.trim()) newErrors.fat = "Fat is required.";
		if (selectedKcal.length === 0) newErrors.kcal = "At least one Kcal must be selected.";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleEditDietPlan = (item) => {
		setSelectedDietPlanForEdit(item);
		console.log("item", item);
		const kcalArray = item.kcalOptions ? item.kcalOptions.replace(/"/g, "").split(",") : [];

		// const subCat = subCategories.find((sub) => sub.id === item.dishesCategoryId);
		// console.log("subCat", subCat);
		// const categoryId = subCat ? subCat.categoryId : "";
		// console.log("categoryId", categoryId);
		// const matchingSubCategory = subCategories.find((sub) => sub.id === item.dishesCategoryId);
		// console.log("matchingSubCategory", matchingSubCategory);

		setSelectedKcal(kcalArray);
		setFormData({
			title: item.title || "",
			mealType: item.mealType?.title || "",
			category: item.categoryId || "",
			subCategory: item.dishesCategory?.id || "",
			ingredients: item.ingredientsDetails || "",
			directions: item.cookingSteps || "",
			calories: item.nutritionCalories || "",
			protein: item.nutritionProtein || "",
			carbs: item.nutritionCarbs || "",
			fat: item.nutritionFat || "",
			note: item.note || ""
		});
		setIsEditModalOpen(true);
	};

	const handleDeleteDietPlan = async (item) => {
		try {
			const data = {
				path: "meals/delete",
				payload: { id: item }
			};
			const response = await ApiService.postRequest(data);
			if (response) {
				alert("Diet plan deleted successfully!");
				getDietPlans();
			} else {
				alert("Failed to delete diet plan. Please try again.");
			}
		} catch (error) {
			console.error("Error deleting diet plan:", error);
		}
	};

	const handleUpdateDietPlan = async () => {
		if (!validateForm()) return;

		try {
			const dataForm = new FormData();
			if (file) {
				dataForm.append("image", file);
			}
			dataForm.append("id", selectedDietPlanForEdit.id);
			dataForm.append("title", formData.title);
			dataForm.append("mealType", formData.mealType);
			dataForm.append("category", formData.category);
			dataForm.append("ingredientsDetails", formData.ingredients);
			dataForm.append("cookingSteps", formData.directions);
			dataForm.append("nutritionCalories", formData.calories);
			dataForm.append("nutritionProtein", formData.protein);
			dataForm.append("nutritionCarbs", formData.carbs);
			dataForm.append("nutritionFat", formData.fat);
			dataForm.append("kcalOptions", selectedKcal.join(","));
			dataForm.append("subCategory", formData.subCategory);
			dataForm.append("note", formData.note);
			const data = {
				path: "meals/update",
				payload: dataForm
			};

			const response = await ApiService.postRequest(data);
			if (response) {
				alert("Diet plan updated successfully!");
				getDietPlans();
				setIsEditModalOpen(false);
				setSelectedKcal([]);
				setFormData({
					mealType: "",
					category: "",
					ingredients: "",
					directions: "",
					calories: "",
					protein: "",
					carbs: "",
					fat: "",
					title: "",
					subCategory: "",
					note: ""
				});
				setFile(null);
				setErrors({});
				setSelectedDietPlanForEdit(null);
			} else {
				alert("Failed to update diet plan. Please try again.");
			}
		} catch (error) {
			console.error("Error updating diet plan:", error);
			// alert("An error occurred while updating the diet plan.");
		}
	};

		const handleUpdateCategory = async () => {
	if (!editCategoryForm.title.trim()) return alert("Category name is required.");

	try {
		const response = await ApiService.postRequest({
			path: "categories/updateCategory",
			payload: {
				name: editCategoryForm.title,
				id: selectedCategoryForEdit.id,
			},
		});

		if (response?.status === 200) {
			alert("Category updated successfully!");
			setIsEditCategoryModalOpen(false);
			getCategories();
		} else {
			alert("Failed to update category.");
		}
	} catch (error) {
		console.error("Error updating category:", error);
		alert("An error occurred while updating the category.");
	}
};

	const handleUpdateSubCategory = async () => {
		if (!editSubCategoryForm.title.trim()) {
			alert("Subcategory name is required.");
			return;
		}

		let dataForm = new FormData();
		dataForm.append("title", editSubCategoryForm.title);
		if (editSubCategoryForm.image) {
			dataForm.append("image", editSubCategoryForm.image);
		}
		dataForm.append("id", selectedSubCategoryForEdit.id);

		try {
			let data = {
				path: "categories/update/subcategory",
				payload: dataForm
			};
			const response = await ApiService.postRequest(data);
			if (response && response.status === 200) {
				alert("Subcategory updated successfully!");
				setIsEditSubCategoryModalOpen(false);
				setSelectedSubCategoryForEdit(null);
				setEditSubCategoryForm({ title: "", image: null });
				getDietPlans();
			} else {
				alert("Failed to update subcategory.");
			}
		} catch (error) {
			console.error("Error updating subcategory:", error);
			alert("An error occurred while updating the subcategory.");
		}
	};

	const handleAddDietPlan = async () => {
		if (!validateForm()) return;

		try {
			const dataForm = new FormData();
			if (file) {
				dataForm.append("image", file);
			}
			dataForm.append("title", formData.title);
			dataForm.append("mealType", formData.mealType);
			dataForm.append("category", formData.category);
			dataForm.append("ingredientsDetails", formData.ingredients);
			dataForm.append("cookingSteps", formData.directions);
			dataForm.append("nutritionCalories", formData.calories);
			dataForm.append("nutritionProtein", formData.protein);
			dataForm.append("nutritionCarbs", formData.carbs);
			dataForm.append("nutritionFat", formData.fat);
			dataForm.append("kcalOptions", selectedKcal.join(","));
			dataForm.append("subCategory", formData.subCategory);
			dataForm.append("note", formData.note);
			const data = {
				path: "meals/create",
				payload: dataForm
			};

			const response = await ApiService.postRequest(data);
			if (response) {
				alert("Diet plan added successfully!");
				getDietPlans();
				setIsModalOpen(false);
				setSelectedKcal([]);
				setFormData({
					mealType: "",
					category: "",
					ingredients: "",
					directions: "",
					calories: "",
					protein: "",
					carbs: "",
					fat: "",
					title: "",
					subCategory: "",
					note: ""
				});
				setFile(null);
				setErrors({});
			} else {
				alert("Failed to add diet plan. Please try again.");
			}
		} catch (error) {
			console.error("Error adding diet plan:", error);
			// alert("An error occurred while adding the diet plan.");
		}
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-6 flex-col">
				{/* Controls Section - Always Visible at Top */}
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 w-full">
					<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
						<div className="w-full sm:w-auto">
							<Searchbar searchText={searchText} setSearchText={setSearchText} placeholder="Search diet plans..." />
						</div>
						<div className="w-full sm:w-auto">
							<MultiSelectDropdown
								options={["1300", "1400", "1500", "1600", "1700", "1800", "1900", "2000"]}
								selectedValues={selectedKcal}
								onChange={setSelectedKcal}
								placeholder="Filter by kcal"
							/>
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
							text="Add Diet Plan"
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
								className="group flex flex-col items-center cursor-pointer flex-shrink-0 min-w-0 relative"
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
								{/* Tooltip */}
								<div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-200 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-3 items-center shadow-lg border border-gray-700 pointer-events-none">
																	<MdEdit
																		className="cursor-pointer pointer-events-auto text-black hover:text-blue-400 transition-colors duration-200 text-sm"
																		onClick={(e) => {
																		e.stopPropagation();
																		handleEditCategory(category);
																		}}
																	/>
																	 <div className="w-[1px] h-3 bg-gray-600" /> {/* Divider line */}
																	<MdDelete
																		className="cursor-pointer text-black pointer-events-auto hover:text-red-400 transition-colors duration-200 text-sm"
																		onClick={(e) => {
																		e.stopPropagation();
																		handleDeleteCategory(category.id);
																		}}
																	/>
																</div>
							</div>
						))}
					</div>
				</div>

				{/* Diet Plans Content */}
				<div className="flex flex-col gap-8">
					{(() => {
						let filteredMeals = dietPlans.filter((meal) => meal.categoryId === activeTab);

						// Filter by search text
						if (searchText.trim() !== "") {
							const lowerSearch = searchText.toLowerCase();
							filteredMeals = filteredMeals.filter((meal) => meal.title.toLowerCase().includes(lowerSearch));
						}

						// Filter by selected kcal options if any selected
						if (selectedKcal.length > 0) {
							filteredMeals = filteredMeals.filter((meal) => {
								if (!meal.kcalOptions) return false;
								const mealKcals = meal.kcalOptions.replace(/"/g, "").split(",");
								return mealKcals.some((kcal) => selectedKcal.includes(kcal));
							});
						}

						const mealTypes = [...new Set(filteredMeals.map((m) => m.mealType.title))];
						return mealTypes.map((mealType) => (
							<div key={mealType} className="flex flex-col gap-4">
								<h2 className="text-xl font-semibold text-gray-800">{mealType}</h2>
								{(() => {
									const dishesCats = [
										...new Set(
											filteredMeals.filter((m) => m.mealType?.title === mealType).map((m) => m.dishesCategory.title)
										)
									];
									const activeSub = activeSubTabs[mealType] || (dishesCats.length > 0 ? dishesCats[0] : "");
									return (
										<div className="flex flex-col gap-4">
											<div className="flex items-center gap-8">
												{dishesCats.map((dishCat) => {
													const subCat = subCategories.find((sub) => sub.title === dishCat);
													return (
														<div
															key={dishCat}
															className="group flex flex-col items-center cursor-pointer relative"
															onClick={() => setActiveSubTabs((prev) => ({ ...prev, [mealType]: dishCat }))}
														>
															<p
																className={`text-lg hover:text-[#46acbe] ${
																	activeSub === dishCat ? "text-[#46acbe]" : "text-gray-500"
																}`}
															>
																{dishCat}
															</p>
															{activeSub === dishCat && (
																<span className="h-[2px] w-[100%] bg-[#46acbe] mt-1 rounded"></span>
															)}
															{/* Tooltip */}
															{subCat && (
																
																<div className="absolute top-9 left-1/2 -translate-x-1/2 bg-gray-200 backdrop-blur-sm text-white text-xs rounded-lg px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-3 items-center shadow-lg border border-gray-700 pointer-events-none">
																											<MdEdit
																												className="cursor-pointer pointer-events-auto text-black hover:text-blue-400 transition-colors duration-200 text-sm"
																												onClick={(e) => {
																													e.stopPropagation();
																													handleEditSubCategory(subCat);
																												}}
																											/>
																											 <div className="w-[1px] h-3 bg-gray-600" /> {/* Divider line */}
																											<MdDelete
																												className="cursor-pointer text-black pointer-events-auto hover:text-red-400 transition-colors duration-200 text-sm"
																												onClick={(e) => {
																													e.stopPropagation();
																													handleDeleteSubCategory(subCat.id);
																												}}
																											/>
																										</div>
															)}
														</div>
													);
												})}
											</div>
											<div className="flex flex-wrap justify-center items-center gap-3">
												{filteredMeals
													.filter((m) => m.mealType.title === mealType && m.dishesCategory.title === activeSub)
													.map((meal, index) => (
														<div
															key={index}
															// onClick={() => {
															// 	setSelectedDietPlan(meal);
															// 	setIsDetailModalOpen(true);
															// }}
															className="cursor-pointer"
														>
															<Card
																name={meal.title}
																date={meal.kcalOptions ? meal.kcalOptions.split(",")[0] + " kcal" : ""}
																pic={import.meta.env.VITE_VideoBaseURL + meal.image}
																setSelected={setSelectedDietPlan}
																setIsViewModalOpen={setIsDetailModalOpen}
																item={meal}
																handleDelete={handleDeleteDietPlan}
																handleEdit={handleEditDietPlan}
															/>
														</div>
													))}
											</div>
										</div>
									);
								})()}
							</div>
						));
					})()}
				</div>
			</section>

			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setSelectedKcal([]);
					setFormData({
						title: "",
						mealType: "",
						category: "",
						subCategory: "",
						ingredients: "",
						directions: "",
						calories: "",
						protein: "",
						carbs: "",
						fat: "",
						note: ""
					});
					setFile(null);
					setErrors({});
				}}
				title="Add New Diet-Plan"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={handleAddDietPlan}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image:</label>
						<ImgUploader onFileSelect={setFile} />
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Select Kcal:</label>
						<div className="flex flex-wrap items-center gap-7">
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1300"
									checked={selectedKcal.includes("1300")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1300 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1400"
									checked={selectedKcal.includes("1400")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1400 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1500"
									checked={selectedKcal.includes("1500")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1500 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1600"
									checked={selectedKcal.includes("1600")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1600 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1700"
									checked={selectedKcal.includes("1700")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1700 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1800"
									checked={selectedKcal.includes("1800")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1800 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1900"
									checked={selectedKcal.includes("1900")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1900 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="2000"
									checked={selectedKcal.includes("2000")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">2000 kcal</p>
							</div>
						</div>
						{errors.kcal && <p className="text-red-500 text-sm mt-1">{errors.kcal}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Title</label>
						<input
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							placeholder="enter title"
							type="text"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Meal Type</label>
						<select
							value={formData.mealType}
							onChange={(e) => setFormData((prev) => ({ ...prev, mealType: e.target.value }))}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                      focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{/* <option value="2 Meal">2 Meal</option> */}
							<option value="3 meal">3 meal</option>
						</select>
						{errors.mealType && <p className="text-red-500 text-sm">{errors.mealType}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Category:</label>
						<select
							value={formData.category}
							onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value, subCategory: "" }))}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                      focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{categories?.map((opt, i) => (
								<option key={i} value={opt.id || opt}>
									{opt.title || opt}
								</option>
							))}
						</select>
						{errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Sub Category:</label>
						<select
							// defaultValue=""
							value={formData.subCategory}
							onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                      focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{filteredSubCategories?.map((opt, i) => (
								<option key={i} value={opt.id || opt}>
									{opt.title || opt}
								</option>
							))}
							{/* <option value="1 month">Junior Moderator</option> */}
							{/* <option value="3 month">Senior Moderator</option> */}
						</select>
						{errors.subCategory && <p className="text-red-500 text-sm">{errors.subCategory}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Ingredients details:</label>
						<textarea
							value={formData.ingredients}
							onChange={(e) => setFormData((prev) => ({ ...prev, ingredients: e.target.value }))}
							placeholder="enter details"
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
						{errors.ingredients && <p className="text-red-500 text-sm">{errors.ingredients}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Cooking Steps:</label>
						<textarea
							value={formData.directions}
							onChange={(e) => setFormData((prev) => ({ ...prev, directions: e.target.value }))}
							placeholder="enter steps"
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
						{errors.directions && <p className="text-red-500 text-sm">{errors.directions}</p>}
					</div>
					<h2 className="text-lg font-semibold text-gray-800">Nutrition (Per Serving):</h2>
					<div className="flex md:flex-row flex-col items-center gap-4">
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Calories (G):</label>
							<input
								type="text"
								value={formData.calories}
								onChange={(e) => setFormData((prev) => ({ ...prev, calories: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.calories && <p className="text-red-500 text-sm">{errors.calories}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Protein (G):</label>
							<input
								type="text"
								value={formData.protein}
								onChange={(e) => setFormData((prev) => ({ ...prev, protein: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.protein && <p className="text-red-500 text-sm">{errors.protein}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Carbs (G):</label>
							<input
								type="text"
								value={formData.carbs}
								onChange={(e) => setFormData((prev) => ({ ...prev, carbs: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.carbs && <p className="text-red-500 text-sm">{errors.carbs}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Fat (G):</label>
							<input
								type="text"
								value={formData.fat}
								onChange={(e) => setFormData((prev) => ({ ...prev, fat: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.fat && <p className="text-red-500 text-sm">{errors.fat}</p>}
						</div>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Note:</label>
						<textarea
							value={formData.note}
							onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
							placeholder="enter notes"
							rows={2}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
								focus:outline-none focus:border-[#46acbe] resize-y"
						/>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedDietPlanForEdit(null);
					setSelectedKcal([]);
					setFormData({
						mealType: "",
						category: "",
						ingredients: "",
						directions: "",
						calories: "",
						protein: "",
						carbs: "",
						fat: "",
						title: "",
						subCategory: "",
						note: ""
					});
					setFile(null);
					setErrors({});
				}}
				title="Edit Diet-Plan"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={handleUpdateDietPlan}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image:</label>
						<ImgUploader
							onFileSelect={setFile}
							existingImage={
								selectedDietPlanForEdit ? import.meta.env.VITE_VideoBaseURL + selectedDietPlanForEdit.image : null
							}
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Select Kcal:</label>
						<div className="flex flex-wrap items-center gap-7">
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1300"
									checked={selectedKcal.includes("1300")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1300 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1400"
									checked={selectedKcal.includes("1400")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1400 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1500"
									checked={selectedKcal.includes("1500")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1500 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1600"
									checked={selectedKcal.includes("1600")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1600 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1700"
									checked={selectedKcal.includes("1700")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1700 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1800"
									checked={selectedKcal.includes("1800")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1800 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="1900"
									checked={selectedKcal.includes("1900")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">1900 kcal</p>
							</div>
							<div className="flex gap-1 items-center">
								<input
									className="w-4 h-4 accent-[#46abbd]"
									type="checkbox"
									value="2000"
									checked={selectedKcal.includes("2000")}
									onChange={(e) => {
										const value = e.target.value;
										if (e.target.checked) {
											setSelectedKcal((prev) => [...prev, value]);
										} else {
											setSelectedKcal((prev) => prev.filter((k) => k !== value));
										}
									}}
								/>
								<p className="text-sm font-light text-gray-500">2000 kcal</p>
							</div>
						</div>
						{errors.kcal && <p className="text-red-500 text-sm mt-1">{errors.kcal}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Title</label>
						<input
							value={formData.title}
							onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
							placeholder="enter title"
							type="text"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						{errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Meal Type</label>
						<select
							value={formData.mealType}
							onChange={(e) => setFormData((prev) => ({ ...prev, mealType: e.target.value }))}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                      focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{/* <option value="2 Meal">2 Meal</option> */}
							<option value="3 meal">3 meal</option>
						</select>
						{errors.mealType && <p className="text-red-500 text-sm">{errors.mealType}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Category:</label>
						<select
							value={formData.category}
							onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value, subCategory: "" }))}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                      focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{categories?.map((opt, i) => (
								<option key={i} value={opt.id || opt}>
									{opt.title || opt}
								</option>
							))}
						</select>
						{errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Sub Category:</label>
						<select
							value={formData.subCategory}
							onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                      focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{filteredSubCategories?.map((opt, i) => (
								<option key={i} value={opt.id || opt}>
									{opt.title || opt}
								</option>
							))}
						</select>
						{errors.subCategory && <p className="text-red-500 text-sm">{errors.subCategory}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Ingredients details:</label>
						<textarea
							value={formData.ingredients}
							onChange={(e) => setFormData((prev) => ({ ...prev, ingredients: e.target.value }))}
							placeholder="enter details"
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
						{errors.ingredients && <p className="text-red-500 text-sm">{errors.ingredients}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Cooking Steps:</label>
						<textarea
							value={formData.directions}
							onChange={(e) => setFormData((prev) => ({ ...prev, directions: e.target.value }))}
							placeholder="enter steps"
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
						{errors.directions && <p className="text-red-500 text-sm">{errors.directions}</p>}
					</div>
					<h2 className="text-lg font-semibold text-gray-800">Nutrition (Per Serving):</h2>
					<div className="flex md:flex-row flex-col items-center gap-4">
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Calories (G):</label>
							<input
								type="text"
								value={formData.calories}
								onChange={(e) => setFormData((prev) => ({ ...prev, calories: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.calories && <p className="text-red-500 text-sm">{errors.calories}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Protein (G):</label>
							<input
								type="text"
								value={formData.protein}
								onChange={(e) => setFormData((prev) => ({ ...prev, protein: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.protein && <p className="text-red-500 text-sm">{errors.protein}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Carbs (G):</label>
							<input
								type="text"
								value={formData.carbs}
								onChange={(e) => setFormData((prev) => ({ ...prev, carbs: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.carbs && <p className="text-red-500 text-sm">{errors.carbs}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Fat (G):</label>
							<input
								type="text"
								value={formData.fat}
								onChange={(e) => setFormData((prev) => ({ ...prev, fat: e.target.value }))}
								placeholder="enter"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                    focus:outline-none focus:border-[#46acbe]"
							/>
							{errors.fat && <p className="text-red-500 text-sm">{errors.fat}</p>}
						</div>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Note:</label>
						<textarea
							value={formData.note}
							onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
							placeholder="enter notes"
							rows={2}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
								focus:outline-none focus:border-[#46acbe] resize-y"
						/>
					</div>
				</div>
			</Modal>

			{/* Category Modal */}
			<Modal
				isOpen={isCategoryModalOpen}
				onClose={() => {
					setIsCategoryModalOpen(false);
					setCategoryAction("addNew");
					setSelectedCategory("");
					setNewCategoryName("");
					setNewSubCategoryName("");
					setCategoryErrors({});
					setFileCategory(null);
				}}
				title="Add Category"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-lg"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={() => {
					if (validateCategoryForm()) {
						if (categoryAction === "addNew") {
							addCategoryAPI(newCategoryName, newSubCategoryName);
						} else if (categoryAction === "addSub") {
							addSubCategoryAPI(newSubCategoryName, selectedCategory);
						}
						setIsCategoryModalOpen(false);
						setCategoryAction("addNew");
						setSelectedCategory("");
						setNewCategoryName("");
						setNewSubCategoryName("");
						setCategoryErrors({});
						setFileCategory(null);
					}
				}}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image:</label>
						<ImgUploader onFileSelect={setFileCategory} />
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Action:</label>
						<select
							value={categoryAction}
							onChange={(e) => setCategoryAction(e.target.value)}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						>
							<option value="addNew">Add New Category</option>
							<option value="addSub">Add Sub Category to Existing Category</option>
						</select>
					</div>
					{categoryAction === "addNew" && (
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Category Name:</label>
							<input
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								placeholder="Enter category name"
								type="text"
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
							/>
							{categoryErrors.newCategoryName && (
								<p className="text-red-500 text-sm">{categoryErrors.newCategoryName}</p>
							)}
						</div>
					)}
					{categoryAction === "addSub" && (
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Select Category:</label>
							<select
								value={selectedCategory}
								onChange={(e) => setSelectedCategory(e.target.value)}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
							>
								<option value="">Select</option>
								{categories?.map((opt, i) => (
									<option key={i} value={opt.id || opt}>
										{opt.title || opt}
									</option>
								))}
							</select>
							{categoryErrors.selectedCategory && (
								<p className="text-red-500 text-sm">{categoryErrors.selectedCategory}</p>
							)}
						</div>
					)}
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Sub Category Name:</label>
						<input
							value={newSubCategoryName}
							onChange={(e) => setNewSubCategoryName(e.target.value)}
							placeholder="Enter sub category name"
							type="text"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
						{categoryErrors.newSubCategoryName && (
							<p className="text-red-500 text-sm">{categoryErrors.newSubCategoryName}</p>
						)}
					</div>
				</div>
			</Modal>

			{/* Edit Category Modal */}
			<Modal
				isOpen={isEditCategoryModalOpen}
				onClose={() => {
					setIsEditCategoryModalOpen(false);
					setSelectedCategoryForEdit(null);
					setEditCategoryForm({ title: "" });
				}}
				title="Edit Category"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-lg"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={handleUpdateCategory}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Category Name:</label>
						<input
							type="text"
							value={editCategoryForm.title}
							onChange={(e) => setEditCategoryForm({ ...editCategoryForm, title: e.target.value })}
							placeholder="Enter category name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
				</div>
			</Modal>

			{/* Edit Subcategory Modal */}
			<Modal
				isOpen={isEditSubCategoryModalOpen}
				onClose={() => {
					setIsEditSubCategoryModalOpen(false);
					setSelectedSubCategoryForEdit(null);
					setEditSubCategoryForm({ title: "", image: null });
				}}
				title="Edit Subcategory"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-lg"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={handleUpdateSubCategory}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Subcategory Name:</label>
						<input
							type="text"
							value={editSubCategoryForm.title}
							onChange={(e) => setEditSubCategoryForm({ ...editSubCategoryForm, title: e.target.value })}
							placeholder="Enter subcategory name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image (optional):</label>
						<ImgUploader
							onFileSelect={(file) => setEditSubCategoryForm({ ...editSubCategoryForm, image: file })}
							existingImage={selectedSubCategoryForEdit ? import.meta.env.VITE_VideoBaseURL + selectedSubCategoryForEdit.image : null}
						/>
					</div>
				</div>
			</Modal>

			{/* Detail Modal */}
			<Modal
				isOpen={isDetailModalOpen}
				onClose={() => {
					setIsDetailModalOpen(false);
					setSelectedDietPlan(null);
				}}
				title={selectedDietPlan?.title || ""}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[600px] max-w-5xl"
				secondaryBtnText="Close"
				secondaryBtnClass="flex w-full items-center justify-center gap-1 border border-red-300 bg-red-500 text-white text-base px-4 py-2 rounded-xl"
			>
				{selectedDietPlan && (
					<div className="flex flex-col gap-8 pb-6">
						{/* Image */}
						<div className="w-full flex justify-center">
							<img
								src={import.meta.env.VITE_VideoBaseURL + selectedDietPlan.image}
								alt={selectedDietPlan.title}
								className="w-full max-w-xl h-72 object-cover rounded-xl shadow-md"
							/>
						</div>

						{/* Details Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div className="flex flex-col gap-3">
								<label className="text-lg font-semibold text-gray-800">Meal Type:</label>
								<p className="text-base text-gray-900 bg-gray-100 p-3 rounded-lg shadow-inner">
									{selectedDietPlan.mealType?.title}
								</p>
							</div>
							<div className="flex flex-col gap-3">
								<label className="text-lg font-semibold text-gray-800">Category:</label>
								<p className="text-base text-gray-900 bg-gray-100 p-3 rounded-lg shadow-inner">
									{selectedDietPlan.dishesCategory?.title}
								</p>
							</div>
							<div className="flex flex-col gap-3">
								<label className="text-lg font-semibold text-gray-800">Dishes Category:</label>
								<p className="text-base text-gray-900 bg-gray-100 p-3 rounded-lg shadow-inner">
									{selectedDietPlan.dishesCategory?.title}
								</p>
							</div>
						</div>

						{/* Kcal Options */}
						<div className="flex flex-col gap-4">
							<label className="text-lg font-semibold text-gray-800">Kcal Options:</label>
							<div className="flex flex-wrap items-center gap-3">
								{selectedDietPlan.kcalOptions
									?.replace(/"/g, "")
									.split(",")
									.map((kcal, index) => (
										<span
											key={index}
											className="px-4 py-2 bg-[#46acbe] text-white rounded-full text-base font-semibold shadow-md"
										>
											{kcal.trim()} kcal
										</span>
									))}
							</div>
						</div>

						{/* Ingredients */}
						<div className="flex flex-col gap-6">
							<label className="text-lg font-semibold text-gray-800">Ingredients:</label>
							<div className="bg-gray-100 p-5 rounded-lg shadow-inner">
								<p className="text-base text-gray-900 whitespace-pre-wrap">{selectedDietPlan.ingredientsDetails}</p>
							</div>
						</div>

						{/* Cooking Steps */}
						<div className="flex flex-col gap-6">
							<label className="text-lg font-semibold text-gray-800">Cooking Steps:</label>
							<div className="bg-gray-100 p-5 rounded-lg shadow-inner">
								<p className="text-base text-gray-900 whitespace-pre-wrap">{selectedDietPlan.cookingSteps}</p>
							</div>
						</div>

						{/* Nutrition */}
						<div className="flex flex-col gap-6">
							<h2 className="text-xl font-bold text-gray-900 border-b pb-3">Nutrition (Per Serving)</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="flex flex-col items-center bg-blue-100 p-5 rounded-xl shadow-md">
									<label className="text-base font-semibold text-blue-700">Calories</label>
									<p className="text-2xl font-extrabold text-blue-800">{selectedDietPlan.nutritionCalories} g</p>
								</div>
								<div className="flex flex-col items-center bg-green-100 p-5 rounded-xl shadow-md">
									<label className="text-base font-semibold text-green-700">Protein</label>
									<p className="text-2xl font-extrabold text-green-800">{selectedDietPlan.nutritionProtein} g</p>
								</div>
								<div className="flex flex-col items-center bg-yellow-100 p-5 rounded-xl shadow-md">
									<label className="text-base font-semibold text-yellow-700">Carbs</label>
									<p className="text-2xl font-extrabold text-yellow-800">{selectedDietPlan.nutritionCarbs} g</p>
								</div>
								<div className="flex flex-col items-center bg-red-100 p-5 rounded-xl shadow-md">
									<label className="text-base font-semibold text-red-700">Fat</label>
									<p className="text-2xl font-extrabold text-red-800">{selectedDietPlan.nutritionFat} g</p>
								</div>
							</div>
						</div>

						{/* Note */}
						{selectedDietPlan.note && (
							<div className="flex flex-col gap-6">
								<label className="text-lg font-semibold text-gray-800">Note:</label>
								<div className="bg-gray-100 p-5 rounded-lg shadow-inner">
									<p className="text-base text-gray-900">{selectedDietPlan.note}</p>
								</div>
							</div>
						)}
					</div>
				)}
			</Modal>
		</>
	);
}

export default DietPlan;
