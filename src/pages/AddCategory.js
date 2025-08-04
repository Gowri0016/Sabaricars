import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';


function AddCategory() {
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
      <h2>Add Category</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} required />
        {/* <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} /> */}
        <button type="submit" disabled={loading}>Add Category</button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default AddCategory;
