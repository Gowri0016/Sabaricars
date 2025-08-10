import React, { useState } from 'react';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import { collection, addDoc } from 'firebase/firestore';


function AddCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  // const [image, setImage] = useState(null); // Temporarily disabled
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Temporarily skip image upload
      await addDoc(collection(db, 'categories'), { name });
      setSuccess('Category added successfully!');
      setName('');
      // setImage(null);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="add-category-container">
      <div className="category-form-box">
        <div className="page-header">
          <button onClick={() => navigate('/admin')} className="back-button">
            <span className="back-arrow">←</span> Back
          </button>
          <div className="form-header">
            <h2>Add New Category</h2>
            <p>Create a new vehicle category</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          <div className="form-group">
            <label>Category Name</label>
            <div className="input-group">
              <span className="input-icon">🏷️</span>
              <input 
                type="text" 
                placeholder="Enter category name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Adding Category...' : 'Add Category'}
            </button>
          </div>

          {success && (
            <div className="success-message">
              <span className="success-icon">✅</span>
              {success}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AddCategory;
