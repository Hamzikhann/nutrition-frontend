import React, { useState, useEffect, useCallback, useMemo } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import MultiImgUploader from "../components/MultiImgUploader";
import PostMediaCarousel from "../components/PostMediaCarousel";
import { IoMdAdd } from "react-icons/io";
import { LuUsers } from "react-icons/lu";
import { FaRegComment } from "react-icons/fa";
import { BiTrash, BiReply } from "react-icons/bi";
import { RiMenuFold4Fill } from "react-icons/ri";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import ApiService from "../services/ApiServices";
import { formatToLocalTime } from "../services/Timezone";

function Community() {
	const adminId = "UWRuejBBVlRwcm9xaEpoaFhoK2hEUT09";
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isGroupOpen, setIsGroupOpen] = useState(false);
	const [isPostOpen, setIsPostOpen] = useState(false);
	const [groups, setGroups] = useState([]);
	const [selectedGroup, setSelectedGroup] = useState("");
	const [groupForm, setGroupForm] = useState({
		title: "",
		privacy: ""
	});
	const [posts, setPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(false);
	const [hasFetchedGroups, setHasFetchedGroups] = useState(false);
	const [allCommentsFetched, setAllCommentsFetched] = useState(false);
	const [answerFilter, setAnswerFilter] = useState("all");
	const [dateFilter, setDateFilter] = useState("");
	const [postForm, setPostForm] = useState({
		title: "",
		content: "",
		categoryId: "",
		access: ""
	});
	const [file, setFile] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [postToDeleteId, setPostToDeleteId] = useState(null);
	const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
	const [groupToEdit, setGroupToEdit] = useState(null);
	const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
	const [groupToDeleteId, setGroupToDeleteId] = useState(null);
	const [editingComment, setEditingComment] = useState(null);
	const [editCommentText, setEditCommentText] = useState("");
	const [isEditPostOpen, setIsEditPostOpen] = useState(false);
	const [postToEdit, setPostToEdit] = useState(null);
	const [editPostForm, setEditPostForm] = useState({
		title: "",
		content: "",
		categoryId: "",
		access: ""
	});
	const [imagesToRemove, setImagesToRemove] = useState([]);

	// const [editFile, setEditFile] = useState(null);
	const [editFiles, setEditFiles] = useState([]); // Changed from editFile to editFiles (array)

	const getUserInitials = useCallback((user) => {
		if (!user) return "U";
		const first = user.firstName?.charAt(0) || "";
		const last = user.lastName?.charAt(0) || "";
		return (first + last).toUpperCase() || "U";
	}, []);

	const getCommunityGroups = useCallback(async () => {
		try {
			let data = {
				path: "community/list/categories",
				payload: {}
			};

			const res = await ApiService.postRequest(data);
			console.log(res);
			res.data.categories.forEach((e) => {
				e.color;
			});
			setGroups(res.data.categories);
			setSelectedGroup(res.data.categories[0].id);
			// getPosts(res.data.categories[0].id);
		} catch (error) {
			console.error("Error fetching community groups:", error);
		}
	}, []);

	useEffect(() => {
		if (!hasFetchedGroups) {
			getCommunityGroups();
			setHasFetchedGroups(true);
		}
	}, [hasFetchedGroups, getCommunityGroups]);

	useEffect(() => {
		if (selectedGroup) {
			getPosts(selectedGroup);
			setAllCommentsFetched(false); // Reset when group changes
			setDateFilter(""); // Reset date filter when group changes
		}
	}, [selectedGroup]);

	const addCategory = async () => {
		try {
			let data = {
				path: "community/create/category",
				payload: groupForm
			};
			const res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				getCommunityGroups();
				setGroupForm({
					title: "",
					privacy: ""
				});
				setIsGroupOpen(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const editCategory = async () => {
		try {
			let data = {
				path: "community/update/category",
				payload: { ...groupForm, id: groupToEdit.id }
			};
			const res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				getCommunityGroups();
				setGroupForm({
					title: "",
					privacy: ""
				});
				setIsEditGroupOpen(false);
				setGroupToEdit(null);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const deleteCategory = async () => {
		try {
			let data = {
				path: "community/delete/category",
				payload: { id: groupToDeleteId }
			};
			const res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				getCommunityGroups();
				setIsDeleteGroupModalOpen(false);
				setGroupToDeleteId(null);
				if (selectedGroup === groupToDeleteId) {
					setSelectedGroup(groups[0]?.id || "");
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const editComment = async (commentId, newComment) => {
		try {
			let data = {
				path: "communityComments/update",
				payload: { commentId, comment: newComment }
			};
			const res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				// Update the comment in state
				setPosts((prev) =>
					prev.map((p) => ({
						...p,
						comments: p.comments.map((c) => (c.id === commentId ? { ...c, comment: newComment } : c))
					}))
				);
				setEditingComment(null);
				setEditCommentText("");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const deleteComment = async (commentId) => {
		try {
			let data = {
				path: "communityComments/delete",
				payload: { commentId }
			};
			const res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				// Remove the comment from state
				setPosts((prev) =>
					prev.map((p) => ({
						...p,
						comments: p.comments.filter((c) => c.id !== commentId)
					}))
				);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const editPost = async () => {
		try {
			let formData = new FormData();

			console.log("editFiles:", editFiles);
			console.log("imagesToRemove:", imagesToRemove);

			// Handle multiple files
			if (editFiles && editFiles.length > 0) {
				editFiles.forEach((file) => {
					formData.append("images", file);
				});
			}

			// Handle images to remove - filter out null/undefined and invalid IDs
			const validImagesToRemove = imagesToRemove.filter((id) => id && id !== "null" && id !== "old-main-image");
			if (validImagesToRemove.length > 0) {
				formData.append("imagesToRemove", JSON.stringify(validImagesToRemove));
			}

			// Handle old main image removal separately
			const removeOldImage = imagesToRemove.includes("old-main-image");
			if (removeOldImage) {
				formData.append("removeOldImage", "true");
			}

			formData.append("title", editPostForm.title);
			formData.append("content", editPostForm.content);
			formData.append("categoryId", editPostForm.categoryId);
			formData.append("access", editPostForm.access);
			formData.append("postId", postToEdit.id);

			let data = {
				path: "community/update/post",
				payload: formData
			};

			console.log("Sending data:", data);
			let res = await ApiService.postRequest(data);

			console.log(res);
			if (res) {
				// Refresh posts to get updated data
				await getPosts(selectedGroup);

				// Close modal and reset state
				setIsEditPostOpen(false);
				setPostToEdit(null);
				setEditPostForm({
					title: "",
					content: "",
					categoryId: "",
					access: ""
				});
				setEditFiles([]);
				setImagesToRemove([]);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const getPosts = useCallback(async (group) => {
		setLoadingPosts(true);
		try {
			let data = {
				path: "community/detail",
				payload: { categoryId: group }
			};
			const res = await ApiService.postRequest(data);
			const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			setPosts(
				(res.data.posts || []).map((p) => ({
					...p,
					comments: [],
					showComments: false,
					commentText: "",
					likes: p.likes || 0,
					liked: false,
					access: p.access,
					createdAt: formatToLocalTime(p.createdAt, userTimeZone)
				}))
			);
		} catch (error) {
			console.error("Error fetching posts:", error);
			setPosts([]);
		} finally {
			setLoadingPosts(false);
		}
	}, []);

	// Function to check if post has admin comment
	const hasAdminComment = useCallback((post) => {
		return post.comments.some(comment => comment.userId === adminId);
	}, [adminId]);

	// Filtered posts based on date and answer filters
	const filteredPosts = useMemo(() => {
		let filtered = [...posts];

		// Date filter
		if (dateFilter) {
			// Create date in local timezone to avoid UTC conversion issues
			const selectedDate = new Date(dateFilter + 'T12:00:00'); // Use noon to avoid timezone issues
			// Get local date string instead of UTC
			const selectedDateString = selectedDate.getFullYear() + '-' +
				String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
				String(selectedDate.getDate()).padStart(2, '0');

			filtered = filtered.filter(post => {
				// Parse the date string properly (handles formats like "2025-10-16 01:10:13" or "16/10/2025, 01:10 am")
				let postDate;
				try {
					let dateStr = post.createdAt;

					// Handle different date formats
					if (dateStr.includes('/')) {
						// Handle format like "16/10/2025, 01:10 am"
						const parts = dateStr.split(',')[0].split('/');
						if (parts.length === 3) {
							// Convert DD/MM/YYYY to YYYY-MM-DD
							dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
						}
					}

					// Try parsing as ISO string first
					postDate = new Date(dateStr.replace(' ', 'T'));
					if (isNaN(postDate.getTime())) {
						// Fallback to direct parsing
						postDate = new Date(dateStr);
					}

					// Check if date is valid
					if (isNaN(postDate.getTime())) {
						return false;
					}
				} catch (error) {
					return false;
				}

				const postDateString = postDate.toISOString().split('T')[0];
				return postDateString === selectedDateString;
			});
		}

		// Answer filter
		if (answerFilter !== "all" && allCommentsFetched) {
			filtered = filtered.filter(post => {
				const hasAdmin = hasAdminComment(post);
				if (answerFilter === "answered") {
					return hasAdmin;
				} else if (answerFilter === "unanswered") {
					return !hasAdmin;
				}
				return true;
			});
		}

		return filtered;
	}, [posts, dateFilter, answerFilter, hasAdminComment, allCommentsFetched]);

	const getComments = useCallback(
		async (postId, index) => {
			const currentPost = posts[index];
			if (currentPost.comments.length === 0) {
				// Fetch comments
				try {
					let data = {
						path: "communityComments/list",
						payload: { postId: postId }
					};
					const res = await ApiService.postRequest(data);
					setPosts((prev) =>
						prev.map((p, i) => (i === index ? { ...p, comments: res.data.comments || [], showComments: true } : p))
					);
				} catch (error) {
					console.error("Error fetching comments:", error);
				}
			} else {
				// Toggle visibility
				setPosts((prev) => prev.map((p, i) => (i === index ? { ...p, showComments: !p.showComments } : p)));
			}
		},
		[posts]
	);

	// Function to fetch all comments for filtering (called when filters are applied)
	const fetchAllCommentsForFiltering = useCallback(async () => {
		if (allCommentsFetched) return;

		const promises = posts.map(async (post, index) => {
			if (post.comments.length === 0) {
				try {
					let data = {
						path: "communityComments/list",
						payload: { postId: post.id }
					};
					const res = await ApiService.postRequest(data);
					return { index, comments: res.data.comments || [] };
				} catch (error) {
					console.error("Error fetching comments for filtering:", error);
					return { index, comments: [] };
				}
			}
			return null;
		});

		const results = await Promise.all(promises);
		setPosts((prev) =>
			prev.map((p, i) => {
				const result = results.find(r => r && r.index === i);
				return result ? { ...p, comments: result.comments } : p;
			})
		);
		setAllCommentsFetched(true);
	}, [posts, allCommentsFetched]);

	// Fetch all comments when answer filter is applied
	useEffect(() => {
		if (answerFilter !== "all" && !allCommentsFetched) {
			fetchAllCommentsForFiltering();
		}
	}, [answerFilter, allCommentsFetched, fetchAllCommentsForFiltering]);

	const addComment = useCallback(async (postId, comment, index) => {
		if (!comment.trim()) return;
		try {
			let data = {
				path: "communityComments/create",
				payload: { postId, comment }
			};
			const res = await ApiService.postRequest(data);
			setPosts((prev) =>
				prev.map((p, i) => (i === index ? { ...p, comments: [...p.comments, res.data.comment], commentText: "" } : p))
			);
		} catch (error) {
			console.error("Error adding comment:", error);
		}
	}, []);

	const handleLike = useCallback(async (postId, index) => {
		try {
			let data = {
				path: "communityLikes/react",
				payload: { postId, reactionType: "Love" }
			};
			await ApiService.postRequest(data);
			setPosts((prev) =>
				prev.map((p, i) => (i === index ? { ...p, likes: p.likes + (p.liked ? -1 : 1), liked: !p.liked } : p))
			);
		} catch (error) {
			console.error("Error liking post:", error);
		}
	}, []);

	const createPost = async () => {
		try {
			let formData = new FormData();

			// Handle multiple files instead of single file
			if (file && file.length > 0) {
				file.forEach((file) => {
					formData.append("images", file); // Use "images" (plural) and append each file
				});
			}

			formData.append("title", postForm.title);
			formData.append("content", postForm.content);
			formData.append("categoryId", postForm.categoryId);
			formData.append("access", postForm.access ? true : false);

			let data = {
				path: "community/create/post",
				payload: formData
			};

			let res = await ApiService.postRequest(data);

			console.log(res);
			if (res) {
				getPosts(postForm.categoryId);
				setPostForm({
					title: "",
					content: "",
					categoryId: "",
					access: false // Reset access too
				});
				setFile([]); // Clear the files array
				setIsPostOpen(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const deletePost = async (postId) => {
		try {
			let data = {
				path: "community/delete/post",
				payload: {
					postId
				}
			};

			let res = await ApiService.postRequest(data);
			console.log(res);
		} catch (error) {
			console.log(error);
		}
	};

	const confirmDelete = async () => {
		console.log(postToDeleteId);
		if (postToDeleteId) {
			await deletePost(postToDeleteId);
			getPosts(selectedGroup);
			setIsDeleteModalOpen(false);
			setPostToDeleteId(null);
		}
	};

	// Helper function to get existing images for the MultiImgUploader
	// Updated helper function with IDs
	// In your parent component, update the getExistingImages function:
	// In your parent component

	// Make sure getExistingImages returns proper structure
	const getExistingImages = () => {
		if (!postToEdit) return [];

		const existingImages = [];

		// Add old single image if exists and not marked for removal
		if (postToEdit.image && !imagesToRemove.includes("old-main-image")) {
			existingImages.push({
				id: "old-main-image",
				url: import.meta.env.VITE_VideoBaseURL + postToEdit.image
			});
		}

		// Add multiple images from communityPostMedia if exist and not marked for removal
		if (postToEdit.communityPostMedia && postToEdit.communityPostMedia.length > 0) {
			postToEdit.communityPostMedia.forEach((media) => {
				if (!imagesToRemove.includes(media.id)) {
					existingImages.push({
						id: media.id,
						url: import.meta.env.VITE_VideoBaseURL + media.media
					});
				}
			});
		}

		return existingImages;
	};

			// Usage in modal
			<MultiImgUploader
				onFileSelect={setEditFiles}
				existingImages={getExistingImages()}
				onRemoveExisting={(imageId) => {
					console.log("Removing image with ID:", imageId);
					setImagesToRemove((prev) => {
						const newList = [...prev, imageId];
						console.log("Updated imagesToRemove:", newList);
						return newList;
					});
				}}
			/>;

	return (
		<>
			<section className="flex min-h-[90vh]">
				<div
					className={`bg-white lg:py-10 py-5 px-3 border-r border-gray-300 w-[75%] sm:w-[50%] lg:w-[25%] flex flex-col gap-6 fixed lg:static top-0 left-0 h-full lg:h-auto z-50 overflow-y-auto transform
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 transition-transform duration-300 ease-in-out`}
				>
					{/* Close button for mobile */}
					<div className="lg:hidden flex justify-end pr-4">
						<button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 text-2xl hover:text-gray-700">
							✕
						</button>
					</div>
					<div className="flex items-center gap-6 justify-between">
						<h1 className="text-2xl font-semibold text-gray-600">Groups</h1>
						<Button
							onClick={() => setIsGroupOpen(true)}
							text="Add Group"
							icon={IoMdAdd}
							bg="bg-[#46abbd]"
							textColor="text-white"
							borderColor="border-[#46abbd]"
							padding="py-2 px-2"
							textSize="text-sm"
						/>
					</div>
					<div className="w-full">
						<Searchbar placeholder="Search groups..." minWidth="200px" bgColor="bg-gray-100" />
					</div>

					<div className="flex flex-col gap-4 px-4">
						{groups.map((group, index) => (
							<div key={index} className="flex items-center gap-3 cursor-pointer group">
								<div onClick={() => setSelectedGroup(group.id)} className="flex items-center gap-3 flex-1">
									<div className={`p-2 rounded-full ${group?.color ? group.color : "bg-blue-500"}`}></div>
									<div>
										<h1 className="text-lg font-semibold text-gray-600">{group.title}</h1>
										<p className="flex items-center gap-1 text-sm text-gray-500">
											<LuUsers /> <span>{group?.members ? group?.members : 0}</span> Members
										</p>
									</div>
								</div>
								<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={() => {
											setGroupToEdit(group);
											setGroupForm({ title: group.title, privacy: group.privacy });
											setIsEditGroupOpen(true);
										}}
										className="text-blue-500 hover:underline text-sm"
									>
										Edit
									</button>
									<button
										onClick={() => {
											setGroupToDeleteId(group.id);
											setIsDeleteGroupModalOpen(true);
										}}
										className="text-red-500 hover:underline text-sm"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{isSidebarOpen && (
					<div className="fixed inset-0 bg-black/40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
				)}

				<div className="bg-gray-50 lg:w-[75%] w-ful py-10 sm:px-10 px-4 flex flex-col justify-center gap-8">
					{selectedGroup && (
						<>
							<div className="flex flex-wrap items-center gap-6 justify-between">
								<div className="flex items-center gap-4">
									<h1 onClick={() => setIsSidebarOpen(true)} className="lg:hidden flex text-4xl text-gray-600">
										{" "}
										<RiMenuFold4Fill />
									</h1>
									<div>
										<h1 className="text-2xl font-semibold text-gray-600">Community Forms</h1>
										<p className="text-gray-500">Create and manage community forms</p>
									</div>
								</div>
								<Button
									onClick={() => setIsPostOpen(true)}
									text="Add Post"
									icon={IoMdAdd}
									bg="bg-[#46abbd]"
									textColor="text-white"
									borderColor="border-[#46abbd]"
									padding="py-2 px-2"
									textSize="text-sm"
								/>
							</div>

							{/* Filters Section */}
							<div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
								<div className="flex items-center gap-2">
									<label className="text-sm font-medium text-gray-600">Date:</label>
									<input
										type="date"
										value={dateFilter}
										onChange={(e) => setDateFilter(e.target.value)}
										className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#46abbd]"
									/>
									{dateFilter && (
										<button
											onClick={() => setDateFilter("")}
											className="text-gray-500 hover:text-gray-700 text-sm ml-1"
										>
											Clear
										</button>
									)}
								</div>

								<div className="flex items-center gap-2">
									<label className="text-sm font-medium text-gray-600">Status:</label>
									<select
										value={answerFilter}
										onChange={(e) => setAnswerFilter(e.target.value)}
										className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#46abbd]"
									>
										<option value="all">All Posts</option>
										<option value="answered">Answered</option>
										<option value="unanswered">Unanswered</option>
									</select>
									{answerFilter !== "all" && !allCommentsFetched && (
										<span className="text-xs text-gray-500 ml-2">Loading comments...</span>
									)}
								</div>
							</div>

							{loadingPosts ? (
								<p>Loading posts...</p>
							) : (
								filteredPosts.map((post, index) => (
									<div
										key={post.id}
										className="bg-white rounded-xl shadow-md sm:p-4 p-3 w-full mx-auto border border-gray-200"
									>
										{/* Post Header */}
										<div className="flex justify-between items-start">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center font-bold text-white">
													{getUserInitials(post.user)}
												</div>
												<div>
													<h2 className="font-semibold text-gray-800 sm:text-lg text-base">{post.title}</h2>
													<p className="text-gray-500 text-sm">
														{post.user?.firstName + " " + post.user?.lastName} • {post.createdAt}
													</p>
												</div>
											</div>

											{/* Action Links */}
											<div className="flex gap-3 text-sm">
												<button
													className="text-blue-500 hover:underline"
													onClick={() => {
														setPostToEdit(post);
														setEditPostForm({
															title: post.title,
															content: post.content,
															categoryId: post.communityCategoryId || selectedGroup, // Fixed: use communityCategoryId
															access: post.access === "true" || post.access === true // Convert to boolean
														});
														setIsEditPostOpen(true);
													}}
												>
													Edit
												</button>
												<button
													className="text-red-500 hover:underline"
													onClick={() => {
														setPostToDeleteId(post.id);
														setIsDeleteModalOpen(true);
													}}
												>
													Delete
												</button>
											</div>
										</div>

										{/* Post Content */}
										<p className="mt-4 text-gray-700">{post.content}</p>

										{/* Post Media - Updated for multiple images */}
										<PostMediaCarousel post={post} />

										{/* Comments Count and Likes */}
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-4 mt-3">
												<div
													className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer hover:text-gray-700"
													onClick={() => getComments(post.id, index)}
												>
													<FaRegComment />
													<span>{post.comments.length ? post.comments.length + " Comments" : post.commentsCount}</span>
												</div>
												<div
													className="flex items-center gap-2 text-gray-500 text-sm cursor-pointer hover:text-red-500"
													onClick={() => handleLike(post.id, index)}
												>
													{post.liked ? <AiFillHeart className="text-red-500" /> : <AiOutlineHeart />}
													<span>{post.likes}</span>
												</div>
											</div>
										</div>
										<hr className="my-4" />

										{/* Comment Input */}
										<div className="flex flex-wrap items-center gap-2">
											<input
												type="text"
												placeholder="Write a comment..."
												value={post.commentText}
												onChange={(e) =>
													setPosts((prev) =>
														prev.map((p) => (p.id === post.id ? { ...p, commentText: e.target.value } : p))
													)
												}
												className="flex-1 bg-gray-100 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#46abbd]"
											/>
											<Button
												text="Comment"
												icon={BiReply}
												bg="bg-[#46abbd]"
												textColor="text-white"
												borderColor="border-[#46abbd]"
												padding="py-2 px-4"
												textSize="text-sm"
												onClick={() => addComment(post.id, post.commentText, index)}
											/>
										</div>

										{/* Comments Section */}
										{post.showComments && (
											<div className="mt-6 space-y-4">
												{post.comments.map((comment) => (
													<div key={comment.id}>
														<div className="flex gap-3 items-start">
															<div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center font-bold text-white text-sm">
																{getUserInitials(comment.user)}
															</div>
															<div className="flex-1">
																<h4 className="font-semibold text-gray-800 text-sm">
																	{comment.user?.firstName + " " + comment.user?.lastName}
																	<span className="text-gray-400 text-xs ml-2">{comment.createdAt}</span>
																</h4>
																{editingComment === comment.id ? (
																	<div className="mt-2">
																		<input
																			type="text"
																			value={editCommentText}
																			onChange={(e) => setEditCommentText(e.target.value)}
																			className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
																		/>
																		<div className="flex gap-2 mt-2">
																			<button
																				onClick={() => editComment(comment.id, editCommentText)}
																				className="text-blue-500 text-xs hover:underline"
																			>
																				Save
																			</button>
																			<button
																				onClick={() => {
																					setEditingComment(null);
																					setEditCommentText("");
																				}}
																				className="text-gray-500 text-xs hover:underline"
																			>
																				Cancel
																			</button>
																		</div>
																	</div>
																) : (
																	<p className="text-gray-700 mt-1 text-sm">{comment.comment}</p>
																)}
																<div className="flex gap-2 mt-1">
																	<button
																		onClick={() => {
																			setEditingComment(comment.id);
																			setEditCommentText(comment.comment);
																		}}
																		className="text-blue-500 text-xs hover:underline"
																	>
																		Edit
																	</button>
																	<button
																		onClick={() => deleteComment(comment.id)}
																		className="text-red-500 text-xs hover:underline"
																	>
																		Delete
																	</button>
																</div>
															</div>
														</div>
													</div>
												))}
											</div>
										)}
									</div>
								))
							)}
						</>
					)}
				</div>
			</section>

			{/* Add Post Modal */}
			<Modal
				isOpen={isPostOpen}
				onClose={() => setIsPostOpen(false)}
				title="Add New Post"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Create"
				onPrimaryClick={() => createPost(postForm)}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Post Title:</label>
						<input
							type="text"
							value={postForm.title}
							onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
							placeholder="enter name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
              focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Group Category:</label>
						<select
							defaultValue={postForm.categoryId}
							onChange={(e) => setPostForm({ ...postForm, categoryId: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{groups.map((category) => (
								<option key={category.id} value={category.id}>
									{category.title}
								</option>
							))}
						</select>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Post Description:</label>
						<textarea
							placeholder="enter description"
							value={postForm.content}
							onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
					</div>
					{/* <div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Add Tags:</label>
						<select
							defaultValue=""
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							<option value="1 month">Junior Moderator</option>
							<option value="3 month">Senior Moderator</option>
						</select>
					</div> */}
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Image:</label>
						{/* <ImgUploader onFileSelect={setFile} multiple={true} /> */}
						<MultiImgUploader onFileSelect={setFile} />
					</div>
					<h2 className="text-xl font-semibold text-gray-800">Publishing Options:</h2>
					<div className="flex gap-3 items-center">
						<input
							className="w-5 h-5 accent-[#46abbd]"
							type="checkbox"
							value={postForm.access}
							onChange={(e) => setPostForm({ ...postForm, access: e.target.checked })}
							name=" "
							id=""
						/>
						<p className="text-base font-light text-gray-500">Allow Comments</p>
					</div>
					{/* <div className="flex gap-3 items-center">
						<input className="w-5 h-5 accent-[#46abbd]" type="checkbox" name="" id="" value={postForm.access} onChange={(e) => setPostForm({ ...postForm, notify: e.target.checked })} />
						<p className="text-base font-light text-gray-500">Send Notifications</p>
					</div> */}
				</div>
			</Modal>

			{/* Group Modal */}
			<Modal
				isOpen={isGroupOpen}
				onClose={() => setIsGroupOpen(false)}
				title="Create New Group"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Create"
				onPrimaryClick={addCategory}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Group Name:</label>
						<input
							type="text"
							value={groupForm.title}
							onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
							placeholder="enter name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
              focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
					{/* <div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Group Category:</label>
						<select
							defaultValue=""
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							<option value="1 month">Junior Moderator</option>
							<option value="3 month">Senior Moderator</option>
						</select>
					</div> */}
					{/* <div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Pre-Workout Instructions:</label>
						<textarea
							placeholder="enter description"
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
					</div> */}
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Privacy Settings:</label>
						<select
							defaultValue={groupForm.privacy}
							onChange={(e) => setGroupForm({ ...groupForm, privacy: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							<option value="members">All members</option>
							<option value="admin">Only Admin</option>
						</select>
					</div>
				</div>
			</Modal>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Confirm Delete"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Delete"
				onPrimaryClick={confirmDelete}
				onSecondaryClick={() => setIsDeleteModalOpen(false)}
			>
				<p>Are you sure you want to delete this post? This action cannot be undone.</p>
			</Modal>

			{/* Edit Group Modal */}
			<Modal
				isOpen={isEditGroupOpen}
				onClose={() => {
					setIsEditGroupOpen(false);
					setGroupToEdit(null);
					setGroupForm({ title: "", privacy: "" });
				}}
				title="Edit Group"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={editCategory}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Group Name:</label>
						<input
							type="text"
							value={groupForm.title}
							onChange={(e) => setGroupForm({ ...groupForm, title: e.target.value })}
							placeholder="enter name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
              focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Privacy Settings:</label>
						<select
							value={groupForm.privacy}
							onChange={(e) => setGroupForm({ ...groupForm, privacy: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							<option value="members">All members</option>
							<option value="admin">Only Admin</option>
						</select>
					</div>
				</div>
			</Modal>

			{/* Delete Group Confirmation Modal */}
			<Modal
				isOpen={isDeleteGroupModalOpen}
				onClose={() => setIsDeleteGroupModalOpen(false)}
				title="Confirm Delete Group"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Delete"
				onPrimaryClick={deleteCategory}
				onSecondaryClick={() => setIsDeleteGroupModalOpen(false)}
			>
				<p>Are you sure you want to delete this group? This action cannot be undone.</p>
			</Modal>

			{/* Edit Post Modal */}
			<Modal
				isOpen={isEditPostOpen}
				onClose={() => {
					setIsEditPostOpen(false);
					setPostToEdit(null);
					setEditPostForm({
						title: "",
						content: "",
						categoryId: "",
						access: ""
					});
					setEditFiles([]); // Changed from setEditFile to setEditFiles
				}}
				title="Edit Post"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText="Update"
				onPrimaryClick={editPost}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Post Title:</label>
						<input
							type="text"
							value={editPostForm.title}
							onChange={(e) => setEditPostForm({ ...editPostForm, title: e.target.value })}
							placeholder="enter name"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
              focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Group Category:</label>
						<select
							value={editPostForm.categoryId}
							onChange={(e) => setEditPostForm({ ...editPostForm, categoryId: e.target.value })}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe]"
						>
							<option value="">Select</option>
							{groups.map((category) => (
								<option key={category.id} value={category.id}>
									{category.title}
								</option>
							))}
						</select>
					</div>
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Post Description:</label>
						<textarea
							placeholder="enter description"
							value={editPostForm.content}
							onChange={(e) => setEditPostForm({ ...editPostForm, content: e.target.value })}
							rows={4}
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300
                focus:outline-none focus:border-[#46acbe] resize-y"
						/>
						<p className="text-xs text-gray-600">10,000 Max Characters</p>
					</div>

					{/* Updated Image Upload Section for Multiple Images */}
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Images:</label>
						<MultiImgUploader
							onFileSelect={setEditFiles}
							existingImages={getExistingImages()}
							onRemoveExisting={(imageId) => {
								setImagesToRemove((prev) => [...prev, imageId]);
							}}
						/>

						{/* Show existing images from both old and new posts */}
						{(postToEdit?.image || postToEdit?.communityPostMedia?.length > 0) && (
							<div className="mt-3">
								<p className="text-sm text-gray-600 mb-2">Current Images:</p>
								<div className="flex flex-wrap gap-2">
									{/* Show old single image if exists and not marked for removal */}
									{postToEdit?.image && !imagesToRemove.includes("old-main-image") && (
										<div className="relative">
											<img
												src={import.meta.env.VITE_VideoBaseURL + postToEdit.image}
												alt="Current post image"
												className="w-20 h-20 object-cover rounded-lg border border-gray-300"
											/>
											<span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">Old</span>
										</div>
									)}

									{/* Show multiple images from communityPostMedia not marked for removal */}
									{postToEdit?.communityPostMedia?.map((media) => (
										!imagesToRemove.includes(media.id) && (
											<div key={media.id} className="relative">
												<img
													src={import.meta.env.VITE_VideoBaseURL + media.media}
													alt="Post media"
													className="w-20 h-20 object-cover rounded-lg border border-gray-300"
												/>
												<span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">New</span>
											</div>
										)
									))}
								</div>
								<p className="text-xs text-gray-500 mt-1">Note: New images will be added to existing ones</p>
							</div>
						)}
					</div>

					<h2 className="text-xl font-semibold text-gray-800">Publishing Options:</h2>
					<div className="flex gap-3 items-center">
						<input
							className="w-5 h-5 accent-[#46abbd]"
							type="checkbox"
							checked={editPostForm.access}
							onChange={(e) => setEditPostForm({ ...editPostForm, access: e.target.checked })}
						/>
						<p className="text-base font-light text-gray-500">Allow Comments</p>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default Community;
