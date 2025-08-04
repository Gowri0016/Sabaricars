import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiGrid, FiSearch, FiHeart, FiUser } from 'react-icons/fi';
import './Footer.css';

const Footer = () => (
  <footer className="main-footer">
    <nav className="bottom-nav">
      <Link to="/" className="nav-item" title="Home">
        <span className="nav-icon"><FiHome /></span>
        <span className="nav-label">Home</span>
      </Link>
      <Link to="/categories" className="nav-item" title="Categories">
        <span className="nav-icon"><FiGrid /></span>
        <span className="nav-label">Categories</span>
      </Link>
      <Link to="/search" className="nav-item" title="Search">
        <span className="nav-icon"><FiSearch /></span>
        <span className="nav-label">Search</span>
      </Link>
      <Link to="/wishlist" className="nav-item" title="Wishlist">
        <span className="nav-icon"><FiHeart /></span>
        <span className="nav-label">Wishlist</span>
      </Link>
      <Link to="/profile" className="nav-item" title="Profile">
        <span className="nav-icon"><FiUser /></span>
        <span className="nav-label">Profile</span>
      </Link>
    </nav>
  </footer>
);

export default Footer;
