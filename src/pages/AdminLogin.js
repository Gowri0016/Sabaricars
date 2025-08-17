import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './Admin.css';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Only allow verified admin accounts (check custom claim or email)
      const user = userCredential.user;
      // Change the allowed admin email here
      if (user.emailVerified && user.email === 'www.7339596165@gmail.com') {
  navigate('/admin-panel');
      } else {
        setError('Access denied. Only verified admin accounts allowed.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">🚗</div>
          <h2>Admin Login</h2>
          <p>Enter your credentials to access the admin panel</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-group">
              <span className="input-icon">📧</span>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="login-button">
            Login to Dashboard
          </button>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
