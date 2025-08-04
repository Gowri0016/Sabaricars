import React from 'react';
import './VehicleCard.css';
import { useNavigate } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/vehicle/${vehicle.id}`);
  };

  return (
    <div className="vehicle-card" onClick={handleClick}>
      <div className="vehicle-card__image-wrapper">
        {vehicle.images && vehicle.images.length > 0 ? (
          <img src={vehicle.images[0]} alt={vehicle.name} className="vehicle-card__image" />
        ) : (
          <div className="vehicle-card__placeholder">No Image</div>
        )}
      </div>
      <div className="vehicle-card__info">
        <h3 className="vehicle-card__name">{vehicle.name}</h3>
        <div className="vehicle-card__details">
          <span className="vehicle-card__price">₹{vehicle.price}</span>
          <span className="vehicle-card__year">{vehicle.year}</span>
          <span className="vehicle-card__fuel">{vehicle.fuelType}</span>
        </div>
        <div className="vehicle-card__category">{vehicle.category}</div>
      </div>
    </div>
  );
};

export default VehicleCard;
