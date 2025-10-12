import React, { useEffect, useState, useMemo, useCallback } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { IoMdAdd } from "react-icons/io";
import ImgUploader from "../components/ImgUploader";
import ApiService from "../services/ApiServices";

function Supplements() {
	const [statuses, setStatuses] = useState([]);
	const [activeTab, setActiveTab] = useState("");
	const [loading, setLoading] = useState(true);
	const [isSupplementOpen, setIsSupplementOpen] = useState(false);
	const [isFolderOpen, setIsFolderOpen] = useState(false);
	const [supplementForm, setSupplementForm] = useState({
		title: "",
		description: "",
		supplementCategoryId: "",
		externalLink: "",
		image: null
	});
	const [folderForm, setFolderForm] = useState({
		title: ""
	});
	const [isEditingSupplement, setIsEditingSupplement] = useState(false);
	const [editingSupplement, setEditingSupplement] = useState(null);

	const getSupplements = useCallback(async () => {
		try {
			setLoading(true);
			let data = {
				path: "supplements/list",
				payload: {}
			};

			const res = await ApiService.postRequest(data);
			console.log(res.data);
			setStatuses(res.data.data);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getSupplements();
	}, []);

	useEffect(() => {
		if (statuses.length > 0 && !activeTab) {
			setActiveTab(statuses[0].id);
		}
	}, [statuses]);

	const activeFolder = useMemo(() => statuses.find((status) => status.id === activeTab), [statuses, activeTab]);

	const handleFolderSubmit = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		try {
			let data = {
				path: "supplements/create/category",
				payload: folderForm
			};
			const res = await ApiService.postRequest(data);
			console.log(res.data);
			if (res.data) {
				// toast.success("Folder added successfully");
				getSupplements();
				setIsFolderOpen(false);
				setFolderForm({
					title: ""
				});
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleSupplementSubmit = async (e) => {
		if (e && e.preventDefault) e.preventDefault();
		try {
			let formData = new FormData();

			formData.append("title", supplementForm.title);
			formData.append("description", supplementForm.description);
			formData.append("supplementCategoryId", supplementForm.supplementCategoryId);
			formData.append("externalLink", supplementForm.externalLink);
			formData.append("image", supplementForm.image);

			let data = {
				path: isEditingSupplement ? "supplements/update" : "supplements/create",
				payload: formData
			};

			if (isEditingSupplement) {
				formData.append("id", editingSupplement.id);
			}
			const res = await ApiService.postRequest(data);
			console.log(res.data);
			if (res.data) {
				// toast.success(isEditingSupplement ? "Supplement updated successfully" : "Supplement added successfully");
				setIsSupplementOpen(false);
				getSupplements();
				setSupplementForm({
					title: "",
					description: "",
					supplementCategoryId: "",
					externalLink: "",
					image: null
				});
				setIsEditingSupplement(false);
				setEditingSupplement(null);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleEdit = (supplement) => {
		console.log(supplement);
		setEditingSupplement(supplement);
		setSupplementForm({
			title: supplement.title,
			description: supplement.description,
			supplementCategoryId: supplement.supplementsCategoryId,
			externalLink: supplement.externalLink,
			image: supplement.image
		});
		setIsSupplementOpen(true);
		setIsEditingSupplement(true);
	};

	const handleDelete = async (supplementId) => {
		if (window.confirm("Are you sure you want to delete this supplement?")) {
			try {
				let data = {
					path: "supplements/delete",
					payload: { id: supplementId }
				};
				await ApiService.postRequest(data);
				getSupplements();
			} catch (error) {
				console.log(error);
			}
		}
	};

	const openLink = (url) => {
		if (!/^https?:\/\//i.test(url)) {
			url = "https://" + url; // add https:// if missing
		}
		window.open(url, "_blank");
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-10 flex-col">
				{/* upper div */}
				<div className="flex xl:flex-row flex-col-reverse gap-8 justify-between items-center">
					<div className="flex items-center gap-8">
						{statuses.length > 0 &&
							statuses.map((status, index) => (
								<div
									key={index}
									className="flex flex-col items-center cursor-pointer"
									onClick={() => setActiveTab(status.id)}
								>
									<p
										className={`text-base hover:text-[#46acbe] ${
											activeTab === status.id ? "text-[#46acbe]" : "text-gray-500"
										}`}
									>
										{status.title}
									</p>
									{activeTab === status.id && <span className="h-[2px] w-[100%] bg-[#46acbe] mt-1 rounded"></span>}
								</div>
							))}
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Searchbar />
						<Button
							onClick={() => setIsFolderOpen(true)}
							text="Add Folder"
							bg="bg-white"
							icon={IoMdAdd}
							textColor="text-[#46abbd]"
							borderColor="border-[#46abbd]"
						/>
						<Button
							onClick={() => setIsSupplementOpen(true)}
							text="Add Supplement"
							bg="bg-[#46abbd]"
							icon={IoMdAdd}
							textColor="text-white"
							borderColor="border-[#46abbd]"
						/>
					</div>
				</div>

				{/* Main Content */}
				{loading ? (
					<div className="flex justify-center items-center py-10">
						<p className="text-gray-500">Loading supplements...</p>
					</div>
				) : activeTab && activeFolder ? (
					<div className="flex xl:flex-nowrap flex-wrap justify-center items-center gap-3">
						{activeFolder.supplements.map((supplement, index) => (
							<SupplementCard
								key={supplement.id || index}
								name={supplement.title}
								description={supplement.description}
								pic={supplement.image}
								externalLink={supplement.externalLink}
								openLink={openLink}
								onEdit={() => handleEdit(supplement)}
								onDelete={() => handleDelete(supplement.id)}
							/>
						))}
					</div>
				) : (
					<div className="flex justify-center items-center py-10">
						<p className="text-gray-500">No supplements found.</p>
					</div>
				)}
			</section>

			{/* Supplement Modal */}
			<Modal
				isOpen={isSupplementOpen}
				onClose={() => {
					setIsSupplementOpen(false);
					setIsEditingSupplement(false);
					setEditingSupplement(null);
				}}
				title={isEditingSupplement ? "Edit Supplement" : "Add New Supplement"}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText={isEditingSupplement ? "Update" : "Add Now"}
				onPrimaryClick={handleSupplementSubmit}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Supplement Name:</label>
						<input
							type="text"
							placeholder="enter name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
              focus:outline-none focus:border-[#46acbe]"
							value={supplementForm.title}
							onChange={(e) => setSupplementForm({ ...supplementForm, title: e.target.value })}
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Description:</label>
						<textarea
							placeholder="enter description"
							value={supplementForm.description}
							onChange={(e) => setSupplementForm({ ...supplementForm, description: e.target.value })}
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Folder:</label>
						<select
							value={supplementForm.supplementCategoryId}
							onChange={(e) => setSupplementForm({ ...supplementForm, supplementCategoryId: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{statuses.map((status, index) => (
								<option key={index} value={status.id}>
									{status.title}
								</option>
							))}
						</select>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image:</label>
						<ImgUploader
							onFileSelect={(file) => setSupplementForm({ ...supplementForm, image: file })}
							existingImage={isEditingSupplement ? import.meta.env.VITE_VideoBaseURL + editingSupplement.image : null}
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">External Link:</label>
						<input
							type="link"
							placeholder="www.thefutureinno.com"
							value={supplementForm.externalLink}
							onChange={(e) => setSupplementForm({ ...supplementForm, externalLink: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
              focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
				</div>
			</Modal>

			{/* Folder Modal */}
			<Modal
				isOpen={isFolderOpen}
				onClose={() => setIsFolderOpen(false)}
				title="Add New Folder"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Add Now"
				onPrimaryClick={handleFolderSubmit}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Folder Type:</label>
						<input
							type="text"
							placeholder="enter folder type"
							value={folderForm.title}
							onChange={(e) => setFolderForm({ ...folderForm, title: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
				</div>
			</Modal>
		</>
	);
}

export function SupplementCard({ name, description, pic, externalLink, openLink, onEdit, onDelete }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="w-full sm:w-80 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow flex flex-col gap-3">
			<div className="relative cursor-pointer">
				<img className="rounded-lg w-full h-48 object-cover" src={import.meta.env.VITE_VideoBaseURL + pic} alt={name} />
			</div>
			<div className="flex justify-between items-start relative">
				{/* Left Side */}
				<div className="flex-1">
					<p className="text-lg font-bold text-[#234c50] line-clamp-2">{name}</p>
				</div>

				{/* 3 Dots Menu */}
				<div className="text-xl text-gray-500 cursor-pointer ml-2" onClick={() => setOpen(!open)}>
					...
				</div>

				{/* Dropdown Menu */}
				{open && (
					<div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg w-32 z-10 flex flex-col text-sm border">
						<button
							className="px-4 py-2 hover:bg-gray-100 text-left rounded-t-lg"
							onClick={() => {
								setOpen(false);
								onEdit();
							}}
						>
							Edit
						</button>
						<button
							className="px-4 py-2 hover:bg-gray-100 text-left text-red-500 rounded-b-lg"
							onClick={() => {
								setOpen(false);
								onDelete();
							}}
						>
							Delete
						</button>
					</div>
				)}
			</div>
			<p className="text-sm font-light text-gray-500 line-clamp-3">{description}</p>
			<button
				className="w-full rounded-lg bg-white text-[#234c50] border border-[#234c50] py-2 hover:bg-[#234c50] hover:text-white transition-colors"
				onClick={() => openLink(externalLink)}
			>
				View Link
			</button>
		</div>
	);
}

export default Supplements;
