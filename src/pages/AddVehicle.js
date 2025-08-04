import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AddVehicle() {
  const [form, setForm] = useState({
    name: '', category: '', price: '', year: '', variant: '', fuelType: '', transmission: '', owners: '', registration: '', insuranceValidity: '', description: '',
  });
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchCategories();
  }, []);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      let imageUrls = [];
      for (let img of images) {
        const imgRef = ref(storage, `vehicleImages/${form.name}_${Date.now()}_${img.name}`);
        await uploadBytes(imgRef, img);
        const url = await getDownloadURL(imgRef);
        imageUrls.push(url);
      }
      // Store vehicle in subcollection named after category inside vehicleDetails
      await addDoc(collection(db, 'vehicleDetails', form.category, 'vehicles'), { ...form, images: imageUrls });
      setSuccess('Vehicle added successfully!');
      setForm({ name: '', category: '', price: '', year: '', variant: '', fuelType: '', transmission: '', owners: '', registration: '', insuranceValidity: '', description: '' });
      setImages([]);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-vehicle-container">
      <h2>Add Vehicle</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Vehicle Name" value={form.name} onChange={handleChange} required />
        <select name="category" value={form.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <input type="text" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input type="text" name="year" placeholder="Year" value={form.year} onChange={handleChange} />
        <input type="text" name="variant" placeholder="Variant" value={form.variant} onChange={handleChange} />
        <input type="text" name="fuelType" placeholder="Fuel Type" value={form.fuelType} onChange={handleChange} />
        <input type="text" name="transmission" placeholder="Transmission" value={form.transmission} onChange={handleChange} />
        <input type="text" name="owners" placeholder="Owners" value={form.owners} onChange={handleChange} />
        <input type="text" name="registration" placeholder="Registration" value={form.registration} onChange={handleChange} />
        <input type="text" name="insuranceValidity" placeholder="Insurance Validity" value={form.insuranceValidity} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input type="file" multiple accept="image/*" onChange={handleImageChange} />
        <button type="submit" disabled={loading}>Add Vehicle</button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default AddVehicle;
