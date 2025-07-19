import React from 'react';
import { FiPhone, FiMessageSquare } from 'react-icons/fi';
import './Footer.css';

const Footer = () => (
  <footer className="main-footer">
    <div className="footer-actions">
      <a
        href="tel:+919876543210"
        className="footer-btn call"
        title="Call Sabari Cars"
      >
        <FiPhone className="footer-icon" /> Call
      </a>
      <a
        href="https://wa.me/919876543210?text=I'm%20interested%20in%20your%20cars"
        className="footer-btn whatsapp"
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp Sabari Cars"
      >
        <FiMessageSquare className="footer-icon" /> WhatsApp
      </a>
    </div>
    <div className="footer-info">
      <span>© {new Date().getFullYear()} Sabari Cars. All rights reserved.</span>
      <span className="crafted">Crafted by Poeage Technology Pvt Ltd</span>
    </div>
  </footer>
);

export default Footer;
