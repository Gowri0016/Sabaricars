import React from 'react';

const Statistics = () => {
  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Statistics</h2>
        <p>View and analyze your inventory statistics</p>
      </div>
      
      <div className="admin-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Vehicles</h3>
            <div className="stat-value">0</div>
            <p className="stat-description">Currently in inventory</p>
          </div>
          
          <div className="stat-card">
            <h3>Categories</h3>
            <div className="stat-value">0</div>
            <p className="stat-description">Active categories</p>
          </div>
          
          <div className="stat-card">
            <h3>Monthly Sales</h3>
            <div className="stat-value">₹0</div>
            <p className="stat-description">This month's revenue</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">0</div>
            <p className="stat-description">Registered users</p>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Monthly Overview</h3>
          <div className="chart-placeholder">
            <p>Sales chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
