import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function AddVehicle() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', category: '', price: '', year: '', variant: '', fuelType: '', transmission: '', owners: '', registration: '', insuranceValidity: '', odometer: '', description: '',
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
        const imgRef = ref(storage, `vehicles/${form.category}/${form.name}_${Date.now()}_${img.name}`);
        await uploadBytes(imgRef, img);
        const url = await getDownloadURL(imgRef);
        imageUrls.push(url);
      }
      // Store vehicle in subcollection named after category inside vehicleDetails
      await addDoc(collection(db, 'vehicleDetails', form.category, 'vehicles'), { ...form, images: imageUrls });
      setSuccess('Vehicle added successfully!');
      setForm({ name: '', category: '', price: '', year: '', variant: '', fuelType: '', transmission: '', owners: '', registration: '', insuranceValidity: '', odometer: '', description: '' });
      setImages([]);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-vehicle-container">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-button">
          <span className="back-arrow">←</span> Back
        </button>
        <div className="form-header">
          <h2>Add New Vehicle</h2>
          <p>Enter vehicle details below</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Vehicle Name</label>
            <input type="text" name="name" placeholder="Enter vehicle name" value={form.name} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input type="text" name="price" placeholder="Enter price" value={form.price} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Manufacturing Year</label>
            <input type="text" name="year" placeholder="Enter year" value={form.year} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Variant</label>
            <input type="text" name="variant" placeholder="Enter variant" value={form.variant} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Fuel Type</label>
            <select name="fuelType" value={form.fuelType} onChange={handleChange}>
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          <div className="form-group">
            <label>Transmission</label>
            <select name="transmission" value={form.transmission} onChange={handleChange}>
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Previous Owners</label>
            <input type="number" name="owners" placeholder="Number of previous owners" value={form.owners} onChange={handleChange} min="0" />
          </div>

          <div className="form-group">
            <label>Registration Number</label>
            <input type="text" name="registration" placeholder="Enter registration number" value={form.registration} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Insurance Validity</label>
            <input type="date" name="insuranceValidity" value={form.insuranceValidity} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Odometer Reading (km)</label>
            <input type="number" name="odometer" placeholder="Enter odometer reading" value={form.odometer} onChange={handleChange} min="0" />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea name="description" placeholder="Enter vehicle description" value={form.description} onChange={handleChange} rows="4" />
        </div>

        <div className="form-group full-width">
          <label>Vehicle Images</label>
          <div className="file-input-container">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} id="vehicle-images" />
            <label htmlFor="vehicle-images" className="file-input-label">
              Choose Images
            </label>
            <span className="file-count">{images.length} images selected</span>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
          </button>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default AddVehicle;
