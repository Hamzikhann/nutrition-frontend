import React, { useState, useEffect, useCallback, memo } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import DataTable from "react-data-table-component";
import { IoMdAdd, IoMdMore } from "react-icons/io";
import ApiService from "../services/ApiServices";

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

function Banner() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [banners, setBanners] = useState([]);
	const [searchText, setSearchText] = useState("");
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({ link: "" });
	const [file, setFile] = useState(null);
	const [formErrors, setFormErrors] = useState({});
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedBanner, setSelectedBanner] = useState(null);
	const [openMenuId, setOpenMenuId] = useState(null);

	const getBanners = useCallback(async () => {
		setLoading(true);
		try {
			let data = {
				path: "banners/list",
				payload: {}
			};
			let res = await ApiService.postRequest(data);
			console.log(res);
			setBanners(res.data.data || []);
		} catch (error) {
			console.error("Error fetching banners:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getBanners();
	}, [getBanners]);

	const handleEdit = (banner) => {
		setSelectedBanner(banner);
		setFormData({ link: banner.link });
		setFile(banner.image);
		setIsEditMode(true);
		setIsModalOpen(true);
		setOpenMenuId(null);
	};

	const handleDelete = async (id) => {
		try {
			let data = { path: "banners/delete", payload: { id } };
			await ApiService.postRequest(data);
			setBanners(banners.filter((b) => b.id !== id));
		} catch (error) {
			console.error("Error deleting banner:", error);
		}
	};

	const toggleMenu = (rowId) => {
		setOpenMenuId(openMenuId === rowId ? null : rowId);
	};

	const columns = [
		{
			name: "Image",
			cell: (row) => (
				<img
					src={import.meta.env.VITE_VideoBaseURL + row.image}
					alt="Banner"
					className="w-16 h-16 object-cover rounded"
				/>
			),
			width: "100px"
		},
		{ name: "Link", selector: (row) => row.link, sortable: true },
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
						<div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
							<button
								onClick={() => handleEdit(row)}
								className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
							>
								Edit
							</button>
							<button
								onClick={() => handleDelete(row.id)}
								className="block w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-100 text-left"
							>
								Delete
							</button>
						</div>
					)}
				</div>
			),
			ignoreRowClick: true,
			allowOverflow: false,
			button: true,
			width: "80px"
		}
	];

	const filteredBanners = banners.filter((banner) => banner.link.toLowerCase().includes(searchText.toLowerCase()));

	const validateForm = () => {
		const errors = {};
		if (!formData.link.trim()) errors.link = "Link is required.";
		if (!file) errors.image = "Image is required.";
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		const dataForm = new FormData();
		dataForm.append("link", formData.link);
		dataForm.append("image", file);

		let path;
		if (isEditMode) {
			path = "banners/update";
			dataForm.append("id", selectedBanner.id);
		} else {
			path = "banners/create";
		}

		try {
			let data = {
				path: path,
				payload: dataForm
			};

			let response = await ApiService.postRequest(data);
			if (response) {
				setIsModalOpen(false);
				getBanners();
				setFormData({ link: "" });
				setFile(null);
				setFormErrors({});
				setIsEditMode(false);
				setSelectedBanner(null);
			}
		} catch (error) {
			console.error("Error saving banner:", error);
		}
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-12 flex-col">
				{/* Header */}
				<div className="flex lg:flex-row flex-col-reverse gap-8 justify-between lg:items-center items-start">
					<div className="flex flex-wrap items-center gap-2">
						<Searchbar searchText={searchText} setSearchText={setSearchText} placeholder="Search banners..." />
						<Button
							onClick={() => {
								setIsModalOpen(true);
								setIsEditMode(false);
								setFormData({ link: "" });
								setFile(null);
								setFormErrors({});
							}}
							icon={IoMdAdd}
							text="Add Banner"
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Table */}
				<div className="flex flex-col gap-4 overflow-x-auto">
					<p className="text-base text-gray-500">Total Banners: {banners.length}</p>

					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
						<div className="min-w-[600px]">
							<DataTable
								columns={columns}
								data={filteredBanners}
								customStyles={customStyles}
								pagination
								responsive={false}
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
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<h3 className="mt-2 text-sm font-medium text-gray-900">No banners found</h3>
									</div>
								}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setIsEditMode(false);
					setSelectedBanner(null);
				}}
				title={isEditMode ? "Edit Banner" : "Add New Banner"}
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
						<label className="text-base font-normal text-gray-600">Link:</label>
						<input
							type="text"
							placeholder="Enter link"
							value={formData.link}
							onChange={(e) => setFormData({ ...formData, link: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
						{formErrors.link && <p className="text-red-500 text-sm">{formErrors.link}</p>}
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image:</label>
						<ImgUploader
							onFileSelect={setFile}
							existingImage={isEditMode && file ? import.meta.env.VITE_VideoBaseURL + file : null}
						/>
						{formErrors.image && <p className="text-red-500 text-sm">{formErrors.image}</p>}
					</div>
				</div>
			</Modal>
		</>
	);
}

export default memo(Banner);
