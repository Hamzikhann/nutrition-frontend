import React, { useState, useRef, useEffect } from "react";

function ImgUploader({ onFileSelect, file, existingImage }) {
	const [preview, setPreview] = useState(null);
	const fileInputRef = useRef(null);

	// Show preview if editing with existing image
	useEffect(() => {
		if (file) {
			setPreview(URL.createObjectURL(file));
		} else if (existingImage) {
			setPreview(existingImage); // use backend-provided URL
		} else {
			setPreview(null);
		}
	}, [file, existingImage]);

	useEffect(() => {
		// When file changes → update preview
		if (file) {
			const objectUrl = URL.createObjectURL(file);
			setPreview(objectUrl);

			// cleanup old object URLs to prevent memory leaks
			return () => URL.revokeObjectURL(objectUrl);
		}
	}, [file]);

	useEffect(() => {
		// When editing → only set existing image if no file is selected
		if (!file && existingImage) {
			setPreview(existingImage);
		}
	}, [existingImage, file]);

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		if (selectedFile) {
			setPreview(URL.createObjectURL(selectedFile));
			onFileSelect(selectedFile); // pass file up
		}
	};

	const handleDrop = (e) => {
		if (e && e.preventDefault) e.preventDefault();
		const droppedFile = e.dataTransfer.files[0];
		if (droppedFile) {
			setPreview(URL.createObjectURL(droppedFile));
			onFileSelect(droppedFile);
		}
	};

	const handleDragOver = (e) => {
		if (e && e.preventDefault) e.preventDefault();
	};

	return (
		<>
			<input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

			<div
				className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onClick={() => fileInputRef.current.click()}
			>
				{preview ? (
					<img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2" />
				) : (
					<p className="text-gray-500 text-sm text-center">
						Drag & Drop or <span className="text-[#46acbe] font-medium">Click to Upload</span>
					</p>
				)}
			</div>
		</>
	);
}

export default ImgUploader;

// import React, { useState, useRef, useEffect } from "react";

// function ImgUploader({ onFileSelect, existingImage, multiple = false }) {
// 	const [file, setFile] = useState(null);
// 	const [preview, setPreview] = useState(null);
// 	const fileInputRef = useRef(null);

// 	// Update preview when file or existing image changes
// 	useEffect(() => {
// 		if (file) {
// 			const objectUrl = URL.createObjectURL(file);
// 			setPreview(objectUrl);

// 			return () => URL.revokeObjectURL(objectUrl); // cleanup
// 		} else if (existingImage) {
// 			setPreview(existingImage);
// 		} else {
// 			setPreview(null);
// 		}
// 	}, [file, existingImage]);

// 	const handleFileChange = (e) => {
// 		const selectedFile = e.target.files[0];
// 		if (selectedFile) {
// 			setFile(selectedFile);
// 			onFileSelect?.(selectedFile);
// 		}
// 	};

// 	const handleDrop = (e) => {
// 		e.preventDefault();
// 		const droppedFile = e.dataTransfer.files[0];
// 		if (droppedFile) {
// 			setFile(droppedFile);
// 			onFileSelect?.(droppedFile);
// 		}
// 	};

// 	const handleDragOver = (e) => {
// 		e.preventDefault();
// 	};

// 	return (
// 		<>
// 			<input
// 				type="file"
// 				ref={fileInputRef}
// 				multiple={multiple}
// 				className="hidden"
// 				onChange={handleFileChange}
// 				accept="image/*"
// 			/>

// 			<div
// 				className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
// 				onDrop={handleDrop}
// 				onDragOver={handleDragOver}
// 				onClick={() => fileInputRef.current.click()}
// 			>
// 				{preview ? (
// 					<img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2" />
// 				) : (
// 					<p className="text-gray-500 text-sm text-center">
// 						Drag & Drop or <span className="text-[#46acbe] font-medium">Click to Upload</span>
// 					</p>
// 				)}
// 			</div>
// 		</>
// 	);
// }

