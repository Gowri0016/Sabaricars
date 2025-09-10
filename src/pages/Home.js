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
      console.error(err);
    } finally {
      setLoading(false);
    }
    return;
  }

  const focusSearch = location.state && location.state.focusSearch;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (vehicles.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No vehicles found{searchTerm ? ` for "${searchTerm}"` : ''}
          </h3>
          {searchTerm ? (
            <p className="text-gray-600">
              Try searching with different keywords or browse our available vehicles.
            </p>
          ) : (
            <p className="text-gray-600">
              Check back later for new vehicle listings.
            </p>
          )}
        </div>
      );
    }

    return <VehicleList vehicles={vehicles} loading={loading} />;
  };

  return (
  <div className="min-h-screen bg-gray-50">
  <SEO {...seoConfig} />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
  <div className="mb-4">
  <TopSearch onSearch={handleTopSearch} autoFocus={!!focusSearch} />
  </div>
  
  <div className="mb-4">
  {searchTerm ? (
  <div className="mb-4">
  <h2 className="text-2xl font-bold text-gray-900">Search Results for "{searchTerm}"</h2>
  <p className="text-gray-600 mt-1">{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} found</p>
  </div>
  ) : (
  <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Vehicles</h2>
  )}
  {renderContent()}
  </div>

  <div className="bg-white rounded-lg shadow-sm p-6 text-center mt-12 border border-gray-100">
  <h3 className="text-lg font-medium text-gray-900 mb-3">Can't find what you're looking for?</h3>
  <p className="text-gray-600 mb-4">Our specialists can help you find the perfect vehicle for your needs.</p>
  <button 
  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
  onClick={() => window.location.href = '/contact'}
  >
  Contact Our Specialists
  </button>
  </div>
  </div>
  </div>
  );
}

export default Home;