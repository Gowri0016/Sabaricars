import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Admin.css';

function AdminPanel() {
  const location = useLocation();
  const isBaseAdmin = location.pathname === '/admin-panel';

  if (!isBaseAdmin) {
    // Render nested routes like /admin-panel/vehicles and /admin-panel/vehicles/edit/:category/:id
    return <Outlet />;
  }

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
          
          <Link to="/admin-panel/vehicles" className="admin-card">
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
          
          <Link to="/admin-panel/categories" className="admin-card">
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

        <Link to="/admin-panel/selling-vehicles" className="admin-card">
          <div className="card-icon">💸</div>
          <h3>Selling Vehicles</h3>
          <p>View vehicles submitted via Sell Vehicle form</p>
        </Link>

        <Link to="/admin/requested-vehicles" className="admin-card">
          <div className="card-icon">🔔</div>
          <h3>Requested Vehicles</h3>
          <p>View customer vehicle requests</p>
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
