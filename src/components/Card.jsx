import React, { useState, useEffect, useRef } from "react";
import { FaCirclePlay } from "react-icons/fa6";

function Card({ name, date, pic, setSelected, setIsViewModalOpen, item, handleDelete, handleEdit }) {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef(null);
	console.log(typeof handleEdit);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target) &&
				open // only close if the dropdown is open
			) {
				setOpen(false);
			}
		};

		const handleClickInside = (event) => {
			// prevent the click event from bubbling up to the document
			event.stopPropagation();
		};

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			if (dropdownRef.current) {
				dropdownRef.current.addEventListener("mousedown", handleClickInside);
			}
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			if (dropdownRef.current) {
				dropdownRef.current.removeEventListener("mousedown", handleClickInside);
			}
		};
	}, [open]);

	const handelOpen = () => {
		if (open) setOpen(false);
		else setOpen(true);
	};

	return (
		<div className="w-full sm:w-[250px] p-4 rounded-xl bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition">
			<div className="relative cursor-pointer">
				<img
					className="rounded-lg h-40 w-full object-cover"
					src={pic}
					alt={name}
					loading="lazy" // ✅ lazy load images
					decoding="async" // ✅ better rendering hint
				/>
				<div className="absolute inset-0 flex justify-center items-center text-white text-3xl">
					<FaCirclePlay />
				</div>
			</div>

			<div className="flex justify-between relative">
				{/* Left Side */}
				<div>
					<p
						className="text-lg font-bold text-[#234c50] mb-2"
						onClick={() => {
							setSelected(item);
							setIsViewModalOpen(true);
						}}
					>
						{name.length > 17 ? `${name.substring(0, 17)}...` : name}
					</p>
					<p className="text-base font-light text-gray-500">{date}</p>
				</div>

				{/* 3 Dots Menu */}
				<div className="text-xl text-gray-500 cursor-pointer select-none" onClick={handelOpen}>
					...
				</div>

				{/* Dropdown Menu */}
				{open && (
					<div
						ref={dropdownRef}
						className="absolute right-0 top-6 bg-white shadow-lg rounded-lg w-28 flex flex-col text-sm z-10"
					>
						{handleEdit && (
							<button className="px-4 py-2 hover:bg-gray-100 text-left" onClick={() => handleEdit(item)}>
								Edit
							</button>
						)}
						{handleDelete && (
							<button
								className="px-4 py-2 hover:bg-gray-100 text-left text-red-500"
								onClick={() => handleDelete(item.id)}
							>
								Delete
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default Card;
