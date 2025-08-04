import React from 'react';
import { Link } from 'react-router-dom';

function AdminPanel() {
  return (
    <div className="admin-panel-container">
      <h2>Admin Panel</h2>
      <ul>
        <li><Link to="/admin/add-category">Add Category</Link></li>
        <li><Link to="/admin/add-vehicle">Add Vehicle</Link></li>
      </ul>
    </div>
  );
}

export default AdminPanel;
