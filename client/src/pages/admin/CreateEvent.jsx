import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import emailjs from "@emailjs/browser";

const initialState = {
	title: "",
	description: "",
	location: "",
	startDate: "",
	endDate: "",
	capacity: "",
	bannerUrl: "",
	tags: "",
};

const BACKEND_URL = "http://localhost:8001/ai"; // FastAPI AI server

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
			fetch(`/api/events/${editId}`)
				.then(res => res.json())
				.then(data => {
					setForm({
						title: data.title || "",
						description: data.description || "",
						location: data.location || "",
						startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0,16) : "",
						endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0,16) : "",
						capacity: data.capacity ? String(data.capacity) : "",
						bannerUrl: data.bannerUrl || "",
						tags: Array.isArray(data.tags) ? data.tags.join(",") : data.tags || "",
					});
					setLoading(false);
				})
				.catch(() => {
					setError("Event not found for editing.");
					setLoading(false);
				});
		}
	}, [location.search]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};


	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		// Validate required fields before submit
		if (!form.title || !form.startDate) {
			setError("Title and Start Date are required.");
			setLoading(false);
			return;
		}
		try {
			const eventData = {
				...form,
				startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
				endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
				tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
				capacity: form.capacity ? parseInt(form.capacity) : undefined,
			};
			const token = localStorage.getItem("token");
			let response;
			if (isEdit && eventId) {
				response = await fetch(`/api/events/${eventId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
					body: JSON.stringify(eventData),
				});
			} else {
				response = await fetch(`/api/events`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
					body: JSON.stringify(eventData),
				});
			}
			const result = await response.json();
			if (!response.ok) {
				if (result.details) {
					// Show backend validation errors
					setError(Object.values(result.details).map(e => e.message).join("; "));
				} else {
					setError(result.message || (isEdit ? "Error updating event" : "Error creating event"));
				}
				setLoading(false);
				return;
			}
			// 🔹 Trigger email notification only for new events
			if (!isEdit) {
				await notifyUsers(eventData.title);
			}
			navigate("/events");
		} catch (err) {
			setError(isEdit ? "Error updating event" : "Error creating event");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	// Function to generate description & flyer, then send email
	const notifyUsers = async (eventQuery) => {
		try {
			// 1️⃣ Generate description
			const descRes = await fetch(`${BACKEND_URL}/description`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ event_query: eventQuery }),
			});
			const descData = await descRes.json();
			const description = descData.description;

			// 2️⃣ Generate flyer
			const flyerRes = await fetch(`${BACKEND_URL}/flyer`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ event_query: eventQuery }),
			});
			const flyerData = await flyerRes.json();
			const flyerUrl = flyerData.flyer_url || flyerData.image_path;

			// 3️⃣ Send Email via EmailJS
			const templateParams = {
				to_email: "recipient@example.com", // replace with actual recipient
				event_description: description,
				flyer_url: flyerUrl,
			};

			await emailjs.send(
				import.meta.env.VITE_EMAILJS_SERVICE_ID,
				import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
				templateParams,
				import.meta.env.VITE_EMAILJS_PUBLIC_KEY
			);

			console.log("Notification email sent successfully ✅");
		} catch (err) {
			console.error("Failed to notify users ❌", err);
		}
	};

	return (
		<div className="max-w-2xl mx-auto py-12 px-4 md:px-0 animate-fade-in">
			<h1 className="text-3xl md:text-4xl font-bold text-cyan-700 mb-8 text-center">
				{isEdit ? "Update Event" : "Create New Event"}
			</h1>

			<form className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100" onSubmit={handleSubmit}>
				<div className="grid grid-cols-1 gap-6">
					{/* Title */}
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

					{/* Description */}
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

					{/* Location */}
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

					{/* Start & End Dates */}
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

					{/* Capacity & Organizer */}
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
					</div>

					{/* Banner URL */}
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

					{/* Tags */}
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
