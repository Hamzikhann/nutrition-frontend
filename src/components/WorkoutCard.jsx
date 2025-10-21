import React, { useState } from "react";
import { FaCirclePlay } from "react-icons/fa6";
import Modal from "./Modal";

function WorkoutCard({ name, video, sets, reps, onDelete, onEdit }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<div className="w-full max-w-4xl p-4 rounded-xl bg-white flex flex-row gap-4 shadow-md hover:shadow-lg transition-shadow duration-300">
				<div className="relative flex-shrink-0">
					{/* rounded-lg h-40 w-full object-contain bg-black */}
					<video loading="lazy" className="rounded-lg h-48 w-64 object-contain" src={video} controls />
					<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
						<FaCirclePlay className="text-white text-3xl" />
					</div>
				</div>
				<div className="flex flex-col justify-between flex-1">
					<div>
						<div className="flex justify-between items-start relative">
							<div>
								<p className="text-lg font-bold text-[#234c50]">{name}</p>
								<div className="flex gap-2 mt-2 text-xs text-gray-600 font-semibold">
									<div className="px-3 py-1 border border-gray-300 rounded-full bg-gray-100">Moderate</div>
									<div className="px-3 py-1 border border-gray-300 rounded-full bg-gray-100">45 Min</div>
									<div className="px-3 py-1 border border-gray-300 rounded-full bg-gray-100">Full Body</div>
								</div>
							</div>
							<div className="text-xl text-gray-500 cursor-pointer" onClick={() => setOpen(!open)}>
								...
							</div>
							{/* Dropdown Menu */}
							{open && (
								<div className="absolute right-0 top-6 bg-white shadow-lg rounded-lg w-28 flex flex-col text-sm z-10">
									{/* <button className="px-4 py-2 hover:bg-gray-100 text-left">Edit</button> */}
									<button className="px-4 py-2 hover:bg-gray-100 text-left text-red-500" onClick={onEdit}>
										Edit
									</button>

									<button className="px-4 py-2 hover:bg-gray-100 text-left text-red-500" onClick={onDelete}>
										Delete
									</button>
								</div>
							)}
						</div>
					</div>
					<div className="flex justify-between items-center">
						<div>
							<p className="text-base font-bold text-[#234c50]">Sets: {sets}</p>
							<p className="text-sm text-gray-600">Reps: {reps}</p>
						</div>
						<div className="text-sm text-gray-500 px-2 py-1 border border-gray-300 rounded-full">3x60 sec</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default WorkoutCard;
