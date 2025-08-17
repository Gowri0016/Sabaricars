import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

function RegisterAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setSuccess('Admin account created! Please verify your email before logging in.');
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const navigate = useNavigate();
  return (
    <div className="register-admin-container">
      <button style={{marginBottom: '1rem'}} onClick={() => navigate && navigate('/admin-panel')} className="back-button">
        <span className="back-arrow">←</span> Back
      </button>
      <h2>Create Admin Account</h2>
      <form onSubmit={handleRegister}>
        <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Register</button>
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default RegisterAdmin;
