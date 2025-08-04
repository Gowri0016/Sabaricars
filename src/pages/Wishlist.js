import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import './Page.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import VehicleCard from '../components/VehicleCard';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      const wishRef = collection(db, `users/${user.uid}/wishlists`);
      const snap = await getDocs(wishRef);
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishlist(items);
      setLoading(false);
    };
    fetchWishlist();
  }, [user]);

  return (
    <div className="page-container wishlist-page">
      <h2><FiHeart /> My Wishlist</h2>
      {loading ? (
        <div>Loading...</div>
      ) : wishlist.length === 0 ? (
        <div className="empty-msg">Your wishlist is empty!</div>
      ) : (
        <div className="wishlist-list vehicle-list">
          {wishlist.map(item => (
            <VehicleCard key={item.id} vehicle={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
