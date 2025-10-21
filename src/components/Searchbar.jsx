import React from "react";
import { FiSearch } from "react-icons/fi";

function Searchbar({
	placeholder = "Search by name, email or phone",
	minWidth = "300px",
	bgColor = "bg-white",
	searchText,
	setSearchText
}) {
	const handleChange = (e) => {
		setSearchText(e.target.value);
	};

	return (
		<div className="relative" style={{ minWidth, backgroundColor: bgColor }}>
			<FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
			<input
				type="search"
				value={searchText}
				onChange={handleChange}
				placeholder={placeholder}
				className={`w-full py-3 pl-12 pr-5 rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-[#46acbe] ${bgColor}`}
			/>
		</div>
	);
}

export default Searchbar;
