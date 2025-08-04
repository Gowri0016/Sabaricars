import React from 'react';
import VehicleCard from './VehicleCard';
import './VehicleList.css';

const VehicleList = ({ vehicles }) => {
  if (!vehicles || vehicles.length === 0) {
    return <div className="empty-msg">No vehicles found.</div>;
  }
  return (
    <div className="vehicle-list">
      {vehicles.map(vehicle => (
        <VehicleCard vehicle={vehicle} key={vehicle.id} />
      ))}
    </div>
  );
};

export default VehicleList;
