import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { addAdmin, checkIfAnyAdminExists, isAuthorizedEmail } from '../utils/adminUtils';
import './RegisterAdmin.css';

function FirstTimeAdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canSetupAdmin, setCanSetupAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const hasExistingAdmin = await checkIfAnyAdminExists();
      if (hasExistingAdmin) {
        navigate('/admin-login');
      } else {
        setCanSetupAdmin(true);
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!isAuthorizedEmail(email)) {
      setError('This email is not authorized to be an admin');
      setIsLoading(false);
      return;
    }
    
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await addAdmin(email);
      
      setSuccess('Admin account created! Please verify your email before logging in.');
      setEmail('');
      setPassword('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/admin-login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="register-admin-container">
        <h2>Checking system status...</h2>
      </div>
    );
  }

  if (!canSetupAdmin) {
    return (
      <div className="register-admin-container">
        <h2>Access Denied</h2>
        <p>An admin account already exists. Please login instead.</p>
        <button onClick={() => navigate('/admin-login')} className="back-button">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="register-admin-container">
      <h2>Create First Admin Account</h2>
      <p className="setup-info">
        Welcome to the initial setup. As no admin account exists yet, you can create the first admin account here.
      </p>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Admin Account'}
        </button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default FirstTimeAdminSetup;