// export default ImgUploader;

// import React, { useState, useRef, useEffect } from "react";

// function ImgUploader({ onFileSelect, existingImages = [], multiple = false }) {
// 	const [files, setFiles] = useState([]);
// 	const [previews, setPreviews] = useState([]);
// 	const fileInputRef = useRef(null);

// 	// Update previews when files or existing images change
// 	useEffect(() => {
// 		if (files.length > 0) {
// 			const objectUrls = files.map((file) => URL.createObjectURL(file));
// 			setPreviews(objectUrls);

// 			return () => {
// 				// Cleanup object URLs
// 				objectUrls.forEach((url) => URL.revokeObjectURL(url));
// 			};
// 		} else if (existingImages.length > 0) {
// 			setPreviews(existingImages);
// 		} else {
// 			setPreviews([]);
// 		}
// 	}, [files, existingImages]);

// 	const handleFileChange = (e) => {
// 		const selectedFiles = Array.from(e.target.files);
// 		if (selectedFiles.length > 0) {
// 			if (multiple) {
// 				setFiles(selectedFiles);
// 				onFileSelect?.(selectedFiles);
// 			} else {
// 				setFiles([selectedFiles[0]]);
// 				onFileSelect?.(selectedFiles[0]);
// 			}
// 		}
// 	};

// 	const handleDrop = (e) => {
// 		e.preventDefault();
// 		const droppedFiles = Array.from(e.dataTransfer.files);
// 		if (droppedFiles.length > 0) {
// 			if (multiple) {
// 				setFiles(droppedFiles);
// 				onFileSelect?.(droppedFiles);
// 			} else {
// 				setFiles([droppedFiles[0]]);
// 				onFileSelect?.(droppedFiles[0]);
// 			}
// 		}
// 	};

// 	const handleDragOver = (e) => {
// 		e.preventDefault();
// 	};

// 	const removeFile = (index) => {
// 		const newFiles = files.filter((_, i) => i !== index);
// 		setFiles(newFiles);

// 		if (multiple) {
// 			onFileSelect?.(newFiles);
// 		} else {
// 			onFileSelect?.(newFiles[0] || null);
// 		}
// 	};

// 	const removePreview = (index) => {
// 		const newPreviews = previews.filter((_, i) => i !== index);
// 		setPreviews(newPreviews);
// 		setFiles([]); // Clear files since we're dealing with existing images
// 		onFileSelect?.([]);
// 	};

// 	return (
// 		<>
// 			<input
// 				type="file"
// 				ref={fileInputRef}
// 				multiple={multiple}
// 				className="hidden"
// 				onChange={handleFileChange}
// 				accept="image/*"
// 			/>

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
// 										src={preview}
// 										alt={`Preview ${index + 1}`}
// 										className="w-20 h-20 object-cover rounded-lg border border-gray-300"
// 									/>
// 									<button
// 										type="button"
// 										onClick={(e) => {
// 											e.stopPropagation();
// 											if (files.length > 0) {
// 												removeFile(index);
// 											} else {
// 												removePreview(index);
// 											}
// 										}}
// 										className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
// 									>
// 										×
// 									</button>
// 								</div>
// 							))}
// 						</div>
// 						{multiple && <p className="text-gray-500 text-sm text-center">Click to add more images or drag & drop</p>}
// 					</div>
// 				) : (
// 					<p className="text-gray-500 text-sm text-center">
// 						Drag & Drop or <span className="text-[#46acbe] font-medium">Click to Upload</span>
// 						{multiple && " multiple images"}
// 					</p>
// 				)}
// 			</div>

// 			{/* File count indicator */}
// 			{previews.length > 0 && (
// 				<p className="text-xs text-gray-500 mt-2">
// 					{previews.length} {previews.length === 1 ? "image" : "images"} selected
// 				</p>
// 			)}
// 		</>
// 	);
// }

// export default ImgUploader;
