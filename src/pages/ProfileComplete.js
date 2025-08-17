import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, getRecaptchaVerifier } from '../firebase';
import { signInWithPhoneNumber, getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function ProfileComplete() {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const [recaptchaVerified, setRecaptchaVerified] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  // Focus states for inline focus styling
  const [fName, setFName] = useState(false);
  const [fCode, setFCode] = useState(false);
  const [fPhone, setFPhone] = useState(false);
  const [fOtp, setFOtp] = useState(false);
  // Component-scoped UI styles to avoid external CSS conflicts
  const ui = {
    page: { minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overscrollBehavior: 'contain' },
    card: { width: '100%', maxWidth: 480, padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 10px 30px rgba(16,24,40,0.08)', border: '1px solid var(--border-200)', maxHeight: 'calc(100svh - 32px)', overflow: 'auto', WebkitOverflowScrolling: 'touch' },
    header: { textAlign: 'center', marginBottom: 20 },
    h2: { margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-900)' },
    help: { marginTop: 6, fontSize: 14, color: 'var(--text-500)' },
    stack: { display: 'flex', flexDirection: 'column', gap: 16 },
    field: { display: 'flex', flexDirection: 'column', gap: 8 },
    label: { fontSize: 14, color: 'var(--text-600)', fontWeight: 600 },
    input: { height: 48, padding: '12px 14px', border: '1px solid var(--border-200)', borderRadius: 12, outline: 'none', background: '#fff', color: 'var(--text-900)', fontSize: 16 },
    inputFocus: { border: '1px solid var(--accent-600)', boxShadow: '0 0 0 3px rgba(33,150,243,0.15)' },
    inputGroupWrap: { display: 'flex', alignItems: 'stretch', border: '1px solid var(--border-200)', borderRadius: 12, overflow: 'visible', background: '#fff', width: '100%', position: 'relative', zIndex: 1 },
    inputGroupFocus: { border: '1px solid var(--accent-600)', boxShadow: '0 0 0 3px rgba(33,150,243,0.15)' },
    inputCode: { width: 56, height: 48, padding: '12px 8px', border: 'none', outline: 'none', background: '#fff', color: 'var(--text-900)', borderRight: '1px solid var(--border-200)', textAlign: 'center', fontWeight: 600, fontSize: 15 },
    inputPhone: { flex: 1, minWidth: 0, height: 48, padding: '12px 14px', border: 'none', outline: 'none', background: '#fff', color: 'var(--text-900)', fontSize: 16 },
    error: { color: 'var(--danger-500)', fontSize: 14 },
    btnPrimary: { width: '100%', height: 46, border: 'none', borderRadius: 999, color: '#fff', fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(90deg, var(--accent-600), var(--accent-500))', boxShadow: '0 6px 14px rgba(0,123,255,0.25)' },
    helperRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    linkBtn: { background: 'transparent', border: 'none', color: 'var(--accent-600)', padding: 8, fontWeight: 600, cursor: 'pointer' }
  };

  const scrollIntoViewOnFocus = (e) => {
    try {
      e?.target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (_) {}
  };

  // Prefill from current auth user and existing Firestore profile (if any)
  useEffect(() => {
    const u = auth.currentUser;
    const apply = (data) => {
      if (!data) return;
      if (data.name && !name) setName(data.name);
      const p = data.phone || data.phoneNumber; // phoneNumber may come from auth user
      if (p && typeof p === 'string') {
        // Expect "+<cc><number>"
        const m = p.trim().match(/^\+(\d{1,3})(\d{5,15})$/);
        if (m) {
          const [, cc, local] = m;
          if (!phone) setPhone(local);
          if (countryCode === '+91' || countryCode === '' || countryCode === undefined) {
            setCountryCode('+' + cc);
          }
        }
      }
    };

    if (u) {
      // From auth
      apply({ name: u.displayName, phoneNumber: u.phoneNumber });
      // From Firestore
      getDoc(doc(db, 'users', u.uid)).then(snap => {
        if (snap.exists()) apply(snap.data());
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Cleanup verifier on unmount if it exists
  useEffect(() => {
    return () => {
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      } catch (err) {
        /* noop */
      }
    };
  }, []);

  const startTimer = () => {
    setResendTimeout(120);
    timerRef.current = setInterval(() => {
      setResendTimeout(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    console.log('Send OTP clicked');
    setIsLoading(true);
    setError(null);

    if (!phone) {
      setError('Please enter a phone number');
      setIsLoading(false);
      return;
    }

    // Remove any non-digit characters from the phone number
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid phone number');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Creating invisible reCAPTCHA to send OTP');
      const fullPhone = `${countryCode}${cleanPhone}`;
      // ensure verifier exists
      const authInstance = auth || getAuth();
      // Always create a fresh invisible verifier so the badge doesn't persist across pages
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
      const params = {
        size: 'invisible',
        badge: 'bottomleft',
        callback: () => setRecaptchaVerified(true),
        'expired-callback': () => setRecaptchaVerified(false),
      };
      window.recaptchaVerifier = getRecaptchaVerifier('recaptcha-container', params);
      try { await window.recaptchaVerifier.render(); } catch (e) { /* ignore */ }
      const confirmationResult = await signInWithPhoneNumber(authInstance, fullPhone, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      console.log('OTP sent successfully');
      setOtpSent(true);
      startTimer();
      // Clear verifier shortly after send to minimize badge presence
      setTimeout(() => {
        try {
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        } catch (_) {}
      }, 300);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in sendOtp:', error);
      if (error && error.code === 'auth/invalid-app-credential') {
        setError('Authentication configuration error. Check Firebase API key, authorized domains and phone auth provider.');
      } else if (error && error.code === 'auth/quota-exceeded') {
        setError('SMS quota exceeded for this project. Try again later.');
      } else {
        setError(error.message || 'Failed to send OTP');
      }
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    await sendOtp();
  };

  const verifyOtpAndSave = async (e) => {
    e.preventDefault();
    console.log('Verify and Save clicked');
    setIsLoading(true);
    setError(null);

    try {
      if (!otp) {
        setError('Please enter the OTP sent to your phone');
        setIsLoading(false);
        return;
      }

      if (!name.trim()) {
        setError('Please enter your name');
        setIsLoading(false);
        return;
      }

      if (!window.confirmationResult) {
        setError('Please request OTP first');
        setIsLoading(false);
        return;
      }

      console.log('Getting current user');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      console.log('Verifying OTP');
      try {
        await window.confirmationResult.confirm(otp);
        console.log('Phone number verified successfully');
        
        console.log('Saving user data to Firestore');
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          phone: countryCode + phone,
          phoneVerified: true,
          email: user.email,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('Profile completed successfully');
        setIsLoading(false);
        navigate('/');
      } catch (error) {
        console.error('Error confirming OTP:', error);
        setError('Invalid OTP. Please try again.');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error in verifyOtpAndSave:', error);
      setError('Verification failed: ' + error.message);
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={ui.page}>
      <div style={ui.card}>
        <div style={ui.header}>
          <h2 style={ui.h2}>Please complete your profile</h2>
          <p style={ui.help}>We’ll verify your phone to secure your account.</p>
        </div>
        <div style={ui.stack}>
          <div style={ui.field}>
            <label htmlFor="pc-name" style={ui.label}>Name</label>
            <input
              id="pc-name"
              value={name}
              onChange={e => setName(e.target.value)}
              onFocus={() => setFName(true)}
              onBlur={() => setFName(false)}
              placeholder="Your full name"
              autoComplete="name"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck={false}
              style={{ ...ui.input, ...(fName ? ui.inputFocus : null) }}
            />
          </div>

          <div style={ui.field}>
            <label htmlFor="pc-phone" style={ui.label}>Phone</label>
            <div style={{ ...ui.inputGroupWrap, ...((fCode || fPhone) ? ui.inputGroupFocus : null) }}>
              <input
                id="pc-cc"
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                onFocus={(ev) => { setFCode(true); scrollIntoViewOnFocus(ev); }}
                onBlur={() => setFCode(false)}
                aria-label="Country code"
                autoComplete="tel-country-code"
                inputMode="tel"
                pattern="\\+?\\d*"
                style={ui.inputCode}
              />
              <input
                id="pc-phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onFocus={(ev) => { setFPhone(true); scrollIntoViewOnFocus(ev); }}
                onBlur={() => setFPhone(false)}
                placeholder="Enter phone number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="send"
                autoCorrect="off"
                spellCheck={false}
                aria-label="Phone number"
                style={ui.inputPhone}
              />
            </div>
          </div>

          {error && <div style={ui.error} aria-live="polite">{error}</div>}

          {!otpSent && (
            <>
              <div id="recaptcha-container" style={{ display: 'none' }}></div>
              <button onClick={sendOtp} disabled={isLoading} style={{ ...ui.btnPrimary, opacity: isLoading ? 0.8 : 1 }}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}

          {otpSent && (
            <div style={ui.stack}>
              <div style={ui.field}>
                <label htmlFor="pc-otp" style={ui.label}>Enter OTP</label>
                <input
                  id="pc-otp"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  onFocus={(ev) => { setFOtp(true); scrollIntoViewOnFocus(ev); }}
                  onBlur={() => setFOtp(false)}
                  placeholder="6-digit code"
                  type="text"
                  inputMode="numeric"
                  pattern="\\d*"
                  autoComplete="one-time-code"
                  enterKeyHint="done"
                  style={{ ...ui.input, ...(fOtp ? ui.inputFocus : null) }}
                />
              </div>
              <div style={ui.helperRow}>
                <span style={ui.help}>{resendTimeout > 0 ? `Resend OTP in ${formatTime(resendTimeout)}` : `Didn't receive OTP?`}</span>
                <button onClick={resendTimeout > 0 ? null : resendOtp} disabled={resendTimeout > 0} style={ui.linkBtn}>Resend OTP</button>
              </div>
              <button onClick={verifyOtpAndSave} disabled={isLoading} style={ui.btnPrimary}>
                {isLoading ? 'Verifying...' : 'Verify and Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
