import React, { useState } from "react";

function Button({
	text,
	icon: Icon,
	bg = "bg-[#46acbe]",
	textColor = "text-white",
	borderColor = "border-[#46acbe]",
	onClick,
	padding = "py-[8px] px-4",
	textSize = "text-lg",
	rounded = "rounded-xl",
	extraClasses = "",
	width = "w-auto",
	disableAfterClick = false,
	disabled = false,
	disableText = "Please wait..."
}) {
	const [isDisabled, setIsDisabled] = useState(false);

	const handleClick = async (e) => {
		// 🛑 Prevent further clicks immediately
		if (disabled || isDisabled) return;

		if (disableAfterClick) setIsDisabled(true);

		try {
			if (onClick) await onClick(e);
		} finally {
			// ✅ Optionally re-enable if you want the button to become active again later
			if (!disableAfterClick) setIsDisabled(false);
		}
	};

	const isButtonDisabled = disabled || isDisabled;

	return (
		<button
			type="button"
			onClick={handleClick}
			disabled={isButtonDisabled}
			className={`flex ${width} items-center justify-center gap-1 border ${borderColor} ${bg} ${textColor} ${textSize} ${padding} ${rounded} ${extraClasses} ${
				isButtonDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:opacity-90"
			}`}
		>
			{Icon && <Icon size={20} />}
			<p>{isButtonDisabled ? disableText : text}</p>
		</button>
	);
}

export default Button;
