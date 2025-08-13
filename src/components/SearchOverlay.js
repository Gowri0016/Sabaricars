import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './SearchOverlay.css';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      // Search across all categories
      const allVehicles = [];
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      
      // For each category, search in its vehicles subcollection
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryName = categoryDoc.data().name;
        const vehiclesRef = collection(db, 'vehicleDetails', categoryName, 'vehicles');
        const vehiclesSnapshot = await getDocs(vehiclesRef);
        
        vehiclesSnapshot.forEach(doc => {
          const vehicleData = doc.data();
          // Check if the vehicle matches the search term
          if (
            vehicleData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicleData.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicleData.variant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicleData.category?.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            allVehicles.push({ id: doc.id, ...vehicleData });
          }
        });
      }

      // Store the search results in localStorage
      localStorage.setItem('searchResults', JSON.stringify(allVehicles));
      localStorage.setItem('searchTerm', searchTerm);

      // Close the search overlay
      onClose();

      // Navigate to home with search results
      navigate('/', { state: { fromSearch: true } });

    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div 
        className={`search-overlay-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`search-overlay ${isOpen ? 'open' : ''}`}>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            autoFocus
          />
          <button 
            type="button" 
            className="search-close" 
            onClick={onClose}
            aria-label="Close search"
          >
            ✕
          </button>
          <button 
            type="submit" 
            className="search-submit"
            disabled={isSearching || !searchTerm.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
    </>
  );
};

export default SearchOverlay;
