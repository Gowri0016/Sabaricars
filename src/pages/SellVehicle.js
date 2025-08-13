

import React, { useState } from 'react';
import './SellVehicle.css';

function SellVehicle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  const handleWhatsApp = () => {
    const message = `Name: ${name}%0aPhone: ${phone}%0aVehicle: ${vehicle}%0aYear: ${year}%0aExpected Price: ${price}%0aDescription: ${desc}`;
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="sell-vehicle-page">
      <h2>Sell Your Vehicle</h2>
      <p>
        Want to sell your car quickly and easily? Fill in your vehicle details below and connect with us directly on WhatsApp. We'll help you get the best deal for your vehicle!
      </p>
      <form className="sell-vehicle-form" onSubmit={e => {e.preventDefault(); handleWhatsApp();}}>
        <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required />
        <input type="text" placeholder="Vehicle Model" value={vehicle} onChange={e => setVehicle(e.target.value)} required />
        <input type="text" placeholder="Year of Manufacture" value={year} onChange={e => setYear(e.target.value)} required />
        <input type="text" placeholder="Expected Price" value={price} onChange={e => setPrice(e.target.value)} required />
        <textarea placeholder="Additional Description" value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
        <button type="submit">
          Send via WhatsApp
        </button>
      </form>
    </div>
  );
}

export default SellVehicle;
