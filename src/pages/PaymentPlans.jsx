import React, { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import ApiService from "../services/ApiServices";

function PaymentPlans() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
	const [openMenu, setOpenMenu] = useState(null);
	const [paymentMethods, setPaymentMethods] = useState([]);
	const [formData, setFormData] = useState({
		name: "",
		type: "",
		category: "",
		accountNumber: "",
		accountTitle: "",
		bankName: "",
		iban: "",
		swiftCode: "",
		instructions: "",
		isActive: true
	});
	const [errors, setErrors] = useState({});
	const [searchText, setSearchText] = useState("");
	const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
	const [categoryForm, setCategoryForm] = useState({ name: "" });
	const [categories, setCategories] = useState([]);

	// Fetch categories
	const getCategories = useCallback(async () => {
		try {
			let data = {
				path: "paymentTypesCategories/list",
				payload: {}
			};
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				setCategories(response.data.data || []);
			}
		} catch (error) {
			console.error("Error fetching payment categories:", error);
		}
	}, []);

	useEffect(() => {
		getCategories();
	}, []);

	// Handle category form submit
	const handleCategorySubmit = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		if (!categoryForm.name.trim()) {
			return;
		}
		try {
			let data = {
				path: "paymentTypesCategories/create",
				payload: { title: categoryForm.name }
			};
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				getCategories();
				setIsCategoryModalOpen(false);
				setCategoryForm({ name: "" });
			}
		} catch (error) {
			console.error("Error creating payment category:", error);
		}
	};

	useEffect(() => {
		getPaymentMethods();
	}, []);

	const getPaymentMethods = useCallback(async () => {
		try {
			let data = {
				path: "paymentTypes/v2/list",
				payload: {}
			};
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				setPaymentMethods(response.data.data);
			}
		} catch (error) {
			console.error("Error fetching payment methods:", error);
		}
	}, []);

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) {
			newErrors.name = "Payment method name is required";
		}
		if (!formData.type) {
			newErrors.type = "Payment type is required";
		}
		if (!formData.accountNumber.trim()) {
			newErrors.accountNumber = "Account number is required";
		}
		if (!formData.accountTitle.trim()) {
			newErrors.accountTitle = "Account title is required";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		if (!validateForm()) return;

		try {
			let data;
			if (isEditMode) {
				data = {
					path: "paymentTypes/update",
					payload: {
						id: selectedPaymentMethod.id,
						...formData
					}
				};
			} else {
				data = {
					path: "paymentTypes/create",
					payload: formData
				};
			}

			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				getPaymentMethods();
				setIsModalOpen(false);
				setIsEditMode(false);
				setSelectedPaymentMethod(null);
				setFormData({
					name: "",
					type: "",
					category: "",
					accountNumber: "",
					accountTitle: "",
					bankName: "",
					iban: "",
					swiftCode: "",
					instructions: ""
				});
				setErrors({});
			}
		} catch (error) {
			console.error("Error saving payment method:", error);
		}
	};

	const handleEdit = (row) => {
		setSelectedPaymentMethod(row);
		setFormData({
			name: row.paymentMethodName,
			type: row.paymentType,
			category: row.paymentTypesCategoryId || "",
			accountNumber: row.accountNumber,
			accountTitle: row.accountTitle,
			bankName: row.bankName || "",
			iban: row.iban || "",
			swiftCode: row.swiftCode || "",
			instructions: row.paymentInstructions || "",
			isActive: row.isActive === "Y"
		});
		setIsEditMode(true);
		setIsModalOpen(true);
		setOpenMenu(null);
	};

	const handleDelete = async (row) => {
		if (window.confirm("Are you sure you want to delete this payment method?")) {
			try {
				let data = {
					path: "paymentTypes/delete",
					payload: { id: row.id }
				};
				await ApiService.postRequest(data);
				getPaymentMethods();
			} catch (error) {
				console.error("Error deleting payment method:", error);
			}
		}
		setOpenMenu(null);
	};

	const handleMenuToggle = (id) => {
		setOpenMenu(openMenu === id ? null : id);
	};

	const columns = [
		{
			name: "Payment Method",
			selector: (row) => row.paymentMethodName,
			sortable: true,
			center: true,
			grow: 1,
			cell: (row) => (
				<div className="flex flex-col items-center">
					<span className="font-semibold text-gray-800">{row.paymentMethodName}</span>
					<span className="text-sm text-gray-500">{row.paymentType}</span>
				</div>
			)
		},
		{
			name: "Category",
			selector: (row) => row.paymentTypesCategory.title,
			sortable: true,
			center: true,
			grow: 1
		},
		{
			name: "Account Details",
			center: true,
			grow: 2,
			cell: (row) => (
				<div className="flex flex-col items-start gap-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-gray-600">Account:</span>
						<span className="text-sm text-gray-800">{row.accountNumber}</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-gray-600">Title:</span>
						<span className="text-sm text-gray-800">{row.accountTitle}</span>
					</div>
					{row.bankName && (
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-gray-600">Bank:</span>
							<span className="text-sm text-gray-800">{row.bankName}</span>
						</div>
					)}
				</div>
			)
		},
		{
			name: "Additional Info",
			center: true,
			grow: 1,
			cell: (row) => (
				<div className="flex flex-col items-center gap-1">
					{row.iban && (
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-gray-600">IBAN:</span>
							<span className="text-xs text-gray-800">{row.iban}</span>
						</div>
					)}
					{row.swiftCode && (
						<div className="flex items-center gap-2">
							<span className="text-xs font-medium text-gray-600">SWIFT:</span>
							<span className="text-xs text-gray-800">{row.swiftCode}</span>
						</div>
					)}
				</div>
			)
		},
		{
			name: "Status",
			center: true,
			grow: 1,
			cell: (row) => (
				<button
					className={`px-3 py-1 rounded-xl shadow-sm text-xs transition ${
						row.isActive === "Y"
							? "bg-green-200 hover:bg-green-300 text-green-600"
							: "bg-red-200 hover:bg-red-300 text-red-600"
					}`}
				>
					{row.isActive === "Y" ? "Active" : "Inactive"}
				</button>
			)
		},
		{
			name: "Actions",
			center: true,
			grow: 1,
			cell: (row) => (
				<div className="relative">
					<button onClick={() => handleMenuToggle(row.id)} className="p-1 rounded-full hover:bg-gray-100">
						<FiMoreVertical className="text-gray-600 text-lg" />
					</button>

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
				{/* Header Section */}
				<div className="flex xl:flex-row flex-col-reverse gap-8 justify-between items-center">
					<div className="flex items-center gap-4">
						<h1 className="text-2xl font-semibold text-gray-800">Payment Methods</h1>
						<p className="text-gray-500">Manage payment methods for users to make payments</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Searchbar searchText={searchText} setSearchText={setSearchText} placeholder="Search payment methods..." />
						<Button
							onClick={() => setIsCategoryModalOpen(true)}
							text="Add Category"
							icon={IoMdAdd}
							bg="bg-white"
							textColor="text-[#46abbd]"
							borderColor="border-[#46abbd]"
						/>
						<Button
							onClick={() => setIsModalOpen(true)}
							text="Add Payment Method"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Instructions Section */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<h3 className="text-lg font-semibold text-blue-800 mb-2">Payment Instructions</h3>
					<p className="text-blue-700 text-sm">
						Users can view these payment methods to make online payments. After making the payment, they can attach a
						screenshot of the payment confirmation for verification.
					</p>
				</div>

				{/* Main Content */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={paymentMethods.filter(
								(method) =>
									method?.paymentMethodName?.toLowerCase().includes(searchText.toLowerCase()) ||
									method?.paymentType?.toLowerCase().includes(searchText.toLowerCase()) ||
									method?.accountNumber?.includes(searchText)
							)}
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
									<h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods found</h3>
									<p className="text-sm text-gray-500">Get started by adding your first payment method.</p>
								</div>
							}
						/>
					</div>
				</div>
			</section>

			{/* Add/Edit Payment Method Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setIsEditMode(false);
					setSelectedPaymentMethod(null);
					setFormData({
						name: "",
						type: "",
						category: "",
						accountNumber: "",
						accountTitle: "",
						bankName: "",
						iban: "",
						swiftCode: "",
						instructions: "",
						isActive: true
					});
					setErrors({});
				}}
				title={isEditMode ? "Edit Payment Method" : "Add New Payment Method"}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText={isEditMode ? "Update" : "Add"}
				onPrimaryClick={handleSubmit}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Payment Method Name:</label>
						<input
							type="text"
							placeholder="e.g., Stripe Account, JazzCash, Bank Transfer"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.name ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Payment Type:</label>
						<select
							value={formData.type}
							onChange={(e) => setFormData({ ...formData, type: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.type ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						>
							<option value="">Select Payment Type</option>
							<option value="Stripe">Stripe</option>
							<option value="JazzCash">JazzCash</option>
							<option value="EasyPaisa">EasyPaisa</option>
							<option value="Bank Transfer">Bank Transfer</option>
							<option value="PayPal">PayPal</option>
							<option value="Other">Other</option>
						</select>
						{errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Category:</label>
						<select
							value={formData.category}
							onChange={(e) => setFormData({ ...formData, category: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select Category</option>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.id}>
									{cat.title}
								</option>
							))}
						</select>
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Account Number:</label>
						<input
							type="text"
							placeholder="Enter account number or payment ID"
							value={formData.accountNumber}
							onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.accountNumber ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.accountNumber && <p className="text-red-500 text-sm">{errors.accountNumber}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Account Title:</label>
						<input
							type="text"
							placeholder="Enter account holder name"
							value={formData.accountTitle}
							onChange={(e) => setFormData({ ...formData, accountTitle: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.accountTitle ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.accountTitle && <p className="text-red-500 text-sm">{errors.accountTitle}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Bank Name (Optional):</label>
						<input
							type="text"
							placeholder="Enter bank name"
							value={formData.bankName}
							onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">IBAN (Optional):</label>
						<input
							type="text"
							placeholder="Enter IBAN number"
							value={formData.iban}
							onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">SWIFT Code (Optional):</label>
						<input
							type="text"
							placeholder="Enter SWIFT/BIC code"
							value={formData.swiftCode}
							onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Payment Instructions (Optional):</label>
						<textarea
							placeholder="Enter payment instructions for users"
							value={formData.instructions}
							onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">Provide detailed instructions for users on how to make payments</p>
					</div>

					{/* <div className="flex gap-3 items-center">
						<input
							type="checkbox"
							checked={formData.isActive}
							onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
							className="w-5 h-5 accent-[#46abbd]"
						/>
						<p className="text-base font-light text-gray-500">Make this payment method active</p>
					</div> */}
				</div>
			</Modal>

			{/* Add Category Modal */}
			<Modal
				isOpen={isCategoryModalOpen}
				onClose={() => {
					setIsCategoryModalOpen(false);
					setCategoryForm({ name: "" });
				}}
				title="Add New Category"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-lg"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={handleCategorySubmit}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Category Name:</label>
						<input
							type="text"
							placeholder="Enter category name"
							value={categoryForm.name}
							onChange={(e) => setCategoryForm({ name: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default PaymentPlans;
