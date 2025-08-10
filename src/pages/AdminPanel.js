import React from 'react';
import { Link } from 'react-router-dom';
import './Admin.css';

function AdminPanel() {
  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p>Manage your vehicle inventory and categories</p>
      </div>
      
      <div className="admin-grid">
        <Link to="/admin/add-vehicle" className="admin-card">
          <div className="card-icon">🚗</div>
          <h3>Add Vehicle</h3>
          <p>Add new vehicles to your inventory</p>
        </Link>

        <Link to="/admin/add-category" className="admin-card">
          <div className="card-icon">📑</div>
          <h3>Add Category</h3>
          <p>Create new vehicle categories</p>
        </Link>

        <div className="admin-card">
          <div className="card-icon">📊</div>
          <h3>Statistics</h3>
          <p>View inventory statistics</p>
        </div>

        <div className="admin-card">
          <div className="card-icon">⚙️</div>
          <h3>Settings</h3>
          <p>Manage admin settings</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
