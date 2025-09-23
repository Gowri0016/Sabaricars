import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPhone, FiMessageSquare, FiShare2, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { db } from '../firebase';
import { collectionGroup, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiDroplet, FiSettings, FiUser, FiMapPin, FiShield, FiCheckCircle, FiAlertCircle, FiTrendingUp, FiDollarSign, FiVideo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './VehicleDetails.css';

const VehicleDetails = () => {
  // ...existing state
  const [successMsg, setSuccessMsg] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { user } = useAuth();
  const [wishlistLoading, setWishlistLoading] = useState(false);



  // Fetch vehicle details
  useEffect(() => {
    const fetchVehicle = async () => {
      const querySnapshot = await getDocs(collectionGroup(db, 'vehicles'));
      let found = null;
      querySnapshot.forEach(doc => {
        if (doc.id === id) {
          found = { id: doc.id, ...doc.data() };
        }
      });
      if (found) {
        setVehicle(found);
      }
      setLoading(false);
    };
    fetchVehicle();
  }, [id]);

  // Gallery navigation helpers
  const hasImages = vehicle?.images && vehicle.images.length > 0;
  const handleNextImage = () => {
    if (!hasImages) return;
    setActiveImage((prev) => (prev + 1) % vehicle.images.length);
  };
  const handlePrevImage = () => {
    if (!hasImages) return;
    setActiveImage((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  // Fetch wishlist state
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !vehicle) return;
      const wishRef = doc(db, `users/${user.uid}/wishlists/${vehicle.id}`);
      const wishSnap = await getDoc(wishRef);
      setIsFavorite(wishSnap.exists());
    };
    checkWishlist();
  }, [user, vehicle]);

  const formatPrice = (price) => {
    if (!price) return '-';
    let num = typeof price === 'number' ? price : Number(price.toString().replace(/[^\d]/g, ''));
    if (isNaN(num)) return price;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlistLoading(true);
    const wishRef = doc(db, `users/${user.uid}/wishlists/${vehicle.id}`);
    if (isFavorite) {
      await deleteDoc(wishRef);
      setIsFavorite(false);
      setSuccessMsg('Removed from wishlist');
      setTimeout(() => setSuccessMsg(''), 2000);
    } else {
      await setDoc(wishRef, {
        ...vehicle,
        wishlistedAt: new Date()
      });
      setIsFavorite(true);
      setSuccessMsg('Added to wishlist!');
      setTimeout(() => setSuccessMsg(''), 2000);
    }
    setWishlistLoading(false);
  };



  const handleShare = async () => {
    const shareData = {
      title: vehicle.name || `${vehicle.make} ${vehicle.model}`,
      text: `Check out this vehicle on Sabari Cars: ${vehicle.name || vehicle.make}`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy link
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        alert('Could not copy link.');
      }
    }
  };

  // Removed duplicate fetch useEffect (already handled above)


  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-text">Loading Vehicle Details</div>
      </div>
    </div>
  );

  if (!vehicle) {
    return (
      <div className="not-found-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="not-found-card"
        >
          <h2>Vehicle Not Found</h2>
          <p>The vehicle you're looking for doesn't exist or may have been removed.</p>
          <button 
            className="modern-btn primary-btn"
            onClick={() => navigate('/')}
          >
            Browse Available Vehicles
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="vehicle-details-container">
      {successMsg && (
        <div className="wishlist-success-msg">{successMsg}</div>
      )}
      {/* Desktop grid: left = gallery, right = info. Mobile: stacked. */}
      <div className="vehicle-details-gallery-col">
        <div className="vehicle-top-actions">
          <button 
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <FiArrowLeft className="icon" />
          </button>
          <button 
            className="icon-btn share-btn"
            onClick={handleShare}
            aria-label="Share"
          >
            <FiShare2 className="icon" />
          </button>
          <button 
            className={`icon-btn wishlist-btn${isFavorite ? ' active' : ''}`}
            onClick={handleToggleFavorite}
            aria-label="Add to Wishlist"
            disabled={wishlistLoading}
          >
            <FiHeart className="icon" />
          </button>
        </div>
        {/* Gallery Section with Thumbnails */}
        <div className="gallery-section">
          <div className="main-image-container">
            {vehicle.images && vehicle.images.length > 0 ? (
              <img
                src={vehicle.images[activeImage]}
                alt={`${vehicle.name || vehicle.make} ${activeImage + 1}`}
                className="main-image"
                loading="eager"
              />
            ) : (
              <div className="image-placeholder">
                <FiAlertCircle size={48} color="#b0b0b0" />
                <span>No Images Available</span>
              </div>
            )}
          </div>
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="thumbnail-container">
              {vehicle.images.map((img, idx) => (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={idx}
                  className={`thumbnail ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="vehicle-details-info-col">
        {/* Vehicle Info Section - Full Width */}
        <div className="vehicle-info-section">
          <div className="vehicle-title-block">
            <h1 className="vehicle-title">
              {vehicle.name || `${vehicle.make} ${vehicle.model}`}
              {vehicle.featured && <span className="featured-badge">Featured</span>}
            </h1>
            <div className="vehicle-subtitle">
              <span className="variant"><FiSettings /> {vehicle.variant}</span>
              <span className="detail"><FiCalendar /> {vehicle.year}</span>
              <span className="detail"><FiDroplet /> {vehicle.fuelType}</span>
              <span className="detail"><FiTrendingUp /> {vehicle.transmission}</span>
            </div>
          </div>

          {/* Price Tag */}
          <div className="price-tag">
            <div className="price-amount">{formatPrice(vehicle.price)}</div>
            <div className="price-label">On-Road Price</div>
          </div>

          {/* Key Specifications */}
          <div className="specs-section">
            <h2 className="section-title">Key Specifications</h2>
            <div className="specs-grid">
              <div className="spec-card">
                <div className="spec-icon"><FiTrendingUp /></div>
                <div className="spec-content">
                  <div className="spec-label">Odometer</div>
                  <div className="spec-value">{vehicle.odometer} km</div>
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-icon"><FiUser /></div>
                <div className="spec-content">
                  <div className="spec-label">Owners</div>
                  <div className="spec-value">{vehicle.owners}</div>
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-icon"><FiMapPin /></div>
                <div className="spec-content">
                  <div className="spec-label">Registration</div>
                  <div className="spec-value">{vehicle.registration}</div>
                </div>
              </div>
              <div className="spec-card">
                <div className="spec-icon"><FiShield /></div>
                <div className="spec-content">
                  <div className="spec-label">Insurance</div>
                  <div className="spec-value">{vehicle.insuranceValidity}</div>
                </div>
              </div>
              {vehicle.fitnessFC && (
                <div className="spec-card">
                  <div className="spec-icon"><FiCheckCircle /></div>
                  <div className="spec-content">
                    <div className="spec-label">Fitness / FC</div>
                    <div className="spec-value">{vehicle.fitnessFC}</div>
                  </div>
                </div>
              )}
              {vehicle.tyrePoint && (
                <div className="spec-card">
                  <div className="spec-icon"><FiCheckCircle /></div>
                  <div className="spec-content">
                    <div className="spec-label">Tyre Point</div>
                    <div className="spec-value">{vehicle.tyrePoint}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Condition Report */}
          {vehicle.inspection && (
            <div className="condition-section">
              <h2 className="section-title">
                <FiCheckCircle className="title-icon" />
                Vehicle Condition Report
              </h2>
              <div className="condition-grid">
                {Object.entries(vehicle.inspection).map(([key, value]) => (
                  <div key={key} className="condition-item">
                    <div className="condition-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className={`condition-value ${value.toLowerCase()}`}>
                      <div className={`status-dot ${value.toLowerCase()}`}></div>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refurbishment Details */}
          {vehicle.refurbishment && (
            <div className="refurb-section">
              <h2 className="section-title">
                <FiTrendingUp className="title-icon" />
                Refurbishment Details
              </h2>
              <div className="refurb-list">
                {Object.entries(vehicle.refurbishment).map(([key, value]) => (
                  <div key={key} className="refurb-item">
                    <div className="refurb-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="refurb-value">
                      {Array.isArray(value) ? (
                        <ul className="refurb-features">
                          {value.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finance Options */}
          {vehicle.financial && (
            <div className="finance-section">
              <h2 className="section-title">
                <FiDollarSign className="title-icon" />
                Finance Options
              </h2>
              <div className="finance-cards">
                {Object.entries(vehicle.financial).map(([key, value]) => (
                  <div key={key} className="finance-card">
                    <div className="finance-label">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="finance-value">
                      {typeof value === 'boolean' ? (
                        <span className={`availability ${value ? 'available' : 'unavailable'}`}>
                          {value ? '✓ Available' : '✗ Not Available'}
                        </span>
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Walkthrough */}
          {vehicle.visuals?.video && (
            <div className="video-section">
              <h2 className="section-title">
                <FiVideo className="title-icon" />
                Video Walkthrough
              </h2>
              <div className="video-wrapper">
                <iframe
                  src={vehicle.visuals.video}
                  title="Vehicle Video Walkthrough"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Sticky Contact Actions - Positioned above bottom nav */}
      <div className="sticky-contact-actions">
        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="tel:+919025959996"
          className="contact-btn call-btn"
        >
          <div className="btn-icon-circle">
            <FiPhone className="icon" />
          </div>
          <span>Call Seller</span>
        </motion.a>
        
        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href={`https://wa.me/919025959996?text=${encodeURIComponent(`I'm interested in your listing for the ${vehicle.name || vehicle.make}`)}`}
          className="contact-btn whatsapp-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="btn-icon-circle">
            <FiMessageSquare className="icon" />
          </div>
          <span>Chat on WhatsApp</span>
        </motion.a>
      </div>
    </div>
  );
};

export default VehicleDetails; 