import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const NotifyEvent = () => {
  const [eventQuery, setEventQuery] = useState("");
  const [description, setDescription] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [status, setStatus] = useState("");

  // FastAPI AI server URL
  const BACKEND_URL = "http://localhost:8001/ai";

  // 1️⃣ Generate description from backend
  const fetchDescription = async () => {
    if (!eventQuery) {
      setStatus("Please enter an event query!");
      return;
    }
    setStatus("Generating description...");
    try {
      const res = await fetch(`${BACKEND_URL}/description`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_query: eventQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setDescription(data.description);
        setStatus("Description generated ✅");
      } else {
        setStatus("Failed to generate description ❌");
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to generate description ❌");
    }
  };

  // 2️⃣ Generate flyer from backend
  const fetchFlyer = async () => {
    if (!eventQuery) {
      setStatus("Please enter an event query!");
      return;
    }
    setStatus("Generating flyer...");
    try {
      const res = await fetch(`${BACKEND_URL}/flyer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_query: eventQuery }),
      });
      const data = await res.json();
      if (data.success) {
        // backend should return flyer_url (Cloudinary link)
        setFlyerUrl(data.flyer_url || data.image_path);
        setStatus("Flyer generated ✅");
      } else {
        setStatus("Failed to generate flyer ❌");
      }
    } catch (err) {
      console.error(err);
      setStatus("Failed to generate flyer ❌");
    }
  };

  // 3️⃣ Send email using EmailJS
  const sendEmail = async () => {
    if (!description || !flyerUrl) {
      setStatus("Please generate description & flyer first!");
      return;
    }

    setStatus("Sending email...");
    try {
      const templateParams = {
        to_email: "vedgawali@gmail.com", // replace with real recipient
        event_description: description,
        flyer_url: flyerUrl,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("Email sent successfully ✅");
    } catch (err) {
      console.error(err);
      setStatus("Failed to send email ❌");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Notify Users About New Event</h2>

      <input
        type="text"
        placeholder="Enter event name or query"
        value={eventQuery}
        onChange={(e) => setEventQuery(e.target.value)}
        className="w-full border p-2 rounded-lg"
      />

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={fetchDescription}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
        >
          Generate Description
        </button>
        <button
          onClick={fetchFlyer}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Generate Flyer
        </button>
        <button
          onClick={sendEmail}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Send Email
        </button>
      </div>

      <div className="mt-4">
        <p className="font-semibold">Status: {status}</p>
      </div>

      {description && (
        <div className="mt-4 p-2 border rounded-lg">
          <h3 className="font-bold">Generated Description:</h3>
          <p>{description}</p>
        </div>
      )}

      {flyerUrl && (
        <div className="mt-4 p-2 border rounded-lg">
          <h3 className="font-bold">Generated Flyer:</h3>
          <img src={flyerUrl} alt="Event Flyer" className="w-full mt-2" />
        </div>
      )}
    </div>
  );
};

export default NotifyEvent;
