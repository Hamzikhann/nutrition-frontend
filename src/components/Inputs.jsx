import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";

const DynamicForm = ({ fields, formData, setFormData, handleAddCategory, handleAddSubCategory, errors = {} }) => {
	const [addMode, setAddMode] = useState({});
	const [newValue, setNewValue] = useState({});
	const [customValue, setCustomValue] = useState({});

	const handleChange = (e, field) => {
		const { name, value, type, checked } = e.target;
		if (type === "checkbox") {
			if (field.options) {
				// multiple checkboxes
				setFormData((prev) => {
					const values = new Set(prev[name]);
					checked ? values.add(value) : values.delete(value);
					return { ...prev, [name]: Array.from(values) };
				});
			} else {
				// single checkbox
				setFormData((prev) => ({ ...prev, [name]: checked }));
			}
		} else if (type === "radio") {
			setFormData((prev) => ({ ...prev, [name]: value }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSelectChange = (e) => {
		const { name, value } = e.target;
		if (value === "add_new") {
			setAddMode((prev) => ({ ...prev, [name]: true }));
			setNewValue((prev) => ({ ...prev, [name]: "" }));
		} else {
			if (name === "categoryId") {
				setFormData((prev) => ({ ...prev, [name]: value, subCategoryId: "" }));
			} else {
				setFormData((prev) => ({ ...prev, [name]: value }));
			}
		}
	};

	const handleAddNew = (field) => {
		const value = newValue[field.name];
		if (value && value.trim()) {
			if (field.name === "category") {
				handleAddCategory(value.trim());
			} else if (field.name === "subCategory") {
				handleAddSubCategory(value.trim());
			}
			setAddMode((prev) => ({ ...prev, [field.name]: false }));
			setNewValue((prev) => ({ ...prev, [field.name]: "" }));
		}
	};

	const handleNewValueChange = (e) => {
		const { name, value } = e.target;
		setNewValue((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<div className="space-y-6">
			{fields.map((field, idx) => (
				<div key={idx} className="flex flex-col">
					<label className="mb-2 font-semibold">{field.label}</label>

					{/* Normal Inputs */}
					{["text", "email", "number", "password"].includes(field.type) && (
						<>
							<input
								type={field.type}
								name={field.name}
								value={formData[field.name]}
								placeholder={field.placeholder || ""}
								onChange={(e) => handleChange(e, field)}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
							/>
							{errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
						</>
					)}

					{/* Textarea */}
					{field.type === "textarea" && (
						<>
							<textarea
								name={field.name}
								value={formData[field.name]}
								placeholder={field.placeholder || ""}
								rows={4}
								onChange={(e) => handleChange(e, field)}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe] resize-y"
							/>
							{errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
						</>
					)}

					{/* Radio Buttons */}
					{field.type === "radio" &&
						field.options?.map((opt, i) => (
							<label key={i} className="inline-flex items-center space-x-2 mb-1">
								<input
									type="radio"
									name={field.name}
									value={opt}
									checked={formData[field.name] === opt}
									onChange={(e) => handleChange(e, field)}
									className="form-radio text-blue-500"
								/>
								<span>{opt}</span>
							</label>
						))}

					{/* Multiple Checkboxes */}
					{field.type === "checkbox" &&
						field.options?.map((opt, i) => (
							<label key={i} className="inline-flex items-center space-x-2 mb-1">
								<input
									type="checkbox"
									name={field.name}
									value={opt}
									checked={formData[field.name]?.includes(opt)}
									onChange={(e) => handleChange(e, field)}
									className="form-checkbox text-blue-500"
								/>
								<span>{opt}</span>
							</label>
						))}

					{/* Single Checkbox */}
					{field.type === "checkbox" && !field.options && (
						<label className="inline-flex items-center space-x-2">
							<input
								type="checkbox"
								name={field.name}
								checked={formData[field.name]}
								onChange={(e) => handleChange(e, field)}
								className="form-checkbox text-blue-500"
							/>
							<span>{field.label}</span>
						</label>
					)}

					{/* Select Dropdown */}
					{field.type === "select" && !addMode[field.name] && (
						<>
							<select
								name={field.name}
								value={formData[field.name] || ""}
								onChange={handleSelectChange}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
							>
								<option value="">-- Select --</option>
								{field.options?.map((opt, i) => (
									<option key={i} value={opt.id || opt}>
										{opt.title || opt}
									</option>
								))}
								{/* <option value="add_new">Add new</option> */}
							</select>
							{errors[field.name] && <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>}
						</>
					)}

					{/* Add New Input */}
					{field.type === "select" && addMode[field.name] && (
						<div className="flex gap-2">
							<input
								type="text"
								name={field.name}
								value={newValue[field.name] || ""}
								placeholder="Enter new value"
								onChange={handleNewValueChange}
								className="flex-1 py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleAddNew(field);
									}
								}}
							/>
							<button
								type="button"
								onClick={() => handleAddNew(field)}
								className="px-4 py-3 bg-[#46acbe] text-white rounded-lg hover:bg-[#3a9bb0]"
							>
								<IoMdAdd />
							</button>
						</div>
					)}

					{/* Custom Category */}
					{field.type === "customCategory" && (
						<div className="flex gap-2">
							<input
								type="text"
								value={customValue[field.name] || ""}
								placeholder={field.placeholder || ""}
								onChange={(e) => setCustomValue((prev) => ({ ...prev, [field.name]: e.target.value }))}
								className="flex-1 py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										const handler = field.name === "category" ? handleAddCategory : handleAddSubCategory;
										handler(customValue[field.name]);
										setCustomValue((prev) => ({ ...prev, [field.name]: "" }));
									}
								}}
							/>
							<button
								type="button"
								onClick={() => {
									const handler = field.name === "category" ? handleAddCategory : handleAddSubCategory;
									handler(customValue[field.name]);
									setCustomValue((prev) => ({ ...prev, [field.name]: "" }));
								}}
								className="px-4 py-3 bg-[#46acbe] text-white rounded-lg hover:bg-[#3a9bb0]"
							>
								<IoMdAdd />
							</button>
						</div>
					)}
				</div>
			))}
		</div>
	);
};

export default DynamicForm;
