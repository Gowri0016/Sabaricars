import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    if (authInProgress) return; // Prevent multiple clicks
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    setAuthInProgress(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account' // Force account selection to prevent auto-login issues
      });
      
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      const nowIso = new Date().toISOString();
      const payload = { lastLoginAt: nowIso };
      if (u.email) payload.email = u.email;
      if (u.displayName) payload.name = u.displayName;
      if (u.photoURL) payload.photoURL = u.photoURL;
      if (u.phoneNumber) { payload.phone = u.phoneNumber; payload.phoneVerified = true; }
      if (!existing.createdAt) payload.createdAt = nowIso;
      await setDoc(ref, payload, { merge: true });
      // Decide destination based on existing data
      const snap2 = await getDoc(doc(db, 'users', u.uid));
      const data = snap2.exists() ? snap2.data() : {};
      const hasName = !!(data.name && String(data.name).trim()) || !!(u.displayName && String(u.displayName).trim());
      const isVerified = data.phoneVerified === true || !!u.phoneNumber;
      if (hasName && isVerified) {
        navigate('/');
      } else {
        navigate('/profile-complete');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (isLoading || authInProgress) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    setAuthInProgress(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const u = userCredential.user;
      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      const nowIso = new Date().toISOString();
      const payload = { };
      if (email) payload.email = email;
      if (!existing.createdAt) payload.createdAt = nowIso;
      await setDoc(ref, payload, { merge: true });
      navigate('/profile-complete');
    } catch (err) {
      let errorMessage = 'Sign up failed. Please try again.';
      
      switch(err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please log in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Please choose a stronger password (at least 6 characters).';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || 'Sign up failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setAuthInProgress(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleEmailSignup}>
        <label htmlFor="signup-email" className="muted">Email</label>
        <input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label htmlFor="signup-password" className="muted">Password</label>
        <input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={isLoading || authInProgress}
        >
          {isLoading ? 'Creating account...' : 'Sign Up with Email'}
        </button>
      </form>
      <button 
        className="google-btn modern-google" 
        onClick={handleGoogleSignup} 
        aria-label="Sign Up with Google"
        disabled={isLoading || authInProgress}
      >
        {isLoading ? 'Signing up...' : 'Sign Up with Google'}
      </button>
      <div className="auth-footer">
        <span>Already have an account?</span>
        <a href="/login" className="auth-link">Login!</a>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Signup;
