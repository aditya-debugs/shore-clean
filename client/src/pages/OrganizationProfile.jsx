import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../utils/api";

const OrganizationProfile = () => {
  const { currentUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "NGO",
    registrationNumber: "",
    email: currentUser?.email || "",
    contactNumber: "",
    address: "",
    operatingRegions: "",
    website: "",
    socialLinks: { facebook: "", instagram: "", linkedin: "", twitter: "" },
    logoUrl: "",
    coverImageUrl: "",
    tagline: "",
    pan: "",
    certificate80G: "",
    verificationStatus: "Pending"
  });

  useEffect(() => {
    if (currentUser?.organizationId) {
      api.get(`/organizations/${currentUser.organizationId}`)
        .then(res => {
          setOrg(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Organization profile not found.");
          setLoading(false);
        });
    } else {
      setShowForm(true);
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (showForm) {
    // Organization profile input form
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 pt-24 pb-12">
          <div className="w-full flex justify-center">
            <form
              className="bg-white rounded-2xl shadow-2xl p-10 max-w-2xl w-full border border-gray-100 animate-fade-in"
              onSubmit={async (e) => {
                e.preventDefault();
                const payload = { ...form };
                payload.operatingRegions = form.operatingRegions.split(",").map(r => r.trim()).filter(Boolean);
                try {
                  const res = await api.post("/organizations", payload);
                  setOrg(res.data);
                  setShowForm(false);
                } catch (err) {
                  setError("Failed to create organization profile.");
                }
              }}
            >
              <h2 className="text-3xl font-bold text-cyan-700 mb-8 text-center">Create Organization Profile</h2>
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Organization Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400">
                      <option value="NGO">NGO</option>
                      <option value="College Club">College Club</option>
                      <option value="Corporate CSR">Corporate CSR</option>
                      <option value="Government Body">Government Body</option>
                      <option value="Independent Community">Independent Community</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number / License ID</label>
                    <input type="text" value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Registration Number / License ID" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Email" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input type="text" value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Contact Number" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters / Office Address</label>
                    <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Address" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operating Cities / Regions <span className="text-xs text-gray-400">(comma separated)</span></label>
                  <input type="text" value={form.operatingRegions} onChange={e => setForm(f => ({ ...f, operatingRegions: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Mumbai, Pune, Goa" />
                </div>
                {/* Online Presence */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input type="text" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline / Motto</label>
                    <input type="text" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Cleaning Shores, Saving Oceans" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <input type="text" value={form.socialLinks.facebook} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, facebook: e.target.value } }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Facebook URL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                    <input type="text" value={form.socialLinks.instagram} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: e.target.value } }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Instagram URL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <input type="text" value={form.socialLinks.linkedin} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, linkedin: e.target.value } }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="LinkedIn URL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input type="text" value={form.socialLinks.twitter} onChange={e => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, twitter: e.target.value } }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Twitter URL" />
                  </div>
                </div>
                {/* Branding */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input type="text" value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Logo URL" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                    <input type="text" value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Cover Image URL" />
                  </div>
                </div>
                {/* Legal & Verification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN / Tax ID</label>
                    <input type="text" value={form.pan} onChange={e => setForm(f => ({ ...f, pan: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="PAN / Tax ID" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">80G Certificate URL</label>
                    <input type="text" value={form.certificate80G} onChange={e => setForm(f => ({ ...f, certificate80G: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Certificate URL" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full mt-8 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold cursor-pointer hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg">Create Profile</button>
              {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
            </form>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-8 flex items-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mr-6">
                {org.logoUrl ? (
                  <img src={org.logoUrl} alt="Logo" className="w-20 h-20 object-cover rounded-full" />
                ) : (
                  <span className="text-cyan-600 font-bold text-3xl">{org.name[0]}</span>
                )}
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">{org.name}</h1>
                <p className="text-cyan-100 mt-1">{org.type}</p>
                <p className="text-cyan-100 mt-1">{org.tagline}</p>
              </div>
            </div>
            {org.coverImageUrl && (
              <img src={org.coverImageUrl} alt="Cover" className="w-full h-48 object-cover" />
            )}
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Organization Details</h2>
            <div className="space-y-3">
              <div><strong>Registration Number:</strong> {org.registrationNumber || "-"}</div>
              <div><strong>Email:</strong> {org.email}</div>
              <div><strong>Contact Number:</strong> {org.contactNumber || "-"}</div>
              <div><strong>Address:</strong> {org.address || "-"}</div>
              <div><strong>Operating Regions:</strong> {org.operatingRegions?.join(", ") || "-"}</div>
              <div><strong>Website:</strong> {org.website ? <a href={org.website} className="text-blue-600 underline">{org.website}</a> : "-"}</div>
              <div><strong>Social Links:</strong> {Object.entries(org.socialLinks || {}).map(([key, val]) => val ? <a key={key} href={val} className="text-blue-600 underline mr-2">{key}</a> : null)}</div>
              <div><strong>PAN / Tax ID:</strong> {org.pan || "-"}</div>
              <div><strong>80G Certificate:</strong> {org.certificate80G ? <a href={org.certificate80G} className="text-blue-600 underline">View</a> : "-"}</div>
              <div><strong>Verification Status:</strong> {org.verificationStatus}</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrganizationProfile;
