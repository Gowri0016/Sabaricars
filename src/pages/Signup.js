import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPhonePrompt, setShowPhonePrompt] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    setError('');
    setSuccess('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(collection(db, 'users'), result.user.uid);
      const userSnap = await getDoc(userRef);
      let userData = userSnap.exists() ? userSnap.data() : {};
      if (!userData.phone) {
        setGoogleUser(result.user);
        setShowPhonePrompt(true);
      } else {
        setSuccess('Signup successful!');
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(collection(db, 'users'), googleUser.uid), {
        name: googleUser.displayName,
        email: googleUser.email,
        phone,
        createdAt: new Date()
      }, { merge: true });
      setSuccess('Signup successful!');
      setShowPhonePrompt(false);
      setGoogleUser(null);
      navigate('/');
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
      await setDoc(doc(collection(db, 'users'), userCredential.user.uid), {
        name,
        email,
        phone,
        createdAt: new Date()
      });
      setSuccess('Signup successful!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {showPhonePrompt ? (
        <form onSubmit={handlePhoneSubmit}>
          <input
            type="tel"
            placeholder="Phone Number (with country code)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <button type="submit">Submit Phone Number</button>
        </form>
      ) : (
        <>
          <form onSubmit={handleEmailSignup}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (with country code)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
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
            <button type="submit">Sign Up with Email</button>
          </form>
          <button className="google-btn modern-google" onClick={handleGoogleSignup}>Sign Up with Google</button>
          <div className="auth-footer">
            <span>Already have an account?</span>
            <a href="/login" className="auth-link">Login!</a>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Signup;
