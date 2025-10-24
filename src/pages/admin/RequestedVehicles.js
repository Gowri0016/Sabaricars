import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import './RequestedVehicles.css';

const RequestedVehicles = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const requestsCollection = collection(db, 'request');
        const snapshot = await getDocs(requestsCollection);
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRequests(requestsData);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load vehicle requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="admin-panel-container">
        <div className="loading">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Requested Vehicles</h2>
        <p>View and manage vehicle requests from customers</p>
      </div>

      <div className="requests-grid">
        {requests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <h3>{request.name}</h3>
              <span className="request-date">
                {new Date(request.created).toLocaleDateString()}
              </span>
            </div>
            
            <div className="request-details">
              <div className="detail-row">
                <span className="label">Model:</span>
                <span className="value">{request.model}</span>
              </div>
              <div className="detail-row">
                <span className="label">Year:</span>
                <span className="value">{request.year}</span>
              </div>
              <div className="detail-row">
                <span className="label">Budget:</span>
                <span className="value">{request.budget}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{request.phone}</span>
              </div>
              {request.desc && (
                <div className="detail-row description">
                  <span className="label">Description:</span>
                  <span className="value">{request.desc}</span>
                </div>
              )}
            </div>
            
            <div className="request-actions">
              <button className="action-button call">
                <a href={`tel:${request.phone}`}>Call Customer</a>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestedVehicles;