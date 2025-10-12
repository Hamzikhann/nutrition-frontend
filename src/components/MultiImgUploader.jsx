// import React, { useState, useRef, useEffect } from "react";

// function MultiImgUploader({ onFileSelect, existingImages = [], onRemoveExisting }) {
// 	const [files, setFiles] = useState([]);
// 	const [previews, setPreviews] = useState([]);
// 	const fileInputRef = useRef(null);

// 	// Initialize with existing images
// 	useEffect(() => {
// 		if (existingImages.length > 0) {
// 			// Mark existing images so we know they're not object URLs
// 			const existingPreviews = existingImages.map((img) => ({
// 				url: img,
// 				isObjectUrl: false,
// 				isExisting: true
// 			}));
// 			setPreviews(existingPreviews);
// 		}
// 	}, [existingImages]);

// 	/**
// 	 * Handles file change event on the file input element.
// 	 * Adds selected files to the list of files and updates the previews.
// 	 * Notifies the parent component with the updated list of files.
// 	 * @param {Event} e - The file change event.
// 	 */
// 	const handleFileChange = (e) => {
// 		const selectedFiles = Array.from(e.target.files);
// 		if (selectedFiles.length > 0) {
// 			const newFiles = [...files, ...selectedFiles];
// 			setFiles(newFiles);

// 			// Create preview URLs for new files and mark them as object URLs
// 			const newPreviews = selectedFiles.map((file) => ({
// 				url: URL.createObjectURL(file),
// 				isObjectUrl: true,
// 				isExisting: false
// 			}));
// 			setPreviews((prev) => [...prev, ...newPreviews]);

// 			// Notify parent component
// 			onFileSelect?.(newFiles);
// 		}
// 	};

// 	const handleDrop = (e) => {
// 		e.preventDefault();
// 		const droppedFiles = Array.from(e.dataTransfer.files);
// 		if (droppedFiles.length > 0) {
// 			const newFiles = [...files, ...droppedFiles];
// 			setFiles(newFiles);

// 			const newPreviews = droppedFiles.map((file) => ({
// 				url: URL.createObjectURL(file),
// 				isObjectUrl: true,
// 				isExisting: false
// 			}));
// 			setPreviews((prev) => [...prev, ...newPreviews]);

// 			onFileSelect?.(newFiles);
// 		}
// 	};

// 	const handleDragOver = (e) => {
// 		e.preventDefault();
// 	};

// 	// const removeFile = (index) => {
// 	// 	const itemToRemove = previews[index];

// 	// 	// Only revoke object URLs (new files), not existing image URLs
// 	// 	if (itemToRemove.isObjectUrl) {
// 	// 		URL.revokeObjectURL(itemToRemove.url);
// 	// 	}

// 	// 	// Calculate the correct file index (only for new files)
// 	// 	let newFiles;
// 	// 	if (itemToRemove.isExisting) {
// 	// 		// For existing images, just remove from previews, don't touch files array
// 	// 		newFiles = [...files];
// 	// 	} else {
// 	// 		// For new files, find the corresponding file index
// 	// 		const existingImageCount = previews.filter((p) => p.isExisting).length;
// 	// 		const fileIndex = index - existingImageCount;
// 	// 		newFiles = files.filter((_, i) => i !== fileIndex);
// 	// 		setFiles(newFiles);
// 	// 	}

// 	// 	const newPreviews = previews.filter((_, i) => i !== index);
// 	// 	setPreviews(newPreviews);

// 	// 	// Only notify parent if files actually changed (not for existing image removal)
// 	// 	if (!itemToRemove.isExisting) {
// 	// 		onFileSelect?.(newFiles);
// 	// 	}
// 	// };

// 	// In your MultiImgUploader component, update the removeFile function:
// 	const removeFile = (index) => {
// 		const itemToRemove = previews[index];

// 		// Only revoke object URLs (new files), not existing image URLs
// 		if (itemToRemove.isObjectUrl) {
// 			URL.revokeObjectURL(itemToRemove.url);
// 		}

// 		// Calculate the correct file index (only for new files)
// 		let newFiles;
// 		if (itemToRemove.isExisting) {
// 			// For existing images, just remove from previews, don't touch files array
// 			newFiles = [...files];

// 			// ✅ NEW: Notify parent about existing image removal
// 			onRemoveExisting?.(itemToRemove.id);
// 		} else {
// 			// For new files, find the corresponding file index
// 			const existingImageCount = previews.filter((p) => p.isExisting).length;
// 			const fileIndex = index - existingImageCount;
// 			newFiles = files.filter((_, i) => i !== fileIndex);
// 			setFiles(newFiles);
// 		}

// 		const newPreviews = previews.filter((_, i) => i !== index);
// 		setPreviews(newPreviews);

// 		// Only notify parent if files actually changed (not for existing image removal)
// 		if (!itemToRemove.isExisting) {
// 			onFileSelect?.(newFiles);
// 		}
// 	};

// 	return (
// 		<>
// 			<input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileChange} />

