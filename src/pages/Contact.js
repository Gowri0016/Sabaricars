import React from 'react';
import './Contact.css';

function Contact() {
  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Have questions or want to book a test drive? Reach out to us!</p>
      <ul>
        <li>Email: <a href="mailto:info@sabaricars.com">info@sabaricars.com</a></li>
        <li>Phone: <a href="tel:+919025959996">+91 90259 59996</a></li>
        <li>Address: 123, Main Road, Chennai, India</li>
      </ul>
    </div>
  );
}

export default Contact;
