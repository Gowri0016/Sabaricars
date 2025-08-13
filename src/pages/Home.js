import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VehicleList from '../components/VehicleList';
import '../components/VehicleList.css';
import { db } from '../firebase';
import { collectionGroup, getDocs } from 'firebase/firestore';
import './Page.css';

function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        if (location.state?.fromSearch) {
          // Load search results from localStorage
          const searchResults = JSON.parse(localStorage.getItem('searchResults') || '[]');
          const term = localStorage.getItem('searchTerm');
          setVehicles(searchResults);
          setSearchTerm(term);
        } else {
          // Load all vehicles
          const querySnapshot = await getDocs(collectionGroup(db, 'vehicles'));
          const items = [];
          querySnapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
          });
          setVehicles(items);
          setSearchTerm('');
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [location.state?.fromSearch]);

  return (
    <div className="page-container">
      {searchTerm ? (
        <div className="search-results-header">
          <h2>Search Results for "{searchTerm}"</h2>
          <p>{vehicles.length} vehicles found</p>
        </div>
      ) : (
        <h2>Available Vehicles</h2>
      )}
      
      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : vehicles.length > 0 ? (
        <VehicleList vehicles={vehicles} />
      ) : (
        <div className="no-results">
          <p>No vehicles found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
          {searchTerm && (
            <p>Try searching with different keywords or browse our available vehicles.</p>
          )}
        </div>
      )}

      <div className="cta-section">
        <h3>Can't find what you're looking for?</h3>
        <button className="cta-button">Contact Our Specialists</button>
      </div>
    </div>
  );
}

export default Home;