import React, { useState } from 'react';

const Settings = () => {
  const [formData, setFormData] = useState({
    siteName: 'Sabari Cars',
    adminEmail: 'admin@sabaricars.com',
    itemsPerPage: '10',
    enableNotifications: true,
    maintenanceMode: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    alert('Settings saved successfully!');
  };

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Settings</h2>
        <p>Configure your application settings</p>
      </div>
      
      <div className="admin-content">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Site Name</label>
            <input
              type="text"
              name="siteName"
              value={formData.siteName}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Items Per Page</label>
            <select
              name="itemsPerPage"
              value={formData.itemsPerPage}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          
          <div className="form-group form-check">
            <input
              type="checkbox"
              name="enableNotifications"
              id="enableNotifications"
              checked={formData.enableNotifications}
              onChange={handleInputChange}
              className="form-check-input"
            />
            <label className="form-check-label" htmlFor="enableNotifications">
              Enable Email Notifications
            </label>
          </div>
          
          <div className="form-group form-check">
            <input
              type="checkbox"
              name="maintenanceMode"
              id="maintenanceMode"
              checked={formData.maintenanceMode}
              onChange={handleInputChange}
              className="form-check-input"
            />
            <label className="form-check-label" htmlFor="maintenanceMode">
              Maintenance Mode
            </label>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
            <button type="button" className="btn btn-outline-secondary">
              Reset to Default
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
