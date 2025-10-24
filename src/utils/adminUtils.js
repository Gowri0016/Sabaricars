import { db } from '../firebase';
import { collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';

// List of authorized admin emails
const AUTHORIZED_ADMIN_EMAILS = [
  'sabaricarsanthiyur9996@gmail.com',
  'www.7339596165@gmail.com'
];

// Check if an email is authorized to be an admin
export const isAuthorizedEmail = (email) => {
  return AUTHORIZED_ADMIN_EMAILS.includes(email);
};

// Check if any admins exist in the system
export const checkIfAnyAdminExists = async () => {
  try {
    const adminsCollection = collection(db, 'admins');
    const snapshot = await getDocs(adminsCollection);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking if any admin exists:', error);
    return false;
  }
};

// Check if a user is an admin
export const checkIsAdmin = async (email) => {
  if (!email) return false;
  if (!isAuthorizedEmail(email)) return false;
  
  try {
    const adminRef = doc(db, 'admins', email);
    const adminDoc = await getDoc(adminRef);
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Add a new admin
export const addAdmin = async (email) => {
  if (!email) throw new Error('Email is required');
  
  try {
    const adminRef = doc(db, 'admins', email);
    await setDoc(adminRef, {
      email,
      createdAt: new Date().toISOString(),
      isAdmin: true
    });
    return true;
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};