// 			<div
// 				className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
// 				onDrop={handleDrop}
// 				onDragOver={handleDragOver}
// 				onClick={() => fileInputRef.current.click()}
// 			>
// 				{previews.length > 0 ? (
// 					<div className="w-full">
// 						<div className="flex flex-wrap gap-3 justify-center mb-3">
// 							{previews.map((preview, index) => (
// 								<div key={index} className="relative">
// 									<img
// 										src={preview.url}
// 										alt={`Preview ${index + 1}`}
// 										className="w-20 h-20 object-cover rounded-lg border border-gray-300"
// 									/>
// 									<button
// 										type="button"
// 										onClick={(e) => {
// 											e.stopPropagation();
// 											removeFile(index);
// 										}}
// 										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
// 									>
// 										×
// 									</button>
// 									{preview.isExisting && (
// 										<span className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-1 rounded">
// 											Existing
// 										</span>
// 									)}
// 								</div>
// 							))}
// 						</div>
// 						<p className="text-gray-500 text-sm text-center">Click to add more images or drag & drop</p>
// 					</div>
// 				) : (
// 					<p className="text-gray-500 text-sm text-center">
// 						Drag & Drop or <span className="text-[#46acbe] font-medium">Click to Upload</span> multiple images
// 					</p>
// 				)}
// 			</div>

// 			{previews.length > 0 && (
// 				<p className="text-xs text-gray-500 mt-2">
// 					{previews.length} {previews.length === 1 ? "image" : "images"} selected
// 				</p>
// 			)}
// 		</>
// 	);
// }

// export default MultiImgUploader;

import React, { useState, useRef, useEffect } from "react";

function MultiImgUploader({ onFileSelect, existingImages = [], onRemoveExisting }) {
	const [files, setFiles] = useState([]);
	const [previews, setPreviews] = useState([]);
	const fileInputRef = useRef(null);

	// Initialize with existing images
	useEffect(() => {
		if (existingImages.length > 0) {
			const formattedExistingImages = existingImages.map((img) => ({
				...img,
				isObjectUrl: false,
				isExisting: true
			}));
			setPreviews(formattedExistingImages);
		}
	}, [existingImages]);

	const handleFileChange = (e) => {
		const selectedFiles = Array.from(e.target.files);
		if (selectedFiles.length > 0) {
			const newFiles = [...files, ...selectedFiles];
			setFiles(newFiles);

			// Create preview URLs for new files
			const newPreviews = selectedFiles.map((file) => ({
				url: URL.createObjectURL(file),
				isObjectUrl: true,
				isExisting: false,
				id: `new-${Date.now()}-${Math.random()}` // Unique ID for new files
			}));

			setPreviews((prev) => [...prev, ...newPreviews]);
			onFileSelect?.(newFiles);
		}
	};

	const handleDrop = (e) => {
		if (e && e.preventDefault) e.preventDefault();
		const droppedFiles = Array.from(e.dataTransfer.files);
		if (droppedFiles.length > 0) {
			const newFiles = [...files, ...droppedFiles];
			setFiles(newFiles);

			const newPreviews = droppedFiles.map((file) => ({
				url: URL.createObjectURL(file),
				isObjectUrl: true,
				isExisting: false,
				id: `new-${Date.now()}-${Math.random()}`
			}));

			setPreviews((prev) => [...prev, ...newPreviews]);
			onFileSelect?.(newFiles);
		}
	};

	const handleDragOver = (e) => {
		if (e && e.preventDefault) e.preventDefault();
	};

	const removeFile = (index) => {
		const itemToRemove = previews[index];

		// Only revoke object URLs (new files), not existing image URLs
		if (itemToRemove.isObjectUrl) {
			URL.revokeObjectURL(itemToRemove.url);

			// Remove from files array for new files
			const existingImageCount = previews.filter((p) => p.isExisting).length;
			const fileIndex = index - existingImageCount;
			const newFiles = files.filter((_, i) => i !== fileIndex);
			setFiles(newFiles);
			onFileSelect?.(newFiles);
		} else {
			// For existing images, notify parent about removal
			onRemoveExisting?.(itemToRemove.id);
		}

		// Always remove from previews
		const newPreviews = previews.filter((_, i) => i !== index);
		setPreviews(newPreviews);
	};

	return (
		<>
			<input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleFileChange} accept="image/*" />

			<div
				className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onClick={() => fileInputRef.current.click()}
			>
				{previews.length > 0 ? (
					<div className="w-full">
						<div className="flex flex-wrap gap-3 justify-center mb-3">
							{previews.map((preview, index) => (
								<div key={preview.id || index} className="relative">
									<img
										src={preview.url}
										alt={`Preview ${index + 1}`}
										className="w-20 h-20 object-cover rounded-lg border border-gray-300"
									/>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											removeFile(index);
										}}
										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
									>
										×
									</button>
									{preview.isExisting && (
										<span className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-1 rounded">
											Existing
										</span>
									)}
								</div>
							))}
						</div>
						<p className="text-gray-500 text-sm text-center">Click to add more images or drag & drop</p>
					</div>
				) : (
					<p className="text-gray-500 text-sm text-center">
						Drag & Drop or <span className="text-[#46acbe] font-medium">Click to Upload</span> multiple images
					</p>
				)}
			</div>

			{previews.length > 0 && (
				<p className="text-xs text-gray-500 mt-2">
					{previews.length} {previews.length === 1 ? "image" : "images"} selected
				</p>
			)}
		</>
	);
}

export default MultiImgUploader;
