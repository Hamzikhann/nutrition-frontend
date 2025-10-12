import React, { useState, useEffect, useCallback, useMemo } from "react";
import Searchbar from "../components/Searchbar";
import Button from "../components/Button";
import Modal from "../components/Modal";
import ImgUploader from "../components/ImgUploader";
import WorkoutCard from "../components/WorkoutCard";
import hightLightpic from "/src/assets/exercise.png";
import { IoMdAdd, IoMdTrash, IoMdCreate } from "react-icons/io";
import ApiService from "../services/ApiServices";
import Inputs from "../components/Inputs";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";

function Workout() {
	const [isModalWorkoutOpen, setIsWorkoutModalOpen] = useState(false);
	const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
	const [weeks, setWeeks] = useState([]);
	const [days, setDays] = useState([]);
	const [selectedWeek, setSelectedWeek] = useState(null);
	const [selectedWeekData, setSelectedWeekData] = useState(null);
	const [selectedDay, setSelectedDay] = useState(null);
	const [file, setFile] = useState("");
	const [allExercise, setAllExercise] = useState([]);
	const [exercise, setExercise] = useState({
		name: "",
		description: "",
		video: ""
	});
	const [exerciseOptions, setExerciseOptions] = useState([]);
	const [workoutForms, setWorkoutForms] = useState({
		weekId: "",
		workoutDayId: "",
		exerciseId: "",
		sets: "",
		reps: ""
	});
	const [workoutErrors, setWorkoutErrors] = useState({});
	const [exerciseErrors, setExerciseErrors] = useState({});
	const [isLoadingWorkout, setIsLoadingWorkout] = useState(false);
	const [isLoadingExercise, setIsLoadingExercise] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [exerciseToDelete, setExerciseToDelete] = useState(null);
	const [isDeleteWorkoutModalOpen, setIsDeleteWorkoutModalOpen] = useState(false);
	const [workoutToDelete, setWorkoutToDelete] = useState(null);
	const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
	const [weekForm, setWeekForm] = useState({
		planId: "",
		numWeeks: 0
	});

	let exerciseFields = [
		{ name: "name", label: "Title", type: "text", placeholder: "Enter title" },
		{ name: "description", label: "Description", type: "textarea", placeholder: "Enter description" }
	];

	const workoutFields = useMemo(
		() => [
			{
				name: "weekId",
				label: "Select Weeks",
				type: "select",
				placeholder: "Select Week",
				options: weeks.map((w) => ({ id: w.id, title: w.title }))
			},
			{
				name: "workoutDayId",
				label: "Select Days",
				type: "select",
				placeholder: "Select Day",
				options: days.filter((d) => d.weekId === workoutForms.weekId).map((d) => ({ id: d.id, title: d.title }))
			},
			{
				name: "exerciseId",
				label: "Select Exercise",
				type: "select",
				placeholder: "Select Exercise",
				options: exerciseOptions
			},
			{ name: "sets", label: "Sets", type: "number", placeholder: "Enter sets" },
			{ name: "reps", label: "Reps", type: "number", placeholder: "Enter reps" }
		],
		[weeks, days, workoutForms.weekId, exercise]
	);

	const getWorkouts = useCallback(async () => {
		console.log(selectedWeek);
		if (!selectedWeek) return;
		let data = {
			path: "workout/detail",
			payload: { weekId: selectedWeek }
		};
		let res = await ApiService.postRequest(data);
		console.log(res);
		if (res.data && res.data.data) {
			setSelectedWeekData(res.data.data);
			if (res.data.data.workoutDays && res.data.data.workoutDays.length > 0) {
				setSelectedDay(res.data.data.workoutDays[0].id);
			}
		}
	}, [selectedWeek]);

	const getWeeks = useCallback(async () => {
		let data = {
			path: "workout/list/weeks",
			payload: {}
		};
		let res = await ApiService.postRequest(data);
		console.log(res);
		setWeeks(res.data.data);
		// return statuses.map((status) => status);
	}, []);

	const getDays = useCallback(async () => {
		// Sif (!selectedWeek) return;
		let data = {
			path: "workout/list/workoutdays",
			payload: {}
		};
		let res = await ApiService.postRequest(data);
		console.log(res);
		setDays(res.data.data);
		// return statuses.map((status) => status);
	}, [selectedWeek]);

	const getExercises = useCallback(async () => {
		let data = {
			path: "exercise/list",
			payload: {}
		};

		let res = await ApiService.postRequest(data);

		console.log(res);
		setAllExercise(res.data.data);
		setExerciseOptions(res.data.data.map((e) => ({ id: e.id, title: e.name })));
	}, []);

	const validateWorkout = () => {
		let errors = {};
		if (!workoutForms.weekId) errors.weekId = "Please select a week.";
		if (!workoutForms.workoutDayId) errors.workoutDayId = "Please select a day.";
		if (!workoutForms.exerciseId) errors.exerciseId = "Please select an exercise.";
		if (!workoutForms.sets || isNaN(workoutForms.sets) || workoutForms.sets <= 0)
			errors.sets = "Please enter a valid number of sets.";
		if (!workoutForms.reps || isNaN(workoutForms.reps) || workoutForms.reps <= 0)
			errors.reps = "Please enter a valid number of reps.";
		return errors;
	};

	const createWorkout = async () => {
		const errors = validateWorkout();
		if (Object.keys(errors).length > 0) {
			setWorkoutErrors(errors);
			return;
		}
		setWorkoutErrors({});
		setIsLoadingWorkout(true);
		try {
			let data = {
				path: "workout/create",
				payload: {
					weekId: workoutForms.weekId,
					workoutDayId: workoutForms.workoutDayId,
					exerciseId: workoutForms.exerciseId,
					sets: workoutForms.sets,
					reps: workoutForms.reps
				}
			};

			let res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				// Reset form and close modal
				setWorkoutForms({ weekId: "", workoutDayId: "", exerciseId: "", sets: "", reps: "" });
				setFile("");
				setIsWorkoutModalOpen(false);
				// Refresh data
				getWorkouts();
				toast.success("Workout created successfully!");
			}
		} catch (error) {
			console.log(error);
			setWorkoutErrors({ general: "Failed to create workout. Please try again." });
		} finally {
			setIsLoadingWorkout(false);
		}
	};

	const validateExercise = () => {
		let errors = {};
		if (!exercise.name) errors.name = "Please enter exercise title.";
		if (!exercise.description) errors.description = "Please enter exercise description.";
		if (!isEditMode && !file) errors.video = "Please upload a video.";
		return errors;
	};

	const createExercise = async () => {
		const errors = validateExercise();
		if (Object.keys(errors).length > 0) {
			setExerciseErrors(errors);
			return;
		}
		setExerciseErrors({});
		setIsLoadingExercise(true);
		try {
			let formData = new FormData();

			if (file) formData.append("video", file);

			formData.append("name", exercise.name);
			formData.append("description", exercise.description);

			let data = {
				path: "exercise/create",
				payload: formData
			};

			let res = await ApiService.postRequest(data);

			console.log(res);
			if (res.data) {
				setExercise({ name: "", description: "", video: "" });
				setFile("");
				setIsExerciseModalOpen(false);
				getExercises();
				toast.success("Exercise created successfully!");
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoadingExercise(false);
		}
	};

	const handleEditExercise = (exercise) => {
		setSelectedExercise(exercise);
		setExercise({ name: exercise.name, description: exercise.description, video: "" });
		setFile(null);
		setIsEditMode(true);
		setIsExerciseModalOpen(true);
	};

	const handleDeleteExercise = (id) => {
		setExerciseToDelete(id);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteWorkout = (data) => {
		setWorkoutToDelete(data.id);
		setIsDeleteWorkoutModalOpen(true);
	};

	const updateExercise = async () => {
		const errors = validateExercise();
		if (Object.keys(errors).length > 0) {
			setExerciseErrors(errors);
			return;
		}
		setExerciseErrors({});
		setIsLoadingExercise(true);
		try {
			let formData = new FormData();

			if (file) formData.append("video", file);

			formData.append("name", exercise.name);
			formData.append("description", exercise.description);
			formData.append("id", selectedExercise.id);

			let data = {
				path: "exercise/update",
				payload: formData
			};

			let res = await ApiService.postRequest(data);

			console.log(res);
			if (res.data) {
				setExercise({ name: "", description: "", video: "" });
				setFile("");
				setIsExerciseModalOpen(false);
				setIsEditMode(false);
				setSelectedExercise(null);
				getExercises();
				toast.success("Exercise updated successfully!");
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoadingExercise(false);
		}
	};

	const deleteExercise = async () => {
		try {
			let data = {
				path: "exercise/delete",
				payload: { id: exerciseToDelete }
			};
			let res = await ApiService.postRequest(data);
			if (res) {
				setIsDeleteModalOpen(false);
				setExerciseToDelete(null);
				getExercises();
				getWorkouts();
				toast.success("Exercise deleted successfully!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const deleteWorkout = async () => {
		try {
			let data = {
				path: "workout/delete",
				payload: { id: workoutToDelete }
			};
			let res = await ApiService.postRequest(data);
			if (res.success) {
				setIsDeleteWorkoutModalOpen(false);
				setWorkoutToDelete(null);
				getWorkouts();
				toast.success("Workout deleted successfully!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	const createWeeks = async () => {
		try {
			let data = {
				path: "workout/create/week",
				payload: {
					numberOfWeeks: Number(weekForm.numWeeks)
				}
			};
			let res = await ApiService.postRequest(data);
			console.log(res);
			if (res) {
				toast.success("Week created successfully!");
			}
		} catch (error) {
			console.log(error);
		}
		getWeeks();
		setIsWeekModalOpen(false);
		setWeekForm({ planId: "", numWeeks: "" });
	};

	useEffect(() => {
		getWeeks();
		getExercises();
		getDays();
	}, []);

	useEffect(() => {
		getWorkouts();
	}, [selectedWeek, getWorkouts]);

	const onSelectWeek = (weekId) => {
		setSelectedWeek(weekId);
	};

	return (
		<>
			<section className="bg-gray-50 sm:p-7 p-4 min-h-screen flex gap-10 flex-col">
				{/* upper div */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<Searchbar />
						<div className="flex gap-2">
							<Button
								onClick={() => setIsWeekModalOpen(true)}
								text="Add Week"
								icon={IoMdAdd}
								bg="bg-[#46abbd]"
								textColor="text-white"
								borderColor="border-[#46abbd]"
							/>
							<Button
								onClick={() => setIsWorkoutModalOpen(true)}
								text="Add Work-Out"
								icon={IoMdAdd}
								bg="bg-[#46abbd]"
								textColor="text-white"
								borderColor="border-[#46abbd]"
							/>
							<Button
								onClick={() => setIsExerciseModalOpen(true)}
								text="Add Exercise"
								icon={IoMdAdd}
								bg="bg-[#46abbd]"
								textColor="text-white"
								borderColor="border-[#46abbd]"
							/>
						</div>
					</div>
					<div className="flex items-center gap-8">
						<div className="flex flex-col gap-2">
							<label className="text-base font-normal text-gray-600">Select Week</label>
							<select
								defaultValue=""
								onChange={(e) => onSelectWeek(e.target.value)}
								className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
							>
								<option value="">Select Week</option>
								{weeks.map((week) => (
									<option key={week.id} value={week.id}>
										{week.title}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* WorkOut Content */}
				{selectedWeekData && selectedWeekData.workoutDays && (
					<div className="flex flex-col gap-6">
						<div className="flex gap-4 border-b border-gray-300 pb-2 overflow-x-auto">
							{selectedWeekData.workoutDays.map((day) => (
								<button
									key={day.id}
									className={`px-4 py-2 rounded ${
										day.id === selectedDay ? "bg-[#46acbe] text-white" : "bg-gray-200 text-gray-700"
									}`}
									onClick={() => setSelectedDay(day.id)}
								>
									{day.title}
								</button>
							))}
						</div>
						<div className="flex flex-wrap justify-center items-center gap-3 mt-4">
							{selectedWeekData.workoutDays
								.find((day) => day.id === selectedDay)
								?.workoutDayExercises.map((exercise) => (
									<WorkoutCard
										key={exercise.exercise.id}
										name={exercise.exercise.name}
										date={exercise.exercise.date}
										sets={exercise.sets}
										reps={exercise.reps}
										video={import.meta.env.VITE_VideoBaseURL + exercise.exercise.videoURL || hightLightpic}
										onDelete={() => handleDeleteWorkout(exercise)}
									/>
								))}
						</div>
					</div>
				)}
				<div className="mt-8">
					<h3 className="text-lg font-semibold text-gray-700 mb-4">Exercises Table</h3>
					<DataTable
						columns={[
							{
								name: "Exercise Name",
								selector: (row) => row.name,
								sortable: true,
								style: {
									fontSize: "14px",
									fontWeight: "600",
									color: "#374151"
								}
							},
							{
								name: "Sets",
								selector: (row) => row.sets,
								sortable: true,
								center: true,
								style: {
									fontSize: "14px",
									fontWeight: "500",
									color: "#6B7280"
								}
							},
							{
								name: "Reps",
								selector: (row) => row.reps,
								sortable: true,
								center: true,
								style: {
									fontSize: "14px",
									fontWeight: "500",
									color: "#6B7280"
								}
							},
							{
								name: "Video",
								cell: (row) =>
									row.videoURL ? (
										<video
											loading="lazy"
											className="h-16 w-24 object-cover rounded-lg shadow-sm border border-gray-200"
											src={import.meta.env.VITE_VideoBaseURL + row.videoURL}
											controls
										/>
									) : (
										<img
											loading="lazy"
											src={hightLightpic}
											alt="No video"
											className="h-16 w-24 object-cover rounded-lg shadow-sm border border-gray-200"
										/>
									),
								ignoreRowClick: true,
								allowOverflow: true,
								button: true,
								center: true
							},
							{
								name: "Actions",
								cell: (row) => (
									<div className="flex gap-2">
										<button
											onClick={() => handleEditExercise(row)}
											className="p-0 min-w-0 w-5 h-5 bg-[#46abbd] text-white border border-[#46abbd] rounded flex items-center justify-center hover:bg-[#3a9ba8]"
										>
											<IoMdCreate size={15} />
										</button>
										<button
											onClick={() => handleDeleteExercise(row.id)}
											className="p-0 min-w-0 w-5 h-5 bg-red-600 text-white border border-red-600 rounded flex items-center justify-center hover:bg-red-700"
										>
											<IoMdTrash size={15} />
										</button>
									</div>
								)
							}
						]}
						data={allExercise || []}
						pagination
						paginationPerPage={5}
						paginationRowsPerPageOptions={[5, 10, 15, 20]}
						highlightOnHover
						striped
						customStyles={{
							table: {
								style: {
									borderRadius: "12px",
									overflow: "hidden",
									boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
								}
							},
							header: {
								style: {
									backgroundColor: "#F9FAFB",
									borderBottom: "2px solid #E5E7EB",
									minHeight: "56px",
									fontSize: "16px",
									fontWeight: "700",
									color: "#111827"
								}
							},
							headRow: {
								style: {
									backgroundColor: "#F3F4F6",
									borderBottom: "1px solid #D1D5DB"
								}
							},
							headCells: {
								style: {
									fontSize: "14px",
									fontWeight: "600",
									color: "#374151",
									paddingLeft: "16px",
									paddingRight: "16px",
									paddingTop: "12px",
									paddingBottom: "12px"
								}
							},
							rows: {
								style: {
									fontSize: "14px",
									fontWeight: "500",
									color: "#6B7280",
									paddingTop: "12px",
									paddingBottom: "12px",
									"&:hover": {
										backgroundColor: "#F9FAFB",
										cursor: "pointer"
									}
								},
								stripedStyle: {
									backgroundColor: "#FAFAFA"
								}
							},
							cells: {
								style: {
									paddingLeft: "16px",
									paddingRight: "16px"
								}
							}
						}}
					/>
				</div>
			</section>

			{/* Model for creating the workouts */}
			<Modal
				isOpen={isModalWorkoutOpen}
				onClose={() => setIsWorkoutModalOpen(false)}
				title="Add New Workout"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText={isLoadingWorkout ? "Adding..." : "Add"}
				onPrimaryClick={() => createWorkout()}
				primaryBtnDisabled={isLoadingWorkout}
			>
				<div className="flex flex-col gap-4 pb-4">
					<Inputs fields={workoutFields} formData={workoutForms} setFormData={setWorkoutForms} errors={workoutErrors} />
					{workoutErrors.general && <p className="text-red-500 text-sm">{workoutErrors.general}</p>}
				</div>
			</Modal>

			{/* Model for creating/editing the Exercise */}
			<Modal
				isOpen={isExerciseModalOpen}
				onClose={() => {
					setIsExerciseModalOpen(false);
					if (isEditMode) {
						setIsEditMode(false);
						setSelectedExercise(null);
						setExercise({ name: "", description: "", video: "" });
						setFile(null);
					}
				}}
				title={isEditMode ? "Edit Exercise" : "Add New Exercise"}
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-2xl"
				secondaryBtnText="Cancel"
				primaryBtnText={isLoadingExercise ? (isEditMode ? "Updating..." : "Adding...") : isEditMode ? "Update" : "Add"}
				onPrimaryClick={isEditMode ? updateExercise : createExercise}
				primaryBtnDisabled={isLoadingExercise}
			>
				<div className="flex flex-col gap-4 pb-4">
					<Inputs fields={exerciseFields} formData={exercise} setFormData={setExercise} errors={exerciseErrors} />
					<div className="w-full flex flex-col gap-2">
						<label className="text-lg font-normal text-gray-600">Upload Video:</label>
						<ImgUploader onFileSelect={setFile} />
						{exerciseErrors.video && <p className="text-red-500 text-sm">{exerciseErrors.video}</p>}
						{file && (
							<video loading="lazy" className="w-full h-32 object-cover rounded-lg" controls>
								<source src={URL.createObjectURL(file)} type="video/mp4" />
							</video>
						)}
						{isEditMode && selectedExercise?.videoURL && !file && (
							<video
								loading="lazy"
								className="w-full h-32 object-cover rounded-lg"
								src={import.meta.env.VITE_VideoBaseURL + selectedExercise.videoURL}
								controls
							>
								<source src={import.meta.env.VITE_VideoBaseURL + selectedExercise.videoURL} type="video/mp4" />
							</video>
						)}
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
				onPrimaryClick={deleteExercise}
				primaryBtnDisabled={false}
				danger={true}
			>
				<div className="flex flex-col gap-4 pb-4">
					<p className="text-gray-600">Are you sure you want to delete this exercise? This action cannot be undone.</p>
				</div>
			</Modal>

			{/* Delete Workout Confirmation Modal */}
			<Modal
				isOpen={isDeleteWorkoutModalOpen}
				onClose={() => setIsDeleteWorkoutModalOpen(false)}
				title="Confirm Delete"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Delete"
				onPrimaryClick={deleteWorkout}
				primaryBtnDisabled={false}
				danger={true}
			>
				<div className="flex flex-col gap-4 pb-4">
					<p className="text-gray-600">Are you sure you want to delete this workout? This action cannot be undone.</p>
				</div>
			</Modal>

			{/* Add Week Modal */}
			<Modal
				isOpen={isWeekModalOpen}
				onClose={() => setIsWeekModalOpen(false)}
				title="Add Weeks"
				showTitle={true}
				showCloseIcon={true}
				showDivider={true}
				width="min-w-[300px] max-w-md"
				secondaryBtnText="Cancel"
				primaryBtnText="Add"
				onPrimaryClick={createWeeks}
			>
				<div className="flex flex-col gap-4 pb-4">
					<div className="w-full flex flex-col gap-2">
						<label className="text-base font-normal text-gray-600">Number of Weeks:</label>
						<input
							type="number"
							value={weekForm.numWeeks}
							onChange={(e) => setWeekForm({ ...weekForm, numWeeks: e.target.value })}
							placeholder="Enter number of weeks"
							className="w-full py-3 px-4 rounded-lg text-sm bg-gray-100 border border-gray-300 focus:outline-none focus:border-[#46acbe]"
						/>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default Workout;
