import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import VehicleList from '../components/VehicleList';
import TopSearch from '../components/TopSearch';
import '../components/VehicleList.css';
import { db } from '../firebase';
import { collectionGroup, getDocs } from 'firebase/firestore';
import './Page.css';

function Home() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Default SEO values for the home page
  const seoConfig = {
    title: 'Premium Car Rentals & Refurbished Cars | Sabari Cars',
    description: 'Find the best deals on car rentals and certified pre-owned cars at Sabari Cars. Flexible rental plans and quality refurbished vehicles available.',
    keywords: 'car rental, rent a car, refurbished cars, used cars, luxury car rental, self drive cars, car hire',
    canonical: '/',
    ogImage: '/sabari-cars-home.jpg'
  };

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

  // Handler used by TopSearch component
  const handleTopSearch = async (term) => {
    if (!term) {
      // if empty, reload all vehicles
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collectionGroup(db, 'vehicles'));
        const items = [];
        querySnapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        setVehicles(items);
        setSearchTerm('');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Always fetch latest vehicles from Firestore then filter client-side
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collectionGroup(db, 'vehicles'));
      const source = [];
      querySnapshot.forEach(doc => source.push({ id: doc.id, ...doc.data() }));
      const lower = term.toLowerCase();
      const filtered = source.filter(v => {
        return (
          (v.make && v.make.toLowerCase().includes(lower)) ||
          (v.model && v.model.toLowerCase().includes(lower)) ||
          (v.name && v.name.toLowerCase().includes(lower)) ||
          (v.year && String(v.year).includes(lower)) ||
          (v.description && v.description.toLowerCase().includes(lower))
        );
      });
      setVehicles(filtered);
      setSearchTerm(term);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setLoading(false);
    }
  };

  const focusSearch = location.state && location.state.focusSearch;

  const renderContent = () => {
    if (loading) {
      return <div className="loading-spinner">Loading...</div>;
    }

    if (vehicles.length === 0) {
      return (
        <div className="no-results">
          <p>No vehicles found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
          {searchTerm && (
            <p>Try searching with different keywords or browse our available vehicles.</p>
          )}
        </div>
      );
    }

    return <VehicleList vehicles={vehicles} loading={loading} />;
  };

  return (
    <div className="page-container">
      <SEO {...seoConfig} />
      <div className="container">
        <TopSearch onSearch={handleTopSearch} autoFocus={!!focusSearch} />
        {searchTerm ? (
          <div className="search-results-header">
            <h2>Search Results for "{searchTerm}"</h2>
            <p>{vehicles.length} vehicles found</p>
          </div>
        ) : (
          <h2>Available Vehicles</h2>
        )}
        {renderContent()}
      </div>
      <div className="cta-section">
        <h3>Can't find what you're looking for?</h3>
        <button className="btn btn-primary">Contact Our Specialists</button>
      </div>
    </div>
  );
}

export default Home;