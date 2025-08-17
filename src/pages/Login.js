import React, { useState } from 'react';
import { auth, db, executeRecaptcha } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
    const hasName = !!(data.name && String(data.name).trim());
    const hasPhone = !!(data.phone && String(data.phone).trim()) || !!user.phoneNumber;
    const isVerified = data.phoneVerified === true || !!user.phoneNumber;
    if (hasName && hasPhone && isVerified) {
      setSuccess('Login successful!');
      navigate('/');
    } else {
      navigate('/profile-complete');
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
      const u = result.user;
      // Persist basic profile fields
      await setDoc(doc(db, 'users', u.uid), {
        email: u.email || null,
        name: u.displayName || '',
        photoURL: u.photoURL || null,
        phone: u.phoneNumber || null,
        lastLoginAt: new Date().toISOString()
      }, { merge: true });
      await checkProfileAndNavigate(u);
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
        <label htmlFor="login-email" className="muted">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label htmlFor="login-password" className="muted">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login with Email</button>
      </form>
      <button className="google-btn modern-google" onClick={handleGoogleLogin} aria-label="Login with Google">Login with Google</button>
      <div className="auth-footer">
        <span>Don't have an account?</span>
        <a href="/signup" className="auth-link">Sign up!</a>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Login;
