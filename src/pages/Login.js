import React, { useState } from 'react';
import { auth, db, executeRecaptcha } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, fetchSignInMethodsForEmail, linkWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './Auth.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authInProgress, setAuthInProgress] = useState(false);
  const navigate = useNavigate();

  const checkProfileAndNavigate = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.exists() ? userDoc.data() : {};
      const hasName = !!(data.name && String(data.name).trim()) || !!(user.displayName && String(user.displayName).trim());
      const isVerified = data.phoneVerified === true || !!user.phoneNumber;
      const isComplete = hasName && isVerified; // phone may be null but verified
      if (isComplete) {
        setSuccess('Login successful!');
        navigate('/');
      } else {
        navigate('/profile-complete');
      }
    } catch (e) {
      // If we cannot read the profile (e.g., rules/network), avoid blocking login.
      console.log('[Login] Skipping completeness check due to read error:', e?.message);
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    if (authInProgress) return; // Prevent multiple clicks
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    setAuthInProgress(true);
    
    try {
      // Execute reCAPTCHA before Google login
      const token = await executeRecaptcha('GOOGLE_LOGIN');
      if (!token) {
        throw new Error('reCAPTCHA verification failed');
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account' // Force account selection to prevent auto-login issues
      });
      
      // If already signed in (e.g., via email), link Google to current user
      if (auth.currentUser) {
        const linkRes = await linkWithPopup(auth.currentUser, provider);
        const u = linkRes.user;
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
        await checkProfileAndNavigate(u);
        return;
      }

      // Fresh Google sign-in
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
      await checkProfileAndNavigate(u);
    } catch (err) {
      // Handle duplicate account (email already exists with another provider)
      if (err && err.code === 'auth/account-exists-with-different-credential') {
        const email = err?.customData?.email;
        if (email) {
          try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            const method = methods && methods[0];
            setError(`This email is already registered via ${method}. Please log in with that method first, then link Google from your profile.`);
          } catch (e2) {
            setError('This email is already registered with a different provider. Please log in with the original method, then link Google.');
          }
        } else {
          setError('This email is already registered with a different provider. Please log in with the original method, then link Google.');
        }
        return;
      }
      let errorMessage = 'Failed to sign in with Google';
      
      switch(err.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Login was cancelled';
          break;
        case 'auth/cancelled-popup-request':
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups for this site.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'This email is already registered with a different sign-in method.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || 'Failed to sign in with Google';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setAuthInProgress(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (isLoading || authInProgress) return;
    
    setError('');
    setSuccess('');
    setIsLoading(true);
    setAuthInProgress(true);
    
    try {
      // Execute reCAPTCHA before login
      const token = await executeRecaptcha('LOGIN');
      if (!token) {
        throw new Error('reCAPTCHA verification failed');
      }
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      const u = result.user;
      // Ensure a basic user doc exists for email/password login as well (safe merge)
      const ref = doc(db, 'users', u.uid);
      const snap = await getDoc(ref);
      const existing = snap.exists() ? snap.data() : {};
      const nowIso = new Date().toISOString();
      const payload = {
        lastLoginAt: nowIso,
      };
      if (u.email) payload.email = u.email;
      if (u.displayName) payload.name = u.displayName;
      if (u.photoURL) payload.photoURL = u.photoURL;
      if (u.phoneNumber) {
        payload.phone = u.phoneNumber;
        payload.phoneVerified = true;
      }
      if (!existing.createdAt) payload.createdAt = nowIso;
      await setDoc(ref, payload, { merge: true });
      await checkProfileAndNavigate(u);
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      switch(err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later or reset your password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = err.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setAuthInProgress(false);
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
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={isLoading || authInProgress}
        >
          {isLoading ? 'Signing in...' : 'Login with Email'}
        </button>
      </form>
      <button 
        className="google-btn modern-google" 
        onClick={handleGoogleLogin} 
        aria-label="Login with Google"
        disabled={isLoading || authInProgress}
      >
        {isLoading ? 'Signing in...' : 'Login with Google'}
      </button>
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
