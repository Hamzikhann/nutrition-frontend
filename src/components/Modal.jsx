import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import Button from "../components/Button";

function Modal({
	isOpen,
	onClose,
	title,
	showTitle = true,
	showCloseIcon = true,
	showDivider = true,
	children,
	primaryBtnText = "Save",
	secondaryBtnText = "Cancel",
	onPrimaryClick,
	onSecondaryClick,
	width = "min-w-2xl max-w-2xl"
}) {
	const [isPrimaryDisabled, setIsPrimaryDisabled] = useState(false);

	if (!isOpen) return null;

	const handlePrimaryClick = async () => {
		if (!onPrimaryClick) return;

		setIsPrimaryDisabled(true);
		try {
			await onPrimaryClick(); // support async actions
		} finally {
			// Uncomment the next line if you want to re-enable after async completes
			setIsPrimaryDisabled(false);
		}
	};

	return (
		<div className="fixed inset-0 flex sm:items-center items-start justify-center z-50 overflow-y-auto sm:p-10 p-4">
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

			{/* Modal */}
			<div className={`relative max-h-[570px] bg-white ${width} w-full overflow-y-auto rounded-2xl shadow-lg p-6 z-50`}>
				{/* Header */}
				{(showTitle || showCloseIcon) && (
					<div className="flex justify-between items-center mb-4">
						{showTitle ? <h2 className="text-xl font-semibold text-gray-700">{title}</h2> : <div />}
						{showCloseIcon && (
							<button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
								<FiX size={24} />
							</button>
						)}
					</div>
				)}

				{/* Divider (optional) */}
				{showDivider && <hr className="border-gray-200 mb-4" />}

				{/* Modal Content */}
				<div className="mb-6 overflow-y-auto">{children}</div>

				{/* Buttons */}
				<div className="flex justify-end gap-3 w-full">
					<Button
						text={secondaryBtnText}
						bg="bg-red-500"
						textColor="text-white"
						borderColor="border-red-300"
						padding="px-4 py-2"
						width="w-full"
						textSize="text-base"
						onClick={onSecondaryClick || onClose}
					/>
					{onPrimaryClick && (
						<Button
							text={isPrimaryDisabled ? "Please wait..." : primaryBtnText}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
							padding="px-4 py-2"
							width="w-full"
							textSize="text-base"
							onClick={handlePrimaryClick}
							extraClasses={isPrimaryDisabled ? "opacity-50 cursor-not-allowed" : ""}
							disableAfterClick={false}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

export default Modal;
