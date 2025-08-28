
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
        <div className="admin-card-group">
          <Link to="/admin/add-vehicle" className="admin-card">
            <div className="card-icon">🚗</div>
            <h3>Add Vehicle</h3>
            <p>Add new vehicles to your inventory</p>
          </Link>
          
          <Link to="/admin/manage-vehicles" className="admin-card">
            <div className="card-icon">📋</div>
            <h3>Manage Vehicles</h3>
            <p>View and edit all vehicles</p>
          </Link>
        </div>

        <div className="admin-card-group">
          <Link to="/admin/add-category" className="admin-card">
            <div className="card-icon">📑</div>
            <h3>Add Category</h3>
            <p>Create new vehicle categories</p>
          </Link>
          
          <Link to="/admin/manage-categories" className="admin-card">
            <div className="card-icon">🗂️</div>
            <h3>Manage Categories</h3>
            <p>View and edit all categories</p>
          </Link>
        </div>

        <Link to="/admin/statistics" className="admin-card">
          <div className="card-icon">📊</div>
          <h3>Statistics</h3>
          <p>View inventory statistics</p>
        </Link>

        <Link to="/admin/settings" className="admin-card">
          <div className="card-icon">⚙️</div>
          <h3>Settings</h3>
          <p>Manage admin settings</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminPanel;
