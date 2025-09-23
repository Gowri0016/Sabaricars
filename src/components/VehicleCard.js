import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGasPump, FaCar, FaCogs, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  // Format price with commas (handles string/number)
  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    let num = typeof price === 'number' ? price : Number(price.toString().replace(/[^\d]/g, ''));
    if (isNaN(num)) return price;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="vehicle-card" onClick={handleClick}>
      <div className="vehicle-card__image-wrapper">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img 
            src={vehicle.images[0]} 
            alt={vehicle.name || 'Vehicle image'} 
            className="vehicle-card__image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent) {
                parent.innerHTML = (
                  '<div class="vehicle-card__placeholder">' +
                  '<div class="placeholder-icon"><i class="fas fa-car"></i></div>' +
                  '</div>'
                );
              }
            }}
          />
        ) : (
          <div className="vehicle-card__placeholder">
            <div className="placeholder-icon">
              <FaCar />
            </div>
          </div>
        )}
      </div>
      
      <div className="vehicle-card__content">
        <div className="vehicle-card__header">
          <div className="vehicle-card__title-row">
            <h3 className="vehicle-card__name">
              {vehicle.make || ''} {vehicle.model || vehicle.name || 'Unnamed Vehicle'}
            </h3>
            {vehicle.year && (
              <span className="vehicle-card__year">{vehicle.year}</span>
            )}
          </div>
          <div className="vehicle-card__price-section">
            <span className="vehicle-card__price-label">Starting from</span>
            <span className="vehicle-card__price">{formatPrice(vehicle.price)}</span>
          </div>
        </div>
        
        <div className="vehicle-card__footer">
          <button className="view-details-btn" onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}>
            View Details <FaArrowRight className="btn-icon" />
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default VehicleCard;
