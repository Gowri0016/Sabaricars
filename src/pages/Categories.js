import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import VehicleList from '../components/VehicleList';
import './Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  const fetchVehiclesByCategory = async (categoryName) => {
    setLoadingVehicles(true);
    const q = query(collection(db, 'vehicleDetails'), where('category', '==', categoryName));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setVehicles(items);
    setLoadingVehicles(false);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    fetchVehiclesByCategory(cat.name);
  };

  return (
    <div className="categories-container modern-categories">
      <h2 className="categories-title">Browse by Category</h2>
      <ul className="categories-list categories-list-vertical">
        {loadingCategories ? (
          <div className="loading-spinner"></div>
        ) : (
          categories.map(cat => (
            <li
              key={cat.id || cat.key}
              className={`category-list-item${selectedCategory && selectedCategory.id === cat.id ? ' selected' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.name}
            </li>
          ))
        )}
      </ul>
      {selectedCategory && (
        <div className="category-vehicles-section">
          <h3 className="category-vehicles-title">{selectedCategory.name} Vehicles</h3>
          {loadingVehicles ? (
            <div className="loading-spinner"></div>
          ) : (
            <VehicleList vehicles={vehicles} />
          )}
        </div>
      )}
    </div>
  );
}

export default Categories;
