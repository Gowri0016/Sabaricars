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
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    setError('');
    setSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      await setDoc(doc(db, 'users', u.uid), {
        email: u.email || null,
        name: u.displayName || '',
        photoURL: u.photoURL || null,
        phone: u.phoneNumber || null,
        createdAt: new Date()
      }, { merge: true });
      // Decide destination based on existing data
      const snap = await getDoc(doc(db, 'users', u.uid));
      const data = snap.exists() ? snap.data() : {};
      const hasName = !!(data.name && String(data.name).trim());
      const hasPhone = !!(data.phone && String(data.phone).trim()) || !!u.phoneNumber;
      const isVerified = data.phoneVerified === true || !!u.phoneNumber;
      if (hasName && hasPhone && isVerified) {
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
    setError('');
    setSuccess('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        createdAt: new Date()
      }, { merge: true });
      navigate('/profile-complete');
    } catch (err) {
      setError(err.message);
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
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Sign Up with Email</button>
      </form>
      <button className="google-btn modern-google" onClick={handleGoogleSignup} aria-label="Sign Up with Google">Sign Up with Google</button>
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
