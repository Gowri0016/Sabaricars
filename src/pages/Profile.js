import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Page.css';
import './Profile.css';

const Profile = () => {
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="page-container profile-page">
      <h2><FiUser /> My Profile</h2>
      {loading ? (
        <div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>
      ) : !user ? (
        <div className="profile-card profile-login">
          <div className="profile-avatar"><FiUser size={48} /></div>
          <h2>Welcome!</h2>
          <p>Please log in or sign up to view your profile.</p>
          <div style={{display:'flex',gap:'12px',justifyContent:'center',marginTop:'1rem'}}>
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/signup" className="signup-btn">Sign Up</Link>
          </div>
        </div>
      ) : (
        <div className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" style={{borderRadius:'50%',width:64,height:64}} />
              ) : (
                <FiUser size={48} />
              )}
            </div>
            <div className="profile-details">
              <div className="profile-name">{user.displayName || 'User'}</div>
              <div className="profile-email">{user.email}</div>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
         
        </div>
      )}
    </div>
  );
};

export default Profile;
