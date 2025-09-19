import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

export default function DonationSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      // Fetch receipt details from backend using session_id
      fetch(`http://localhost:8000/api/donations/stripe-receipt?session_id=${sessionId}`)
        .then(res => {
          if (!res.ok) {
            return res.json().then(err => {
              throw new Error(err.error || 'Failed to process payment');
            });
          }
          return res.json();
        })
        .then(data => {
          if (data.status === 'completed' || data.status === 'paid') {
            setReceipt(data);
            setLoading(false);
            setTimeout(() => setShowModal(false), 1500);
          } else {
            throw new Error('Payment is still processing. Please wait a moment and refresh the page.');
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch receipt. Please try refreshing the page.');
          setLoading(false);
        });
    } else {
      let localReceipt = location.state?.receipt;
      if (!localReceipt) {
        const stored = sessionStorage.getItem('donation_receipt');
        localReceipt = stored ? JSON.parse(stored) : null;
      }
      if (localReceipt) {
        setReceipt(localReceipt);
        setLoading(false);
        setTimeout(() => setShowModal(false), 1500);
      } else {
        setError('No receipt found.');
        setLoading(false);
      }
    }
  }, [location.search, location.state]);

  useEffect(() => {
    // Show modal for 1.5s, then hide
    const timer = setTimeout(() => setShowModal(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
  if (!receipt) return;
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(18);
  doc.text('Donation Receipt', 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${receipt.name || ''}`, 20, 40);
  doc.text(`Email: ${receipt.email || ''}`, 20, 50);
  doc.text(`Amount: ₹${receipt.amount || ''}`, 20, 60);
  doc.text(`Date: ${receipt.date || ''}`, 20, 70);
  doc.text('Thank you for your generous support!', 20, 90);
  doc.save('donation_receipt.pdf');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
      {loading ? (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      ) : error || !receipt ? (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-red-700 mb-6">Payment Failed</h2>
          <p className="text-lg text-gray-700 mb-4">{error || 'Unable to retrieve payment details.'}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            Go Home
          </button>
        </div>
      ) : (
        <>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-cyan-900 bg-opacity-60 z-50 transition-all duration-300">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-400 rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center animate-fade-in">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4 border-2 border-cyan-300">
                  <CheckCircle className="w-8 h-8 text-cyan-600" />
                </div>
                <h2 className="text-3xl font-bold text-cyan-700 mb-2">Payment Successful</h2>
                <p className="text-lg text-gray-700 mb-4">Thank you for your donation!</p>
                <div className="w-full flex justify-center">
                  <span className="inline-block w-24 h-1 rounded bg-gradient-to-r from-cyan-400 to-blue-400"></span>
                </div>
              </div>
            </div>
          )}
          {!showModal && (
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center animate-fade-in">
              <h2 className="text-2xl font-bold text-cyan-700 mb-6">Donation Receipt</h2>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-cyan-400 rounded-xl p-6 mb-6 text-left">
                <div className="mb-2 text-gray-700">Name: <span className="font-medium">{receipt.name}</span></div>
                <div className="mb-2 text-gray-700">Email: <span className="font-medium">{receipt.email}</span></div>
                <div className="mb-2 text-gray-700">Amount: <span className="font-medium">₹{receipt.amount}</span></div>
                <div className="mb-2 text-gray-700">Date: <span className="font-medium">{receipt.date}</span></div>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-600 hover:to-blue-600 transition-all mb-4"
              >
                <Printer className="w-5 h-5" /> Print Receipt (PDF)
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Back to Home
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
