import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function PostMediaCarousel({ post }) {
	const [currentIndex, setCurrentIndex] = useState(0);

	// Get all media from both old and new posts
	const getMediaItems = () => {
		const mediaItems = [];

		// Add single image from old posts if it exists
		if (post.image) {
			mediaItems.push({
				type: "image",
				url: post.image,
				isOldPost: true
			});
		}

		// Add multiple images from new posts if they exist
		if (post.communityPostMedia && post.communityPostMedia.length > 0) {
			post.communityPostMedia.forEach((media) => {
				mediaItems.push({
					type: "image",
					url: media.media,
					isOldPost: false
				});
			});
		}

		return mediaItems;
	};

	const mediaItems = getMediaItems();

	// If no media, return null
	if (mediaItems.length === 0) {
		return null;
	}

	const goToPrevious = () => {
		const isFirstSlide = currentIndex === 0;
		const newIndex = isFirstSlide ? mediaItems.length - 1 : currentIndex - 1;
		setCurrentIndex(newIndex);
	};

	const goToNext = () => {
		const isLastSlide = currentIndex === mediaItems.length - 1;
		const newIndex = isLastSlide ? 0 : currentIndex + 1;
		setCurrentIndex(newIndex);
	};

	const goToSlide = (slideIndex) => {
		setCurrentIndex(slideIndex);
	};

	const currentMedia = mediaItems[currentIndex];

	return (
		<div className="mt-4 relative group">
			{/* Media Display */}
			<div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
				{currentMedia.type === "image" ? (
					<img
						src={import.meta.env.VITE_VideoBaseURL + currentMedia.url}
						alt="Post media"
						className="w-full h-full object-contain bg-white"
						loading="lazy"
					/>
				) : (
					<video
						src={import.meta.env.VITE_VideoBaseURL + currentMedia.url}
						controls
						className="w-full h-full object-contain bg-black"
					/>
				)}

				{/* Navigation Arrows - Only show if multiple items */}
				{mediaItems.length > 1 && (
					<>
						<button
							onClick={goToPrevious}
							className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
						>
							<ChevronLeftIcon className="w-5 h-5" />
						</button>
						<button
							onClick={goToNext}
							className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
						>
							<ChevronRightIcon className="w-5 h-5" />
						</button>
					</>
				)}
			</div>

			{/* Slide Indicators - Only show if multiple items */}
			{mediaItems.length > 1 && (
				<div className="flex justify-center mt-3 space-x-2">
					{mediaItems.map((_, slideIndex) => (
						<button
							key={slideIndex}
							onClick={() => goToSlide(slideIndex)}
							className={`w-2 h-2 rounded-full transition-all duration-200 ${
								slideIndex === currentIndex ? "bg-[#46abbd] w-4" : "bg-gray-300"
							}`}
						/>
					))}
				</div>
			)}

			{/* Image Counter - Only show if multiple items */}
			{mediaItems.length > 1 && (
				<div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
					{currentIndex + 1} / {mediaItems.length}
				</div>
			)}
		</div>
	);
}

export default PostMediaCarousel;
