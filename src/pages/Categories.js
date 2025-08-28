import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import VehicleList from '../components/VehicleList';
import './Categories.css';

// Custom hook to fetch categories
const useCategories = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { data, loading, error };
};

// Custom hook to fetch vehicles by category
const useVehiclesByCategory = (categoryName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    if (!categoryName) return;
    setLoading(true);
    setError(null);
    try {
      const vehiclesCollectionRef = collection(db, 'vehicleDetails', categoryName, 'vehicles');
      const querySnapshot = await getDocs(vehiclesCollectionRef);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(items);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to load vehicles for this category.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return { data, loading, error, fetchVehicles };
};

function Categories() {
  const { data: categories, loading: loadingCategories, error: categoriesError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { data: vehicles, loading: loadingVehicles, error: vehiclesError } = useVehiclesByCategory(selectedCategory?.name);

  // Set the first category as selected when categories load
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find(cat => cat.id === categoryId);
    setSelectedCategory(category);
  };

  const getStatusMessage = (loading, error, data) => {
    if (loading) return 'Loading...';
    if (error) return error;
    if (data && data.length === 0) return 'No content available.';
    return null;
  };

  const vehicleMessage = getStatusMessage(loadingVehicles, vehiclesError, vehicles);

  return (
    <div className="categories-container modern-categories container">
      <h2 className="categories-title">Browse by Category</h2>
      
      <div className="categories-content">
        <div className="category-select-container">
          <label htmlFor="category-select" className="category-select-label">Select a Category:</label>
          {loadingCategories ? (
            <div className="status-message">Loading categories...</div>
          ) : categoriesError ? (
            <div className="status-message">{categoriesError}</div>
          ) : (
            <select
              id="category-select"
              className="category-dropdown"
              value={selectedCategory?.id || ''}
              onChange={handleCategoryChange}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedCategory && (
          <div className="category-vehicles-section">
            <h3 className="category-vehicles-title">{selectedCategory.name} Vehicles</h3>
            {vehicleMessage ? (
              <div className="status-message">{vehicleMessage}</div>
            ) : (
              <VehicleList vehicles={vehicles} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categories;