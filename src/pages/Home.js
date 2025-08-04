import React from 'react';
import Categories from './Categories';
import VehicleList from '../components/VehicleList';
import '../components/VehicleList.css';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collectionGroup, getDocs } from 'firebase/firestore';
import './Page.css';

function Home({ searchResults }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchResults) {
      setLoading(true);
      const fetchVehicles = async () => {
        const querySnapshot = await getDocs(collectionGroup(db, 'vehicles'));
        const items = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setVehicles(items);
        setLoading(false);
      };
      fetchVehicles();
    }
  }, [searchResults]);

  const vehiclesToShow = searchResults || vehicles;

  return (
    <div className="page-container">
      <h2>Available Vehicles</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <VehicleList vehicles={vehiclesToShow} />
      )}
      <div className="cta-section">
        <h3>Can't find what you're looking for?</h3>
        <button className="cta-button">Contact Our Specialists</button>
      </div>
    </div>
  );
}

export default Home;