import React from 'react';
import CarList from './CarList';
import cars from './carsData';
import './Page.css';

function Home() {
  return (
    <div className="page-container">
     
      
      <div className="filter-bar">
        <div className="filter-options">
          <select className="filter-select">
            <option>All Makes</option>
            <option>BMW</option>
            <option>Mercedes</option>
            <option>Audi</option>
          </select>
          <select className="filter-select">
            <option>All Models</option>
            <option>Sedan</option>
            <option>SUV</option>
            <option>Coupe</option>
          </select>
          <select className="filter-select">
            <option>Price Range</option>
            <option>Under $20,000</option>
            <option>$20,000 - $40,000</option>
            <option>Over $40,000</option>
          </select>
        </div>
        <button className="reset-filters">Reset Filters</button>
      </div>
      
      <CarList cars={cars} />
      
      <div className="cta-section">
        <h3>Can't find what you're looking for?</h3>
        <button className="cta-button">Contact Our Specialists</button>
      </div>
    </div>
  );
}

export default Home;