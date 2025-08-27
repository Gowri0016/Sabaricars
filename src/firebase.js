// Replace the below config with your Firebase project config
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDVoxzLwncpKCd2HYqpAF3IR46ySWH2eqI",
  authDomain: "sabari-cars.firebaseapp.com",
  projectId: "sabari-cars",
  storageBucket: "sabari-cars.firebasestorage.app",
  messagingSenderId: "311059865252",
  appId: "1:311059865252:web:511642f06642cec2dbd031",
  measurementId: "G-GBV3N055SP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const executeRecaptcha = async (action) => {
  try {
    // Ensure the Enterprise script is loaded only when needed
    const ensureScript = () => new Promise((resolve, reject) => {
      if (window.grecaptcha && window.grecaptcha.enterprise) return resolve();
      const existing = document.querySelector('script[data-recaptcha-enterprise]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (e) => reject(e));
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://www.google.com/recaptcha/enterprise.js?render=6Lf-e6ArAAAAAENIq9ijVGxBSXUyPutoAH_3jJbK';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-recaptcha-enterprise', 'true');
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

    await ensureScript();

    return new Promise((resolve, reject) => {
      window.grecaptcha.enterprise.ready(() => {
        window.grecaptcha.enterprise
          .execute('6Lf-e6ArAAAAAENIq9ijVGxBSXUyPutoAH_3jJbK', { action })
          .then(resolve)
          .catch(reject);
      });
    });
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    throw error;
  }
};

export const getRecaptchaVerifier = (containerId, params = {}) => {
  // Modular SDK signature: new RecaptchaVerifier(auth, container, parameters)
  // Allow caller to pass callbacks like `callback` and `expired-callback`.
  const defaultParams = { size: 'invisible' };
  return new RecaptchaVerifier(getAuth(), containerId, { ...defaultParams, ...params });
};
