import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import api from "../utils/api";

export default function Donations() {
  const [form, setForm] = useState({ name: "", email: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const donate = async () => {
    setError("");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError("Please enter a valid donation amount.");
      return;
    }

    try {
      setLoading(true);
      // Get the base URL from the api utility
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";

      // 1️⃣ Create donation entry in your backend DB
      await api.post("/donations", {
        name: form.name,
        email: form.email,
        amount: Number(form.amount),
        currency: "INR",
      });

      // 2️⃣ Call Stripe server to start checkout session
      const response = await axios.post(`${baseURL}/donations`, {
        amount: Number(form.amount),
        name: form.name,
        email: form.email,
      });

      if (response.data?.url) {
        // Save receipt data in sessionStorage for success page
        sessionStorage.setItem(
          "donation_receipt",
          JSON.stringify({
            name: form.name,
            email: form.email,
            amount: form.amount,
            date: new Date().toLocaleString(),
          })
        );
        window.location.href = response.data.url; // redirect to Stripe checkout
      } else {
        setError("Failed to initiate payment.");
        setLoading(false);
      }
    } catch (err) {
      setError("Payment error: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          {/* Back button */}
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Make a Donation
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-3 border rounded-lg focus:ring-2 focus:ring-cyan-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-3 border rounded-lg focus:ring-2 focus:ring-cyan-400"
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount (INR)"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-cyan-400"
          />

          <button
            onClick={donate}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            {loading ? "Redirecting to Stripe..." : "Donate"}
          </button>

          {error && (
            <div className="text-red-600 text-sm mt-4 text-center">{error}</div>
          )}
        </div>
      </div>
    </>
  );
}
