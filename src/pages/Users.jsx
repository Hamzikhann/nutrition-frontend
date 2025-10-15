import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import DataTable from "react-data-table-component";
import Filter from "../components/Filter";
import { IoMdAdd, IoMdMore, IoMdRemove } from "react-icons/io";
import ApiService from "../services/ApiServices";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell
} from "recharts";

const statuses = [{ title: "All" }, { title: "Active" }, { title: "Inactive" }, { title: "Archived" }];

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
			fontWeight: 400,
			color: "#334155",
			backgroundColor: "#ffffff",
			borderBottom: "1px solid #f1f5f9",
			transition: "all 0.2s ease",
			"&:not(:last-of-type)": {
				borderBottom: "1px solid #f1f5f9"
			},
			"&.Mui-selected": {
				backgroundColor: "#f1f5fe",
				boxShadow: "inset 3px 0 0 0 #3b82f6"
			},
			"&.Mui-selected:hover": {
				backgroundColor: "#e0e7ff"
			},
			"&:hover": {
				backgroundColor: "#F9FAFB",
				cursor: "pointer"
			}
		},
		stripedStyle: {
			backgroundColor: "#f8fafc"
		}
	},
	cells: {
		style: {
			paddingLeft: "16px",
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

function Users() {
	const [activeTab, setActiveTab] = useState({ title: "All" });
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [isUserOpen, setIsUserOpen] = useState(false);
	const [usersData, setUsersData] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [loading, setLoading] = useState(false);
	const [plans, setPlans] = useState([]);
	const [transactionImage, setTransactionImage] = useState(null);
	const [formErrors, setFormErrors] = useState({});
	const [newUser, setNewUser] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phoneNo: "",
		planId: ""
	});
	const [selectedUser, setSelectedUser] = useState(null);
	const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
	const [isTransactionOpen, setIsTransactionOpen] = useState(false);
	const [openMenuId, setOpenMenuId] = useState(null);
	const [isAssignSupplementOpen, setIsAssignSupplementOpen] = useState(false);
	const [selectedUserForSupplement, setSelectedUserForSupplement] = useState(null);
	const [supplementCategories, setSupplementCategories] = useState([]);
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [isProgressOpen, setIsProgressOpen] = useState(false);
	const [progressData, setProgressData] = useState(null);
	const [loadingProgress, setLoadingProgress] = useState(false);
	const [isBmrOpen, setIsBmrOpen] = useState(false);
	const [selectedUserForBmr, setSelectedUserForBmr] = useState(null);
	const [bmrValue, setBmrValue] = useState("");

	const handleTransactionClick = (row) => {
		setSelectedUser(row);
		setIsTransactionOpen(true);
		setOpenMenuId(null);
	};

	const handleAssessmentClick = (row) => {
		setSelectedUser(row);
		setIsAssessmentOpen(true);
		setOpenMenuId(null);
	};

	const handleProgressClick = async (row) => {
		setSelectedUser(row);
		setIsProgressOpen(true);
		setOpenMenuId(null);
		setLoadingProgress(true);
		try {
			let data = {
				path: "users/progress",
				payload: { userId: row.id }
			};
			let res = await ApiService.postRequest(data);
			setProgressData(res.data.data);
		} catch (error) {
			console.error("Error fetching progress:", error);
		} finally {
			setLoadingProgress(false);
		}
	};

	const toggleMenu = (rowId) => {
		setOpenMenuId(openMenuId === rowId ? null : rowId);
	};

	const handleAssignSupplement = (row) => {
		setSelectedUserForSupplement(row);
		setIsAssignSupplementOpen(true);
		setOpenMenuId(null);
		const assignedIds = row.assignedSupplements
			? row.assignedSupplements.map((item) => item.supplementsCategoryId)
			: [];
		setSelectedCategories(assignedIds);
	};

	const handleActivate = async (row) => {
		try {
			let data = {
				path: "users/update/status",
				payload: { id: row.id }
			};
			let res = await ApiService.postRequest(data);
			if (res) {
				// Refresh users list
				getUsers();
			}
		} catch (error) {
			console.error("Error activating user:", error);
		}
	};

	const handleDeactivate = async (row) => {
		try {
			let data = {
				path: "users/deactivate",
				payload: { userId: row.id }
			};
			let res = await ApiService.postRequest(data);
			if (res) {
				// Refresh users list
				getUsers();
			}
		} catch (error) {
			console.error("Error deactivating user:", error);
		}
	};

	const handleDeleteUser = async (row) => {
		try {
			let data = {
				path: "users/delete",
				payload: { userId: row.id }
			};
			let res = await ApiService.postRequest(data);
			if (res) {
				// Refresh users list
				getUsers();
			}
		} catch (error) {
			console.error("Error deleting user:", error);
		}
	};

	const columns = [
		{ name: "Name", selector: (row) => row.firstName + " " + row.lastName, sortable: true, ascending: true },
		{ name: "Email", selector: (row) => row.email, sortable: true, ascending: true },
		{ name: "Phone", selector: (row) => (row.phoneNo ? row.phoneNo : "N/A"), sortable: true, ascending: true },
		{ name: "Plan", selector: (row) => row.userPlans?.[0]?.plan?.name || "Free", sortable: true, ascending: true },
		{
			name: "Status",
			selector: (row) => (
				<span
					className={`px-2 py-1 rounded-full ${
						row.isActive == "Y" ? "text-green-600 bg-green-200" : "text-red-600 bg-red-200"
					}`}
				>
					{row.isActive == "Y" ? "Active" : "Inactive"}
				</span>
			),
			sortable: true,
			ascending: true
		},
		{ name: "Duration", selector: (row) => row.createdAt, sortable: true, ascending: true },
		{
			name: "Actions",
			cell: (row) => (
				<div className="relative">
					<button
						onClick={() => toggleMenu(row.id)}
						className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
					>
						<IoMdMore size={20} />
					</button>
					{openMenuId === row.id && (
						<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
							<button
								onClick={() => handleAssessmentClick(row)}
								className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
							>
								Assessment
							</button>
							<button
								onClick={() => handleTransactionClick(row)}
								className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
							>
								Transaction
							</button>
							<button
								onClick={() => handleProgressClick(row)}
								className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
							>
								Progress
							</button>
							<button
								onClick={() => handleUpdateBmr(row)}
								className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
							>
								Update BMR
							</button>
							<button
								onClick={() => handleAssignSupplement(row)}
								className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
							>
								Assign Supplement
							</button>
							{row.isActive === "Y" && (
								<button
									onClick={() => handleDeactivate(row)}
									className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
								>
									Deactivate User
								</button>
							)}
							<button
								onClick={() => handleDeleteUser(row)}
								className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
							>
								Delete User
							</button>
						</div>
					)}
				</div>
			),
			ignoreRowClick: true,
			allowOverflow: false,
			button: true,
			width: "80px"
		},
		{
			name: "Activate",
			cell: (row) =>
				row.isActive == "N" ? (
					<button
						onClick={() => handleActivate(row)}
						className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-sm text-sm transition"
					>
						Activate
					</button>
				) : null,
			ignoreRowClick: true,
			allowOverflow: false,
			button: true
		}
	];

	const filteredData =
		activeTab.title === "All"
			? usersData
			: usersData.filter(
					(user) => user?.isActive?.toLowerCase() === (activeTab?.title.toLowerCase() === "active" ? "y" : "n")
			  );

	useEffect(() => {
		getUsers();
		getPlans();
		getSupplementCategories();
	}, []);

	// ... existing code ...
	const filteredUser = useMemo(() => {
		const users = filteredData;

		if (!searchText) return users;

		const lowerCaseSearchText = searchText.toLowerCase();

		return users.filter(
			(user) =>
				user?.firstName?.toLowerCase().includes(lowerCaseSearchText) ||
				user?.lastName?.toLowerCase().includes(lowerCaseSearchText) ||
				user?.email?.toLowerCase().includes(lowerCaseSearchText) ||
				user?.phoneNo?.toLowerCase().includes(lowerCaseSearchText) ||
				// user.plan?.title.toLowerCase().includes(searchText.toLowerCase()) ||
				(user.isActive === "Y"
					? "active".startsWith(lowerCaseSearchText)
					: "inactive".startsWith(lowerCaseSearchText)) ||
				user?.isActive?.toLowerCase().startsWith(lowerCaseSearchText)
		);
	}, [usersData, searchText, activeTab, filteredData]);

	const getUsers = useCallback(async () => {
		setLoading(true);
		try {
			let data = {
				path: "users/list",
				payload: {}
			};
			let res = await ApiService.postRequest(data);
			console.log(res);
			setUsersData(res.data.data);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	const getPlans = useCallback(async () => {
		try {
			let data = {
				path: "plans/list",
				payload: {}
			};

			let response = await ApiService.postRequest(data);

			if (response) {
				setPlans(response.data.data);
			}
		} catch (error) {
			console.log(error);
		}
	}, [setPlans]);

	const getSupplementCategories = async () => {
		try {
			let data = {
				path: "supplements/list",
				payload: {}
			};
			const res = await ApiService.postRequest(data);
			setSupplementCategories(res.data.data);
		} catch (error) {
			console.log(error);
		}
	};

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setNewUser((prevUser) => ({
			...prevUser,
			[name]: value
		}));
	}, []);

	const handleFileSelect = useCallback((file) => {
		setTransactionImage(file);
	}, []);

	const validateForm = useCallback(() => {
		const errors = {};
		if (!newUser.firstName.trim()) errors.firstName = "First name is required.";
		if (!newUser.lastName.trim()) errors.lastName = "Last name is required.";
		if (!newUser.email.trim()) errors.email = "Email is required.";
		if (!newUser.phoneNo.trim()) errors.phoneNo = "Phone number is required.";
		if (!newUser.planId) errors.planId = "Plan selection is required.";
		if (!transactionImage) errors.transactionImage = "Transaction image is required.";
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	}, [newUser, transactionImage]);

	const addNewUser = useCallback(async () => {
		if (!validateForm()) return;

		const dataForm = new FormData();

		// Append file
		if (transactionImage) dataForm.append("image", transactionImage);

		// Append other fields
		Object.keys(newUser).forEach((key) => {
			dataForm.append(key, newUser[key]);
		});

		try {
			let data = {
				path: "users/create",
				payload: dataForm
			};
			let response = await ApiService.postRequest(data);
			if (response) {
				setIsUserOpen(false);
				getUsers();
				setNewUser({
					firstName: "",
					lastName: "",
					email: "",
					phoneNo: "",
					planId: ""
				});
				setTransactionImage(null);
				setFormErrors({});
			}
		} catch (error) {
			console.error("Error adding new user:", error);
		}
	}, [newUser, transactionImage, validateForm, getUsers]);

	const assignSupplements = async () => {
		try {
			let data = {
				path: "supplements/assigned/supplements",
				payload: {
					userId: selectedUserForSupplement.id,
					supplementCategoryId: selectedCategories
				}
			};
			await ApiService.postRequest(data);
			setIsAssignSupplementOpen(false);
			setSelectedCategories([]);
			setSelectedUserForSupplement(null);
		} catch (error) {
			console.log(error);
		}
	};

	const handleUpdateBmr = (row) => {
		setSelectedUserForBmr(row);
		setBmrValue(row.bmr || "0");
		setIsBmrOpen(true);
		setOpenMenuId(null);
	};

	const updateBmr = async () => {
		try {
			let data = {
				path: "users/update/bmr",
				payload: {
					userId: selectedUserForBmr.id,
					bmr: bmrValue
				}
			};
			await ApiService.postRequest(data);
			setIsBmrOpen(false);
			setSelectedUserForBmr(null);
			setBmrValue(bmrValue);
			getUsers(); // Refresh the user list
		} catch (error) {
			console.log(error);
		}
	};

	const handleBmrChange = (increment) => {
		const currentValue = parseInt(bmrValue) || 0;
		const newValue = increment ? currentValue + 100 : currentValue - 100;
		setBmrValue(newValue.toString());
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-12 flex-col">
				{/* upper div */}
				<div className="flex lg:flex-row flex-col-reverse gap-8 justify-between lg:items-center items-start">
					<Filter />
					<div className="flex flex-wrap items-center gap-2">
						<Searchbar searchText={searchText} setSearchText={setSearchText} />
						<Button
							onClick={() => setIsImportOpen(true)}
							icon={IoMdAdd}
							text="Import"
							bg="bg-white"
							textColor="text-[#46abbd]"
							borderColor="border-[#46abbd]"
						/>
						<Button
							onClick={() => setIsUserOpen(true)}
							icon={IoMdAdd}
							text="Add user"
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Tab Content */}
				<div className="flex flex-col gap-4 overflow-x-auto">
					<div className="flex items-center gap-8">
						{statuses.map((status, index) => (
							<div
								key={index}
								className="flex flex-col items-center cursor-pointer"
								onClick={() => setActiveTab(status)}
							>
								<p
									className={`text-gray-500 hover:text-[#46acbe] ${
										activeTab.title === status.title ? "text-[#46acbe]" : ""
									}`}
								>
									{status.title}
								</p>
								{activeTab.title === status.title && (
									<span className="h-[2px] w-[60px] bg-[#46acbe] mt-1 rounded"></span>
								)}
							</div>
						))}
					</div>
					<p className="text-base text-gray-500">Total Users: 1128</p>

					<div className="min-h-screen overflow-x-auto">
						<div className="min-w-[900px]">
							{" "}
							{/* Ye ensure karega ke scroll aaye jab width kam ho */}
							<DataTable
								columns={columns}
								data={filteredUser}
								customStyles={customStyles}
								pagination
								responsive={false} // Disable built-in responsive collapse
								noHeader
								progressPending={loading}
								noDataComponent={
									<div className="py-8 text-center">
										<svg
											className="mx-auto h-12 w-12 text-gray-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1}
												d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
											/>
										</svg>
										<h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
									</div>
								}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Import Modal */}
			<Modal
				isOpen={isImportOpen}
				onClose={() => setIsImportOpen(false)}
				title="Import New User"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				// width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={() => console.log("Primary Clicked")}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Excel:</label>
						<ImgUploader />
					</div>
				</div>
			</Modal>

			{/* User Modal */}
			<Modal
				isOpen={isUserOpen}
				onClose={() => setIsUserOpen(false)}
				title="Add New User"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[100px] max-w-4xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={addNewUser}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">First Name:</label>
						<input
							type="text"
							placeholder="enter name"
							name="firstName"
							value={newUser.firstName}
							onChange={handleChange}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                           focus:outline-none focus:border-[#46acbe]"
						/>
						{formErrors.firstName && <p className="text-red-500 text-sm">{formErrors.firstName}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Last Name:</label>
						<input
							type="text"
							placeholder="enter name"
							name="lastName"
							value={newUser.lastName}
							onChange={handleChange}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                           focus:outline-none focus:border-[#46acbe]"
						/>
						{formErrors.lastName && <p className="text-red-500 text-sm">{formErrors.lastName}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Email:</label>
						<input
							type="email"
							placeholder="enter email"
							name="email"
							value={newUser.email}
							onChange={handleChange}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                             focus:outline-none focus:border-[#46acbe]"
						/>
						{formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Phone:</label>
						<input
							type="number"
							placeholder="+92 327-4452434"
							name="phoneNo"
							value={newUser.phoneNo}
							onChange={handleChange}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                           focus:outline-none focus:border-[#46acbe]"
						/>
						{formErrors.phoneNo && <p className="text-red-500 text-sm">{formErrors.phoneNo}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Plan:</label>
						<select
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                             focus:outline-none focus:border-[#46acbe]"
							name="planId"
							value={newUser.planId}
							onChange={handleChange}
						>
							<option value="">Select</option>
							{plans.map((plan) => (
								<option key={plan.id} value={plan.id}>
									{plan.name}
								</option>
							))}
						</select>
						{formErrors.planId && <p className="text-red-500 text-sm">{formErrors.planId}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Transaction Image:</label>
						<ImgUploader name="transactionImage" onFileSelect={handleFileSelect} />
						{formErrors.transactionImage && <p className="text-red-500 text-sm">{formErrors.transactionImage}</p>}
					</div>
				</div>
			</Modal>

			{/* Assessment Modal */}
			<Modal
				isOpen={isAssessmentOpen}
				onClose={() => setIsAssessmentOpen(false)}
				title="User Assessment"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[200px] max-w-6xl"
				secondaryBtnText="Close"
			>
				<div className="flex flex-col gap-6 pb-4">
					{selectedUser?.userAssesmentForm ? (
						<>
							{selectedUser.userAssesmentForm.file && (
								<div className="flex justify-center mb-4">
									<a
										href={selectedUser.userAssesmentForm.file}
										download
										className="inline-flex items-center px-6 py-3 bg-[#46abbd] text-white rounded-lg hover:bg-[#3a9aa8] transition shadow-md"
									>
										<svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586 14.293 5.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
										Download Assessment Document
									</a>
								</div>
							)}

							{/* Personal Information */}
							<div className="bg-gray-50 p-6 rounded-lg shadow-sm">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
									<svg className="w-5 h-5 mr-2 text-[#46abbd]" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
											clipRule="evenodd"
										/>
									</svg>
									Personal Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Name</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.name || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Country</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.country || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Age</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.age || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Marital Status</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.martialStatus || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">WhatsApp Contact</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.whatsAppContact || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Email</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.email || "N/A"}</p>
									</div>
								</div>
							</div>

							{/* Physical Information */}
							<div className="bg-gray-50 p-6 rounded-lg shadow-sm">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
									<svg className="w-5 h-5 mr-2 text-[#46abbd]" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0z"
											clipRule="evenodd"
										/>
									</svg>
									Physical Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Weight</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.weight || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Height</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.height || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Physical Activity</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.physicalActivity || "N/A"}
										</p>
									</div>
								</div>
							</div>

							{/* Health Information */}
							<div className="bg-gray-50 p-6 rounded-lg shadow-sm">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
									<svg className="w-5 h-5 mr-2 text-[#46abbd]" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
											clipRule="evenodd"
										/>
									</svg>
									Health Information
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Purpose</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.purpose || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">PCOS Duration</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.pocsDuration || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">PCOS Symptoms</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.pcosSymptoms || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Medical History</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.medicalHistory || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Last Periods</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.lastPeriods || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Medical Conditions</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.medicalConditions || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Medicines</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.medicines || "N/A"}</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Ultrasound/Hormonal Tests</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.ultrasoundHormonalTests || "N/A"}
										</p>
									</div>
								</div>
							</div>

							{/* Dietary Preferences */}
							<div className="bg-gray-50 p-6 rounded-lg shadow-sm">
								<h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
									<svg className="w-5 h-5 mr-2 text-[#46abbd]" fill="currentColor" viewBox="0 0 20 20">
										<path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
									</svg>
									Dietary Preferences
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Breakfast Options</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.breakfastOptions || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Lunch Options</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.lunchOptions || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Dinner Options</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.dinnerOptions || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm">
										<label className="text-sm font-medium text-gray-500">Snacks Options</label>
										<p className="text-base text-gray-900 mt-1">
											{selectedUser.userAssesmentForm.snacksOptions || "N/A"}
										</p>
									</div>
									<div className="bg-white p-4 rounded-md shadow-sm md:col-span-2">
										<label className="text-sm font-medium text-gray-500">Meals</label>
										<p className="text-base text-gray-900 mt-1">{selectedUser.userAssesmentForm.meals || "N/A"}</p>
									</div>
								</div>
							</div>
						</>
					) : (
						<div className="text-center py-12">
							<svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p className="mt-4 text-lg text-gray-500">No assessment data available.</p>
						</div>
					)}
				</div>
			</Modal>

			{/* Transaction Modal */}
			<Modal
				isOpen={isTransactionOpen}
				onClose={() => setIsTransactionOpen(false)}
				title="Transaction Details"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[100px] max-w-4xl"
				secondaryBtnText="Close"
			>
				<div className="flex flex-col gap-4 pb-4">
					{selectedUser?.payment ? (
						<>
							<div className="mb-4">
								{selectedUser.payment.file && (
									<div className="text-center">
										<img
											src={import.meta.env.VITE_VideoBaseURL + selectedUser.payment.file}
											alt="Transaction Image"
											className="max-w-full h-auto max-h-96 rounded-lg shadow-md mx-auto"
											onError={(e) => {
												e.target.style.display = "none";
												e.target.nextSibling.style.display = "block";
											}}
										/>
										<p className="mt-2 text-sm text-gray-500 hidden">Image failed to load</p>
									</div>
								)}
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="text-base font-normal text-gray-600">Amount:</label>
									<p className="text-sm">{selectedUser.payment.amount || "N/A"}</p>
								</div>
								<div>
									<label className="text-base font-normal text-gray-600">Currency:</label>
									<p className="text-sm">{selectedUser.payment.currency || "N/A"}</p>
								</div>
								<div>
									<label className="text-base font-normal text-gray-600">Payment Method:</label>
									<p className="text-sm">{selectedUser.payment.paymentMethod || "N/A"}</p>
								</div>
								<div>
									<label className="text-base font-normal text-gray-600">Status:</label>
									<p className="text-sm">{selectedUser.payment.status || "N/A"}</p>
								</div>
								<div>
									<label className="text-base font-normal text-gray-600">Payment Intent ID:</label>
									<p className="text-sm">{selectedUser.payment.paymentIntentId || "N/A"}</p>
								</div>
								<div>
									<label className="text-base font-normal text-gray-600">Created At:</label>
									<p className="text-sm">{selectedUser.payment.createdAt || "N/A"}</p>
								</div>
								<div>
									<label className="text-base font-normal text-gray-600">Updated At:</label>
									<p className="text-sm">{selectedUser.payment.updatedAt || "N/A"}</p>
								</div>
							</div>
						</>
					) : (
						<p className="text-center text-gray-500">No transaction data available.</p>
					)}
				</div>
			</Modal>

			{/* Assign Supplement Modal */}
			<Modal
				isOpen={isAssignSupplementOpen}
				onClose={() => setIsAssignSupplementOpen(false)}
				title="Assign Supplement Categories"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Assign"
				onPrimaryClick={assignSupplements}
			>
				<div className="flex flex-col gap-4 pb-4">
					<p className="text-sm text-gray-600">
						Select the supplement categories to assign to {selectedUserForSupplement?.firstName}{" "}
						{selectedUserForSupplement?.lastName}:
					</p>
					<div className="flex flex-col gap-2">
						{supplementCategories.map((category) => (
							<div key={category.id} className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={selectedCategories.includes(category.id)}
									onChange={(e) => {
										if (e.target.checked) {
											setSelectedCategories([...selectedCategories, category.id]);
										} else {
											setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
										}
									}}
									className="w-4 h-4 accent-[#46abbd]"
								/>
								<label className="text-sm text-gray-700">{category.title}</label>
							</div>
						))}
					</div>
				</div>
			</Modal>

			{/* BMR Update Modal */}
			<Modal
				isOpen={isBmrOpen}
				onClose={() => setIsBmrOpen(false)}
				title={`Update BMR for ${selectedUserForBmr?.firstName} ${selectedUserForBmr?.lastName}`}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={updateBmr}
			>
				<div className="flex flex-col gap-6 pb-4">
					<div className="text-center">
						<label className="text-lg font-medium text-gray-700 mb-4 block">Current BMR Value</label>
						<div className="flex items-center justify-center gap-4">
							<button
								onClick={() => handleBmrChange(false)}
								className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition"
							>
								<IoMdRemove size={24} />
							</button>
							<div className="text-3xl font-bold text-[#46abbd] min-w-[100px] text-center">
								{bmrValue}
							</div>
							<button
								onClick={() => handleBmrChange(true)}
								className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition"
							>
								<IoMdAdd size={24} />
							</button>
						</div>
						<p className="text-sm text-gray-500 mt-2">Click + or - to adjust by 100</p>
					</div>
				</div>
			</Modal>

			{/* Progress Modal */}
			<Modal
				isOpen={isProgressOpen}
				onClose={() => setIsProgressOpen(false)}
				title={`Progress for ${selectedUser?.firstName} ${selectedUser?.lastName}`}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[400px] max-w-4xl"
				secondaryBtnText="Close"
			>
				<div className="flex flex-col gap-6 pb-4">
					{loadingProgress ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#46abbd] mx-auto"></div>
							<p className="mt-4 text-gray-600">Loading progress...</p>
						</div>
					) : progressData ? (
						<>
							{/* Workouts Section */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="text-lg font-semibold text-gray-800 mb-4">Workouts Progress</h3>
								<div className="grid grid-cols-2 gap-4 mb-4">
									<div className="text-center">
										<p className="text-2xl font-bold text-[#46abbd]">{progressData.totalWorkouts || 0}</p>
										<p className="text-sm text-gray-600">Total Workouts</p>
									</div>
									<div className="text-center">
										<p className="text-2xl font-bold text-green-600">{progressData.completedWorkouts || 0}</p>
										<p className="text-sm text-gray-600">Completed Workouts</p>
									</div>
								</div>
								<ResponsiveContainer width="100%" height={200}>
									<BarChart
										data={[
											{ name: "Total", value: progressData.totalWorkouts || 0 },
											{ name: "Completed", value: progressData.completedWorkouts || 0 }
										]}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" />
										<YAxis />
										<Tooltip />
										<Bar dataKey="value" fill="#46abbd" />
									</BarChart>
								</ResponsiveContainer>
							</div>

							{/* Habits Section */}
							<div className="bg-gray-50 p-4 rounded-lg">
								<h3 className="text-lg font-semibold text-gray-800 mb-4">Habits Progress</h3>
								{progressData.habits && progressData.habits.length > 0 ? (
									<>
										<div className="grid grid-cols-2 gap-4 mb-4">
											<div className="text-center">
												<p className="text-2xl font-bold text-[#46abbd]">{progressData.habits.length}</p>
												<p className="text-sm text-gray-600">Total Habits</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold text-green-600">
													{progressData.habits.filter((h) => h.completed).length}
												</p>
												<p className="text-sm text-gray-600">Completed Habits</p>
											</div>
										</div>
										<ResponsiveContainer width="100%" height={200}>
											<PieChart>
												<Pie
													data={[
														{ name: "Completed", value: progressData.habits.filter((h) => h.completed).length },
														{ name: "Pending", value: progressData.habits.filter((h) => !h.completed).length }
													]}
													cx="50%"
													cy="50%"
													labelLine={false}
													label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
													outerRadius={80}
													fill="#8884d8"
													dataKey="value"
												>
													<Cell fill="#46abbd" />
													<Cell fill="#e5e7ea" />
												</Pie>
												<Tooltip />
											</PieChart>
										</ResponsiveContainer>
										<div className="mt-4">
											<h4 className="text-md font-medium text-gray-700 mb-2">Habit Details:</h4>
											<ul className="space-y-2">
												{progressData.habits.map((habit, index) => (
													<li key={index} className="flex items-center gap-2">
														<span
															className={`w-3 h-3 rounded-full ${habit.completed ? "bg-green-500" : "bg-gray-400"}`}
														></span>
														<span className="text-sm">{habit.name}</span>
													</li>
												))}
											</ul>
										</div>
									</>
								) : (
									<p className="text-center text-gray-500">No habits data available.</p>
								)}
							</div>
						</>
					) : (
						<p className="text-center text-gray-500 py-8">No progress data available.</p>
					)}
				</div>
			</Modal>
		</>
	);
}

export default memo(Users);
