import React, { useState } from 'react';
import './RequestVehicle.css';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function RequestVehicle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [budget, setBudget] = useState("");
  const [desc, setDesc] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    try {
      await addDoc(collection(db, "request"), {
        name,
        phone,
        model,
        year,
        budget,
        desc,
        created: new Date().toISOString()
      });
      setSuccess("Your request has been submitted successfully!");
      setName(""); setPhone(""); setModel(""); setYear(""); setBudget(""); setDesc("");
    } catch (err) {
      setSuccess("Failed to submit request. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="request-vehicle-page">
      <h2>Request a Vehicle</h2>
      <p>
        Looking for a specific car? Fill in your requirements below and we'll help you find the perfect match. Your request will be securely stored and our team will contact you soon!
      </p>
      <form className="request-vehicle-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="text" placeholder="Preferred Vehicle Model" value={model} onChange={e => setModel(e.target.value)} required />
        <input type="text" placeholder="Year of Manufacture (optional)" value={year} onChange={e => setYear(e.target.value)} />
        <input type="text" placeholder="Budget" value={budget} onChange={e => setBudget(e.target.value)} required />
        <textarea placeholder="Additional Description" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Request"}</button>
      </form>
      {success && <p style={{color: success.includes('successfully') ? '#25D366' : '#b21f1f', textAlign: 'center', marginTop: '1rem'}}>{success}</p>}
    </div>
  );
}

export default RequestVehicle;
