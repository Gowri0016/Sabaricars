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
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user.email !== 'sabaricarsanthiyur9996@gmail.com') {
        setError(`Access denied. Email ${user.email} is not authorized for admin access.`);
        await auth.signOut();
        return;
      }
      
      if (!user.emailVerified) {
        setError('Please verify your email before logging in. Check your inbox for the verification email.');
        await auth.signOut();
        return;
      }
      
      navigate('/admin-panel');
      
    } catch (err) {
      let errorMessage = 'An error occurred during login. Please try again.';
      
      switch(err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again or reset your password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
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
