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
export const getRecaptchaVerifier = (containerId) => new RecaptchaVerifier(containerId, { size: 'invisible' }, auth);
