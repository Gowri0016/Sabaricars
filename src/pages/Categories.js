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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        // If there are categories, automatically select the first one
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
          fetchVehiclesByCategory(cats[0].name);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchVehiclesByCategory = async (categoryName) => {
    setLoadingVehicles(true);
    try {
      // Access the subcollection 'vehicles' under the category in 'vehicleDetails'
      const vehiclesCollectionRef = collection(db, 'vehicleDetails', categoryName, 'vehicles');
      const querySnapshot = await getDocs(vehiclesCollectionRef);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(items);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]); // Reset vehicles on error
    }
    setLoadingVehicles(false);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    fetchVehiclesByCategory(cat.name);
  };

  return (
    <div className="categories-container modern-categories container">
      <h2 className="categories-title">Browse by Category</h2>
      
      {error ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      ) : (
        <div className="categories-content">
          <ul className="categories-list categories-list-vertical">
            {loadingCategories ? (
              <div className="loading-spinner">Loading categories...</div>
            ) : categories.length === 0 ? (
              <div className="no-content-message">No categories available</div>
            ) : (
              categories.map(cat => (
                <li
                  key={cat.id || cat.key}
                  className={`category-list-item${selectedCategory && selectedCategory.id === cat.id ? ' selected' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedCategory && selectedCategory.id === cat.id}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryClick(cat); } }}
                >
                  <span>{cat.name}</span>
                </li>
              ))
            )}
          </ul>

          {selectedCategory && (
            <div className="category-vehicles-section">
              <h3 className="category-vehicles-title">{selectedCategory.name} Vehicles</h3>
              {loadingVehicles ? (
                <div className="loading-spinner">Loading vehicles...</div>
              ) : vehicles.length === 0 ? (
                <div className="no-content-message">
                  No vehicles available in this category
                </div>
              ) : (
                <VehicleList vehicles={vehicles} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Categories;
