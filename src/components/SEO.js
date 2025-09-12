import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ 
  title = 'Sabari Cars | Premium Car Rentals & Refurbished Cars',
  description = 'Rent premium cars or buy quality refurbished vehicles at Sabari Cars. Best deals on car rentals and certified pre-owned cars.',
  keywords = 'car rental, rent a car, refurbished cars, used cars, luxury car rental, self drive cars, car hire',
  canonical = '',
  ogType = 'website',
  ogImage = '/sabari-cars-og.jpg',
  twitterCard = 'summary_large_image',
  noIndex = false
}) => {
  const siteUrl = 'https://sabaricars.com';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Sabari Cars" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  canonical: PropTypes.string,
  ogType: PropTypes.string,
  ogImage: PropTypes.string,
  twitterCard: PropTypes.string,
  noIndex: PropTypes.bool
};

export default SEO;
