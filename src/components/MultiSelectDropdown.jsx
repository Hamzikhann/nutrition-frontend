import React, { useState, useRef, useEffect } from "react";

function MultiSelectDropdown({ options, selectedValues, onChange, placeholder }) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);

	const toggleDropdown = () => {
		setIsOpen((prev) => !prev);
	};

	const handleOptionClick = (value) => {
		if (selectedValues.includes(value)) {
			onChange(selectedValues.filter((v) => v !== value));
		} else {
			onChange([...selectedValues, value]);
		}
	};

	const handleRemoveTag = (value, e) => {
		e.stopPropagation();
		onChange(selectedValues.filter((v) => v !== value));
	};

	const handleClickOutside = (event) => {
		if (containerRef.current && !containerRef.current.contains(event.target)) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative w-60" ref={containerRef}>
			<div
				className="flex flex-wrap items-center gap-1 min-h-[36px] border border-gray-300 rounded-md px-2 py-1 cursor-pointer"
				onClick={toggleDropdown}
			>
				{selectedValues.length === 0 && <span className="text-gray-400 text-sm select-none">{placeholder}</span>}
				{selectedValues.map((value) => (
					<div key={value} className="flex items-center bg-[#46acbe] text-white rounded-full px-2 py-0.5 text-sm">
						<span>{value} kcal</span>
						<button type="button" className="ml-1 focus:outline-none" onClick={(e) => handleRemoveTag(value, e)}>
							&times;
						</button>
					</div>
				))}
				<div className="flex-grow" />
				<svg
					className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</div>
			{isOpen && (
				<div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
					{options.map((option) => (
						<div
							key={option}
							className={`cursor-pointer px-3 py-2 text-sm ${
								selectedValues.includes(option) ? "bg-[#46acbe] text-white" : "hover:bg-gray-100"
							}`}
							onClick={() => handleOptionClick(option)}
						>
							{option} kcal
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default MultiSelectDropdown;
