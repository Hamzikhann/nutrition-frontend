import React, { useState, useEffect, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import Filter from "../components/Filter";
import DataTable from "react-data-table-component";
import { FiMoreVertical } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import ApiService from "../services/ApiServices";

function Moderators() {
	const [openMenu, setOpenMenu] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [moderators, setModerators] = useState([]);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		role: "Junior Moderator",
		modules: [],
		password: "",
		confirmPassword: ""
	});
	const [errors, setErrors] = useState({});
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedModerator, setSelectedModerator] = useState(null);
	const [searchText, setSearchText] = useState("");
	const [roles, setRoles] = useState([]);
	const modules = [
		"Users",
		"Plans",
		"Payments Plans",
		"Moderators",
		"Community",
		"Supplements",
		"Recipes",
		"WorkOuts",
		"Diet Plans",
		"Tracker",
		"Banner",
		"Notifications",
		"How to use"
	];

	// Fetch moderators
	const getModerators = useCallback(async () => {
		try {
			let data = {
				path: "users/list/employees",
				payload: {}
			};
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				setModerators(response.data.data || []);
			}
		} catch (error) {
			console.error("Error fetching moderators:", error);
		}
	}, []);

	const getRoles = async () => {
		try {
			let data = {
				path: "roles/list",
				payload: {}
			};
			const response = await ApiService.postRequest(data);
			if (response && response.data) {
				// return response.data.data || [];
				let roles = response.data.data.filter((role) => role.title === "Subadmin");
				setRoles(roles || []);
			}
		} catch (error) {
			console.error("Error fetching roles:", error);
		}
	};

	useEffect(() => {
		getModerators();
		getRoles();
	}, [getModerators]);

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}
		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		}
		if (!formData.phone.trim()) {
			newErrors.phone = "Phone is required";
		}
		if (!isEditMode) {
			if (!formData.password.trim()) {
				newErrors.password = "Password is required";
			}
			if (!formData.confirmPassword.trim()) {
				newErrors.confirmPassword = "Confirm Password is required";
			}
			if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = "Passwords do not match";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		// e.preventDefault();
		if (!validateForm()) return;

		try {
			let data;
			if (isEditMode) {
				data = {
					path: "users/update/employee",
					payload: {
						id: selectedModerator.id,
						...formData
					}
				};
			} else {
				data = {
					path: "users/create/employee",
					payload: formData
				};
			}

			const response = await ApiService.postRequest(data);
			console.log(response);
			if (response && response.data) {
				getModerators();
				setIsModalOpen(false);
				setIsEditMode(false);
				setSelectedModerator(null);
				setFormData({
					name: "",
					email: "",
					phone: "",
					role: "Junior Moderator",
					modules: [],
					password: "",
					confirmPassword: ""
				});
				setErrors({});
			}
		} catch (error) {
			console.error("Error saving moderator:", error);
		}
	};

	const handleMenuToggle = (id) => {
		setOpenMenu(openMenu === id ? null : id);
	};

	const handleEdit = (row) => {
		let mods = [];
		try {
			mods = typeof row.modules === "string" ? JSON.parse(row.modules) : row.modules || [];
		} catch (e) {
			mods = [];
		}
		setSelectedModerator(row);
		setFormData({
			name: row.firstName + " " + row.lastName,
			email: row.email,
			phone: row.phoneNo,
			role: row.roleId,
			modules: mods
		});
		setIsEditMode(true);
		setIsModalOpen(true);
		setOpenMenu(null);
	};

	const handleDelete = async (row) => {
		if (window.confirm("Are you sure you want to delete this moderator?")) {
			try {
				let data = {
					path: "users/delete",
					payload: { userId: row.id }
				};
				await ApiService.postRequest(data);
				getModerators();
			} catch (error) {
				console.error("Error deleting moderator:", error);
			}
		}
		setOpenMenu(null);
	};

	const columns = [
		{
			name: "Name",
			selector: (row) => row.firstName + " " + row.lastName,
			sortable: true,
			center: true,
			grow: 1
		},
		{
			name: "Email",
			selector: (row) => row.email,
			sortable: true,
			center: true,
			grow: 1
		},
		{ name: "Phone", selector: (row) => row.phoneNo, center: true, grow: 1 },
		{
			name: "Role",
			center: true,
			grow: 1,
			cell: (row) => (
				<button className="px-2 py-1 bg-green-200 hover:bg-green-300 text-green-600 rounded-xl shadow-sm text-xs transition">
					{row.role.title}
				</button>
			)
		},
		{
			name: "Modules",
			center: true,
			grow: 2,
			cell: (row) => {
				let modules = [];

				try {
					modules = row.modules ? JSON.parse(row.modules) : [];
				} catch (e) {
					console.error("Error parsing modules:", e);
				}

				return (
					<div className="flex flex-wrap gap-1 justify-center">
						{modules.length > 0 ? (
							modules.map((mod) => (
								<span key={mod} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
									{mod}
								</span>
							))
						) : (
							<span className="text-gray-400 text-xs">No modules assigned</span>
						)}
					</div>
				);
			}
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
						<Searchbar searchText={searchText} setSearchText={setSearchText} placeholder="Search moderators..." />
						<Button
							onClick={() => setIsModalOpen(true)}
							text="Add Moderators"
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
							data={moderators.filter(
								(mod) =>
									mod.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
									mod.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
									mod.email.toLowerCase().includes(searchText.toLowerCase())
							)}
							customStyles={{
								...customStyles,
								table: {
									style: {
										minWidth: "1200px"
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
									<h3 className="mt-2 text-sm font-medium text-gray-900">No moderators found</h3>
									<p className="text-sm text-gray-500">Get started by adding your first moderator.</p>
								</div>
							}
						/>
					</div>
				</div>
			</section>

			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setIsEditMode(false);
					setSelectedModerator(null);
					setFormData({
						name: "",
						email: "",
						phone: "",
						role: "Junior Moderator",
						modules: []
					});
					setErrors({});
				}}
				title={isEditMode ? "Edit Moderator" : "Add New Moderator"}
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
						<label className="text-base font-normal text-gray-600">Full Name:</label>
						<input
							type="text"
							placeholder="Enter full name"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.name ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Email:</label>
						<input
							type="email"
							placeholder="Enter email"
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.email ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Phone:</label>
						<input
							type="text"
							placeholder="Enter phone number"
							value={formData.phone}
							onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.phone ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Password:</label>
						<input
							type="password"
							placeholder="Enter password"
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.password ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Confirm Password:</label>
						<input
							type="password"
							placeholder="Enter confirm password"
							value={formData.confirmPassword}
							onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
							className={`w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border ${
								errors.confirmPassword ? "border-red-500" : "border-gray-300"
							} focus:outline-none focus:border-[#46acbe]`}
						/>
						{errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
					</div>

					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Role:</label>
						<select
							value={formData.role}
							onChange={(e) => setFormData({ ...formData, role: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select Role</option>
							{roles.map((role) => (
								<option key={role.id} value={role.id}>
									{role.title}
								</option>
							))}
						</select>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Modules Access:</label>
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
							{modules.map((mod) => (
								<label key={mod} className="inline-flex items-center space-x-2 cursor-pointer">
									<input
										type="checkbox"
										checked={formData.modules.includes(mod)}
										onChange={(e) => {
											if (e.target.checked) {
												setFormData({ ...formData, modules: [...formData.modules, mod] });
											} else {
												setFormData({
													...formData,
													modules: formData.modules.filter((m) => m !== mod)
												});
											}
										}}
										className="form-checkbox h-4 w-4 text-[#46abbd] border-gray-300 rounded"
									/>
									<span className="text-sm text-gray-700">{mod}</span>
								</label>
							))}
						</div>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default Moderators;
