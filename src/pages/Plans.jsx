import React, { useState, useEffect } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Filter from "../components/Filter";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import ApiService from "../services/ApiServices";

function Plans() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [openMenu, setOpenMenu] = useState(null);
	const [plans, setPlans] = useState([]);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [planForm, setPlanForm] = useState({
		name: "",
		description: "",
		duration: "1 month",
		actualPrice: "",
		discountPrice: "",
		discount: "",
		isPopular: false,
		selectedFeatures: [],
		newFeature: ""
	});

	useEffect(() => {
		if (
			planForm.actualPrice &&
			planForm.discountPrice &&
			!isNaN(planForm.actualPrice) &&
			!isNaN(planForm.discountPrice)
		) {
			const actual = parseFloat(planForm.actualPrice);
			const discountAmount = parseFloat(planForm.discountPrice);
			if (actual > 0 && discountAmount >= 0 && discountAmount <= actual) {
				const percentage = (discountAmount / actual) * 100;
				setPlanForm((prev) => ({ ...prev, discount: percentage.toFixed(2) }));
			} else {
				setPlanForm((prev) => ({ ...prev, discount: "" }));
			}
		} else {
			setPlanForm((prev) => ({ ...prev, discount: "" }));
		}
	}, [planForm.actualPrice, planForm.discountPrice]);
	const [availableFeatures, setAvailableFeatures] = useState([]);
	const [errors, setErrors] = useState({});

	const validateForm = () => {
		const newErrors = {};
		if (!planForm.name.trim()) {
			newErrors.name = "Plan name is required";
		}
		if (!planForm.description.trim()) {
			newErrors.description = "Description is required";
		}
		if (!planForm.actualPrice || isNaN(Number(planForm.actualPrice))) {
			newErrors.actualPrice = "Actual price is required and must be a number";
		}
		if (!planForm.discountPrice || isNaN(Number(planForm.discountPrice))) {
			newErrors.discountPrice = "Discount amount is required and must be a number";
		}
		if (
			planForm.actualPrice &&
			planForm.discountPrice &&
			Number(planForm.actualPrice) < Number(planForm.discountPrice)
		) {
			newErrors.discountPrice = "Discount amount cannot be greater than actual price";
		}
		if (planForm.selectedFeatures.length === 0) {
			newErrors.features = "Select at least one feature";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handlePlanSubmit = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		if (!validateForm()) {
			return;
		}
		try {
			const finalPrice = planForm.actualPrice - planForm.discountPrice;
			const payload = {
				name: planForm.name,
				details: planForm.description,
				duration: planForm.duration,
				price: finalPrice,
				actualPrice: planForm.actualPrice,
				discountPrice: planForm.discountPrice,
				discount: planForm.discount,
				isFree: planForm.isFree ? "Y" : "N",
				features: planForm.selectedFeatures,
				isPopular: planForm.isPopular ? "Y" : "N"
			};
			let data = {
				path: isEditMode ? "plans/update" : "plans/create",
				payload
			};
			if (isEditMode) {
				payload.id = selectedPlan.id;
			}
			console.log(data);
			const res = await ApiService.postRequest(data);
			console.log(res.data);
			if (res.data) {
				setIsModalOpen(false);
				getPlans();
				setPlanForm({
					name: "",
					description: "",
					duration: "1 month",
					actualPrice: "",
					discountPrice: "",
					discount: "",
					isPopular: false,
					selectedFeatures: [],
					newFeature: ""
				});
				setIsEditMode(false);
				setSelectedPlan(null);
				setErrors({});
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getPlans = async () => {
		try {
			let data = {
				path: "plans/list",
				payload: {}
			};
			const response = await ApiService.postRequest(data);
			setPlans(response.data.data);
			const allFeatures = [...new Set(response.data.data.flatMap((p) => (p.features ? JSON.parse(p.features) : [])))];
			setAvailableFeatures(allFeatures);
		} catch (error) {
			console.error("Error fetching plans:", error);
		}
	};

	useEffect(() => {
		getPlans();
	}, []);

	const handleMenuToggle = (id) => {
		setOpenMenu(openMenu === id ? null : id);
	};

	const handleEdit = (row) => {
		setSelectedPlan(row);
		setPlanForm({
			name: row.name,
			description: row.details,
			duration: row.duration,
			actualPrice: row.actualPrice || row.price || "",
			discountPrice: row.discountPrice || "",
			discount: row.discount || "",
			isPopular: row.isPopular === "Y",
			selectedFeatures: row.features ? JSON.parse(row.features) : [],
			newFeature: "",
			isFree: row.isFree === "Y"
		});
		setIsEditMode(true);
		setIsModalOpen(true);
		setOpenMenu(null);
	};

	const handleDelete = async (row) => {
		if (window.confirm("Are you sure you want to delete this plan?")) {
			try {
				let data = {
					path: "plans/delete",
					payload: { id: row.id }
				};
				await ApiService.postRequest(data);
				getPlans();
			} catch (error) {
				console.log(error);
			}
		}
		setOpenMenu(null);
	};

	const handleAddFeature = () => {
		if (planForm.newFeature.trim()) {
			setAvailableFeatures((prev) => [...prev, planForm.newFeature.trim()]);
			setPlanForm((prev) => ({
				...prev,
				selectedFeatures: [...prev.selectedFeatures, planForm.newFeature.trim()],
				newFeature: ""
			}));
		}
	};

	const handleFeatureToggle = (feature) => {
		setPlanForm((prev) => ({
			...prev,
			selectedFeatures: prev.selectedFeatures?.includes(feature)
				? prev.selectedFeatures.filter((f) => f !== feature)
				: [...prev.selectedFeatures, feature]
		}));
	};

	const columns = [
		{
			name: "Plan Details",
			center: true,
			grow: 1,
			cell: (row) => {
				const features = row.details
					.slice(1, -1)
					.split(",")
					.map((f) => f.trim());
				return (
					<div className="flex flex-col gap-1 items-start w-full">
						<span className="font-semibold text-base text-gray-800">{row.name}</span>
						<span className="text-[#668d93] text-sm font-medium">{row.duration}</span>
						<ul className="text-gray-500 text-xs list-disc list-inside">
							{features.map((feature, idx) => (
								<li key={idx}>{feature}</li>
							))}
						</ul>
					</div>
				);
			}
		},
		{
			name: "Pricing",
			center: true,
			grow: 1,
			cell: (row) => {
				const hasDiscount = Number(row.discount) > 0;

				return (
					<div className="flex flex-col items-center gap-1 text-sm">
						{/* Actual Price */}
						<div className="flex items-center gap-2">
							<span className="text-gray-500">Actual:</span>
							<span className={`font-semibold ${hasDiscount ? "line-through text-gray-400" : "text-gray-800"}`}>
								{row.actualPrice}
							</span>
						</div>

						{/* Discount Price (if any) */}
						{hasDiscount && (
							<div className="flex items-center gap-2">
								<span className="text-gray-500">Discounted:</span>
								<span className="font-semibold text-green-600">{row.discountPrice}</span>
							</div>
						)}

						{/* Discount Percentage */}
						{hasDiscount && (
							<div className="flex items-center gap-2">
								<span className="text-gray-500">Discount:</span>
								<span className="font-semibold text-blue-600">{row.discount}%</span>
							</div>
						)}

						{/* Final Price */}
						<div className="flex items-center gap-2 mt-1">
							<span className="text-gray-500">Final:</span>
							<span className="font-semibold text-[#46abbd]">{row.price}</span>
						</div>
					</div>
				);
			}
		},
		{
			name: "Features",
			center: true,
			grow: 1,
			cell: (row) => {
				console.log(row);
				const features = JSON.parse(row?.features);
				console.log(features);
				if (!features) {
					return "";
				}
				features.map((f) => f.trim());
				return (
					<div className="flex flex-col gap-1 items-start w-full">
						<ul className="text-gray-500 text-xs list-disc list-inside">
							{features.map((feature, idx) => (
								<li key={idx}>{feature}</li>
							))}
						</ul>
					</div>
				);
			}
		},
		{
			name: "Subscribers",
			center: true,
			grow: 1,
			cell: () => <span>N/A</span>
		},
		{
			name: "Status",
			center: true,
			grow: 1,
			cell: (row) => (
				<button
					className={`px-3 py-2 rounded-xl shadow-sm text-xs transition ${
						row.isFree === "Y"
							? "bg-green-200 hover:bg-green-300 text-green-600"
							: "bg-blue-200 hover:bg-blue-300 text-blue-600"
					}`}
				>
					{row.isFree === "Y" ? "Free" : "Paid"}
				</button>
			)
		},
		{
			name: "Actions",
			center: true,
			grow: 1,
			cell: (row) => (
				<div className="relative">
					{/* 3 dots button */}
					<button onClick={() => handleMenuToggle(row.id)} className="p-1 rounded-full hover:bg-gray-100">
						<FiMoreVertical className="text-gray-600 text-lg" />
					</button>

					{/* Dropdown menu */}
					{openMenu === row.id && (
						<div className="absolute right-6 -top-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
							<button
								className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
								onClick={() => handleEdit(row)}
							>
								✏️ Edit
							</button>
							<button
								className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
								onClick={() => handleDelete(row)}
							>
								🗑️ Delete
							</button>
						</div>
					)}
				</div>
			)
		}
	];

	const customStyles = {
		headRow: {
			style: {
				border: "none",
				backgroundColor: "#e5e7ea",
				boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
				fontSize: "0.75rem",
				fontWeight: 600,
				textTransform: "uppercase",
				letterSpacing: "0.5px",
				color: "#64748b",
				borderRadius: "8px 8px 0 0",
				padding: "0 8px"
			}
		},
		headCells: {
			style: {
				paddingLeft: "13px",
				// justifyContent: "center",
				paddingRight: "16px",
				"&:first-of-type": {
					paddingLeft: "20px",
					borderTopLeftRadius: "8px"
				},
				"&:last-of-type": {
					paddingRight: "20px",
					borderTopRightRadius: "8px"
				}
			}
		},
		rows: {
			style: {
				fontSize: "0.875rem",
				padding: "12px 0",
				fontWeight: 400,
				color: "#334155",
				backgroundColor: "#ffffff",
				borderBottom: "1px solid #f1f5f9",
				transition: "all 0.2s ease",
				"&:not(:last-of-type)": {
					borderBottom: "1px solid #f1f5f9"
				},
				"&:hover": {
					backgroundColor: "#f8fafc",
					transform: "translateY(-1px)",
					boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
				},
				"&.Mui-selected": {
					backgroundColor: "#f1f5fe",
					boxShadow: "inset 3px 0 0 0 #3b82f6"
				},
				"&.Mui-selected:hover": {
					backgroundColor: "#e0e7ff"
				}
			},
			stripedStyle: {
				backgroundColor: "#f8fafc"
			}
		},
		cells: {
			style: {
				paddingLeft: "16px",
				justifyContent: "center",
				paddingRight: "16px",
				"&:first-of-type": {
					paddingLeft: "24px"
				},
				"&:last-of-type": {
					paddingRight: "24px"
				}
			}
		},
		pagination: {
			style: {
				borderTop: "none",
				backgroundColor: "#ffffff",
				padding: "16px 24px",
				borderRadius: "0 0 8px 8px",
				boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
			},
			pageButtonsStyle: {
				borderRadius: "6px",
				height: "36px",
				width: "36px",
				padding: "0",
				margin: "0 4px",
				cursor: "pointer",
				transition: "all 0.2s ease",
				backgroundColor: "transparent",
				border: "1px solid #e2e8f0",
				color: "#64748b",
				"&:disabled": {
					cursor: "unset",
					opacity: 0.5
				},
				"&:hover:not(:disabled)": {
					backgroundColor: "#f1f5f9",
					borderColor: "#cbd5e1"
				},
				"&:focus": {
					outline: "none",
					backgroundColor: "#e0e7ff",
					borderColor: "#93c5fd"
				}
			}
		}
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-10 flex-col">
				{/* upper div */}
				<div className="flex xl:flex-row flex-col-reverse gap-8 justify-between items-center">
					<Filter />
					<div className="flex flex-wrap items-center gap-2">
						<Searchbar />
						<Button
							onClick={() => setIsModalOpen(true)}
							text="Add Plans"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={plans}
							customStyles={{
								...customStyles,
								table: {
									style: {
										minWidth: "900px"
									}
								}
							}}
							pagination
							highlightOnHover
							pointerOnHover
							responsive={false}
							noHeader
							noDataComponent={
								<div className="py-8 text-center">
									<h3 className="mt-2 text-sm font-medium text-gray-900">No plans found</h3>
								</div>
							}
						/>
					</div>
				</div>

				{/* Add/Edit Plan Modal */}
				<Modal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setIsEditMode(false);
						setSelectedPlan(null);
					}}
					title={isEditMode ? "Edit Plan" : "Create New Plan"}
					showTitle={true}
					showCloseIcon={true}
					showDivider={true}
					width="min-w-[300px] max-w-2xl"
					secondaryBtnText="Cancel"
					primaryBtnText={isEditMode ? "Update" : "Save"}
					onPrimaryClick={handlePlanSubmit}
				>
					<div className="flex flex-col gap-4 pb-4">
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Plan Name:</label>
							<input
								type="text"
								placeholder="enter name"
								value={planForm.name}
								onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
								className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
									errors.name ? "border-red-500" : "border-gray-300"
								} focus:outline-none focus:border-[#46acbe]`}
							/>
							{errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Description:</label>
							<textarea
								placeholder="enter description"
								value={planForm.description}
								onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
								rows={4}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
							/>
							<p className="text-xs text-gray-600">10,000 Max Characters</p>
						</div>
						<div className="w-full flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Duration:</label>
							<select
								value={planForm.duration}
								onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
							>
								<option value="1 month">1 Month</option>
								<option value="3 month">3 Months</option>
								<option value="6 month">6 Months</option>
							</select>
						</div>
						{/* <h2 className="text-xl font-semibold text-gray-800">Target Users:</h2> */}
						<div className="flex sm:flex-row flex-col justify-between gap-3">
							<div className="w-full flex flex-col gap-2">
								<label className="text-base font-normal text-gray-600">Actual Price:</label>
								<input
									type="number"
									placeholder="00.00"
									value={planForm.actualPrice}
									onChange={(e) => setPlanForm({ ...planForm, actualPrice: e.target.value })}
									className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-base font-normal text-gray-600">Discount Amount:</label>
								<input
									type="number"
									placeholder="00.00"
									value={planForm.discountPrice}
									onChange={(e) => setPlanForm({ ...planForm, discountPrice: e.target.value })}
									className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                            focus:outline-none focus:border-[#46acbe]"
								/>
							</div>
							<div className="w-full flex flex-col gap-2">
								<label className="text-base font-normal text-gray-600">Discount (%):</label>
								<input
									type="text"
									placeholder="auto-calculated"
									value={planForm.discount}
									readOnly
									className="w-full py-3 px-4 rounded-lg text-sm bg-gray-200 border border-gray-300 cursor-not-allowed"
								/>
							</div>
						</div>
						<h2 className="text-xl font-semibold text-gray-800">Plan Features:</h2>
						<div className="flex flex-wrap sm:justify-evenly justify-start sm:gap-6 gap-3">
							{availableFeatures.map((feature, index) => (
								<div key={index} className="flex gap-3 items-center">
									<input
										type="checkbox"
										checked={planForm?.selectedFeatures?.includes(feature)}
										onChange={() => handleFeatureToggle(feature)}
										className="w-5 h-5 accent-[#46abbd]"
									/>
									<div>
										<h1 className="text-base font-semibold text-gray-800">{feature}</h1>
									</div>
								</div>
							))}
							<div className="flex gap-3 items-center">
								<input
									type="text"
									value={planForm.newFeature}
									onChange={(e) => setPlanForm({ ...planForm, newFeature: e.target.value })}
									placeholder="Add new feature"
									className="w-40 py-2 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#46acbe]"
								/>
								<button
									onClick={handleAddFeature}
									className="bg-[#46abbd] text-white px-4 py-2 rounded-lg hover:bg-[#3a95a3] transition"
								>
									Add
								</button>
							</div>
						</div>
						<h2 className="text-xl font-semibold text-gray-800">Additional Options:</h2>
						<div className="flex gap-3 items-center">
							<input
								type="checkbox"
								checked={planForm.isFree}
								onChange={(e) => setPlanForm({ ...planForm, isFree: e.target.checked })}
								className="w-5 h-5 accent-[#46abbd]"
							/>
							<p className="text-base font-light text-gray-500">Mark as Free</p>
						</div>
						<div className="flex gap-3 items-center">
							<input
								type="checkbox"
								checked={planForm.isPopular}
								onChange={(e) => setPlanForm({ ...planForm, isPopular: e.target.checked })}
								className="w-5 h-5 accent-[#46abbd]"
							/>
							<p className="text-base font-light text-gray-500">Mark as popular plan</p>
						</div>
					</div>
				</Modal>
			</section>
		</>
	);
}

export default Plans;
