import React, { useState } from 'react';
import { auth, db, executeRecaptcha } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const checkProfileAndNavigate = async (user) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const data = userDoc.exists() ? userDoc.data() : {};
    if (!data.name || !data.phone) {
      navigate('/profile-complete');
    } else {
      setSuccess('Login successful!');
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    try {
      // Execute reCAPTCHA before Google login
      const token = await executeRecaptcha('GOOGLE_LOGIN');
      if (!token) {
        throw new Error('reCAPTCHA verification failed');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkProfileAndNavigate(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Execute reCAPTCHA before login
      const token = await executeRecaptcha('LOGIN');
      if (!token) {
        throw new Error('reCAPTCHA verification failed');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkProfileAndNavigate(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login with Email</button>
      </form>
      <button className="google-btn modern-google" onClick={handleGoogleLogin}>Login with Google</button>
      <div className="auth-footer">
        <span>Don't have an account?</span>
        <a href="/signup" className="auth-link">Sign up!</a>
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Login;
