
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const initialState = {
	title: "",
	description: "",
	location: "",
	startDate: "",
	endDate: "",
	capacity: "",
	organizer: "",
	bannerUrl: "",
	tags: "",
};

const CreateEvent = () => {
	const [form, setForm] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const [isEdit, setIsEdit] = useState(false);
	const [eventId, setEventId] = useState(null);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const editId = params.get("edit");
		if (editId) {
			setIsEdit(true);
			setEventId(editId);
			setLoading(true);
			// Fetch event data from localStorage
			const events = JSON.parse(localStorage.getItem("events")) || [];
			const data = events.find(ev => ev._id === editId);
			if (data) {
				setForm({
					title: data.title || "",
					description: data.description || "",
					location: data.location || "",
					startDate: data.startDate || "",
					endDate: data.endDate || "",
					capacity: data.capacity ? String(data.capacity) : "",
					organizer: data.organizer || "",
					bannerUrl: data.bannerUrl || "",
					tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags || "",
				});
			} else {
				setError("Event not found for editing.");
			}
			setLoading(false);
		}
	}, [location.search]);

	// Properly define handleChange function
	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const eventData = {
				...form,
				tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
				capacity: form.capacity ? parseInt(form.capacity) : undefined,
				_id: isEdit && eventId ? eventId : Date.now().toString(),
			};
			let events = JSON.parse(localStorage.getItem("events")) || [];
			if (isEdit && eventId) {
				events = events.map(ev => ev._id === eventId ? eventData : ev);
			} else {
				events.push(eventData);
			}
			localStorage.setItem("events", JSON.stringify(events));
			navigate("/events");
		} catch (err) {
			setError(isEdit ? "Error updating event" : "Error creating event");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto py-12 px-4 md:px-0 animate-fade-in">
			<h1 className="text-3xl md:text-4xl font-bold text-cyan-700 mb-8 text-center">{isEdit ? "Update Event" : "Create New Event"}</h1>
			<form className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100" onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
						<input
							type="text"
							name="title"
							value={form.title}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							placeholder="Event Title"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea
							name="description"
							value={form.description}
							onChange={handleChange}
							required
							rows={4}
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							placeholder="Event Description"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
						<input
							type="text"
							name="location"
							value={form.location}
							onChange={handleChange}
							required
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							placeholder="Event Location"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
							<input
								type="datetime-local"
								name="startDate"
								value={form.startDate}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
							<input
								type="datetime-local"
								name="endDate"
								value={form.endDate}
								onChange={handleChange}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
							<input
								type="number"
								name="capacity"
								value={form.capacity}
								onChange={handleChange}
								min="1"
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
								placeholder="Max Attendees"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Organizer Name</label>
							<input
								type="text"
								name="organizer"
								value={form.organizer}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
								placeholder="Organizer Name"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
						<input
							type="url"
							name="bannerUrl"
							value={form.bannerUrl}
							onChange={handleChange}
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							placeholder="https://..."
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
						<input
							type="text"
							name="tags"
							value={form.tags}
							onChange={handleChange}
							className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
							placeholder="beach,cleanup,volunteer"
						/>
					</div>
				</div>
				{error && <div className="text-red-600 mt-4 text-center">{error}</div>}
				<button
					type="submit"
					disabled={loading}
					className="w-full mt-8 px-4 py-3 bg-cyan-600 text-white rounded-xl font-bold cursor-pointer hover:bg-cyan-700 transition-all duration-300 shadow-lg"
				>
					{loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Event" : "Create Event")}
				</button>
			</form>
		</div>
	);
};

export default CreateEvent;
