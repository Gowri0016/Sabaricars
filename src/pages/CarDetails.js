import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiMessageSquare } from 'react-icons/fi';
import cars from './carsData';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const car = cars.find(c => c.id === parseInt(id));

  if (!car) {
    return (
      <div className="car-details__not-found">
        <h2>Car not found</h2>
        <button className="btn btn--primary" onClick={() => navigate('/')}>
          Browse Available Cars
        </button>
      </div>
    );
  }

  const formatPrice = (price) => price;

  return (
    <div className="car-details">
      <div className="car-details__header">
        <button className="btn btn--secondary" onClick={() => navigate(-1)}>
          <FiArrowLeft className="icon" /> Back to listings
        </button>
      </div>

      <div className="car-gallery">
        {car.images.map((img, idx) => (
          <div key={idx} className="car-gallery__item">
            <img 
              src={img} 
              alt={`${car.make} ${car.model} ${idx+1}`} 
              className="car-gallery__image"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="car-details__title-section">
        <div>
          <h1 className="car-title">{car.make} {car.model}</h1>
          <p className="car-subtitle">
            <span className="variant">{car.variant}</span> • {car.year} • {car.fuelType} • {car.transmission}
          </p>
        </div>
        <div className="car-actions">
          <a
            href="tel:+919876543210"
            className="btn btn--primary btn--icon"
          >
            <FiPhone className="icon" /> Call Seller
          </a>
          <a
            href={`https://wa.me/919876543210?text=I'm%20interested%20in%20your%20car%20listing%20for%20the%20${car.make}%20${car.model}`}
            className="btn btn--whatsapp btn--icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiMessageSquare className="icon" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="price-badge">
        {formatPrice(car.price)}
      </div>

      <div className="specs-grid">
        <div className="spec-card">
          <span className="spec-label">Odometer</span>
          <span className="spec-value">{car.odometer} km</span>
        </div>
        <div className="spec-card">
          <span className="spec-label">Owners</span>
          <span className="spec-value">{car.owners}</span>
        </div>
        <div className="spec-card">
          <span className="spec-label">Registration</span>
          <span className="spec-value">{car.registration}</span>
        </div>
        <div className="spec-card">
          <span className="spec-label">Insurance</span>
          <span className="spec-value">{car.insuranceValidity}</span>
        </div>
      </div>

      <section className="details-section">
        <h2 className="section-title">Vehicle Condition</h2>
        <div className="inspection-grid">
          {Object.entries(car.inspection).map(([key, value]) => (
            <div key={key} className="inspection-item">
              <span className="inspection-label">{key}</span>
              <span className="inspection-value">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="details-section">
        <h2 className="section-title">Refurbishment Details</h2>
        <div className="refurb-details">
          {Object.entries(car.refurbishment).map(([key, value]) => (
            <div key={key} className="refurb-item">
              <span className="refurb-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="refurb-value">
                {Array.isArray(value) ? value.join(', ') : value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {car.visuals.video && (
        <section className="details-section">
          <h2 className="section-title">Video Walkthrough</h2>
          <div className="video-container">
            <iframe 
              src={car.visuals.video} 
              title="Car Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      <section className="details-section">
        <h2 className="section-title">Purchase Options</h2>
        <div className="financial-grid">
          {Object.entries(car.financial).map(([key, value]) => (
            <div key={key} className="financial-item">
              <span className="financial-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
              <span className="financial-value">
                {typeof value === 'boolean' ? (value ? 'Available' : 'Not Available') : value}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CarDetails;