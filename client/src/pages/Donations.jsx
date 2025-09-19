import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Donations() {
  const [form, setForm] = useState({ name: '', email: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const donate = async () => {
    setError('');
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    try {
      setLoading(true);
      // 1️⃣ Create donation entry in your backend DB
      await axios.post('http://localhost:8000/api/donations', {
        name: form.name,
        email: form.email,
        amount: Number(form.amount),
        currency: 'INR',
      });

      // 2️⃣ Call Stripe server to start checkout session
      const response = await axios.post('http://localhost:8000/donations', {
        amount: Number(form.amount),
        name: form.name,
        email: form.email
      });

      if (response.data?.url) {
        // Save receipt data in sessionStorage for success page
        sessionStorage.setItem('donation_receipt', JSON.stringify({
          name: form.name,
          email: form.email,
          amount: form.amount,
          date: new Date().toLocaleString()
        }));
        window.location.href = response.data.url; // redirect to Stripe checkout
      } else {
        setError('Failed to initiate payment.');
        setLoading(false);
      }
    } catch (err) {
      setError('Payment error: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
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
          {loading ? 'Redirecting to Stripe...' : 'Donate'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 mt-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          Back to Home
        </button>

        {error && (
          <div className="text-red-600 text-sm mt-4 text-center">{error}</div>
        )}
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 mt-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
