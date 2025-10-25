

import React, { useState, useEffect } from 'react';
import './SellVehicle.css';
import { storage, db } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function SellVehicle() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleWhatsApp = async () => {
    try {
      setUploading(true);

      // Upload images (if any) to Firebase Storage and collect URLs
      let imageUrls = [];
      if (images && images.length > 0) {
        const uploadPromises = images.map(async (file) => {
          const fileRef = storageRef(storage, `sell_vehicles/${Date.now()}_${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          return url;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      // Save details to Firestore (collection: 'sell')
      try {
        const record = {
          name,
          phone,
          vehicle,
          year,
          price,
          desc,
          images: imageUrls,
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'sell'), record);
      } catch (dbErr) {
        console.error('Failed to save record to Firestore:', dbErr);
      }

      // Build message including image URLs (each on new line)
      const parts = [
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Vehicle: ${vehicle}`,
        `Year: ${year}`,
        `Expected Price: ${price}`,
        `Description: ${desc}`,
      ];

      if (imageUrls.length > 0) {
        parts.push('Images:');
        imageUrls.forEach((u) => parts.push(u));
      }

      const message = encodeURIComponent(parts.join('\n'));

      // Using the specified WhatsApp number (9487749996)
      const whatsappUrl = `https://wa.me/919487749996?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } catch (err) {
      console.error('Failed to upload images or open WhatsApp:', err);
      // Still try to open chat with text-only info if upload failed
      const fallback = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nVehicle: ${vehicle}\nYear: ${year}\nExpected Price: ${price}\nDescription: ${desc}`);
      window.open(`https://wa.me/919487749996?text=${fallback}`, '_blank');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    // cleanup object URLs when previews change/unmount
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    // create preview URLs
    const urls = files.map((f) => URL.createObjectURL(f));
    // revoke previous previews
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(urls);
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
        <label className="image-upload-label">Add Images (optional):</label>
        <input type="file" accept="image/*" multiple onChange={handleImageChange} />
        <div className="image-previews">
          {previews.map((p, idx) => (
            <img key={idx} src={p} alt={`preview-${idx}`} className="preview-img" />
          ))}
        </div>
        <button type="submit">
          {uploading ? 'Uploading...' : 'Send via WhatsApp'}
        </button>
      </form>
    </div>
  );
}

export default SellVehicle;
