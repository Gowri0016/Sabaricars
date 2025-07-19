
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CarList.css';

function CarList({ cars }) {
  const navigate = useNavigate();
  return (
    <div className="car-list">
      {cars.map(car => (
        <div className="car-card" key={car.id} onClick={() => navigate(`/car/${car.id}`)} style={{cursor:'pointer'}}>
          <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="car-image" />
          <div className="car-details">
            <h2>{car.make} {car.model} <span>{car.variant} ({car.year})</span></h2>
            <p className="car-price">{car.price}</p>
            <p>{car.description}</p>
            <div className="car-tags">
              <span>{car.fuelType}</span> | <span>{car.transmission}</span> | <span>{car.owners}</span>
            </div>
            <div className="car-actions">
              <a
                href="tel:+919876543210"
                className="call-btn"
                onClick={e => e.stopPropagation()}
                title="Call Seller"
              >📞 Call</a>
              <a
                href={`https://wa.me/919876543210?text=I'm%20interested%20in%20your%20car%20listing%20for%20the%20${car.make}%20${car.model}`}
                className="whatsapp-btn"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                title="WhatsApp Seller"
              >🟢 WhatsApp</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CarList;
