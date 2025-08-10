import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function ProfileComplete() {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [otpSent, setOtpSent] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
      console.log('Creating RecaptchaVerifier instance');
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (token) => {
          console.log('reCAPTCHA callback received');
        },
        'error-callback': (error) => {
          console.error('reCAPTCHA error:', error);
          setError('reCAPTCHA verification failed');
          setIsLoading(false);
        }
      });

      console.log('Rendering reCAPTCHA');
      await recaptchaVerifier.render();

      console.log('Sending OTP to phone:', countryCode + phone);
      const fullPhone = `${countryCode}${cleanPhone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, recaptchaVerifier);
      
      // Store confirmationResult globally
      window.confirmationResult = confirmationResult;
      
      console.log('OTP sent successfully');
      setOtpSent(true);
      startTimer();
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error in sendOtp:', error);
      setError(error.message || 'Failed to send OTP');
      setIsLoading(false);
      
      // Clean up reCAPTCHA if there was an error
      try {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      } catch (cleanupError) {
        console.error('Error cleaning up reCAPTCHA:', cleanupError);
      }
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom, #e0e7ff, #f0f4ff)' }}>
      <div style={{ width: 400, background: '#fff', borderRadius: 22, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32 }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700 }}>Please complete your profile</h2>
        <div style={{ margin: '24px 0' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="form-control" style={{ width: '100%', marginBottom: 16, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ width: 60, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" type="tel" style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          {!otpSent && (
            <button 
              onClick={sendOtp}
              disabled={isLoading}
              className="g-recaptcha"
              data-sitekey="6Lf-e6ArAAAAAENIq9ijVGxBSXUyPutoAH_3jJbK"
              data-callback="sendOtp"
              data-action="SEND_OTP"
              style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 18, marginBottom: 8 }}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          )}
          {otpSent && (
            <>
              <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" type="number" style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ccc' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: resendTimeout > 0 ? 'grey' : 'blue' }}>
                  {resendTimeout > 0 ? `Resend OTP in ${formatTime(resendTimeout)}` : `Didn't receive OTP?`}
                </span>
                <button onClick={resendTimeout > 0 ? null : resendOtp} disabled={resendTimeout > 0} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: resendTimeout > 0 ? 'not-allowed' : 'pointer' }}>Resend OTP</button>
              </div>
              <button 
                onClick={verifyOtpAndSave}
                disabled={isLoading}
                className="g-recaptcha"
                data-sitekey="6Lf-e6ArAAAAAENIq9ijVGxBSXUyPutoAH_3jJbK"
                data-callback="verifyOtpAndSave"
                data-action="VERIFY_OTP"
                style={{ width: '100%', background: '#2563eb', color: '#fff', padding: 12, borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 18 }}
              >
                {isLoading ? 'Verifying...' : 'Verify and Save'}
              </button>
            </>
          )}
        </div>
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}
