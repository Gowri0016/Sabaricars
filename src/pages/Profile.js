import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiCheckCircle, FiClock, FiMail, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pLoading, setPLoading] = useState(true);
  const [pError, setPError] = useState('');

  const ui = {
    page: { minHeight: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 16, background: 'var(--bg, #f8fafc)' },
    card: { width: '100%', maxWidth: 560, borderRadius: 16, border: '1px solid var(--border-200)', background: '#fff', boxShadow: '0 10px 30px rgba(16,24,40,0.08)' },
    header: { padding: 24, borderBottom: '1px solid var(--border-200)', display: 'flex', alignItems: 'center', gap: 16 },
    avatar: { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-200)' },
    titleWrap: { display: 'flex', flexDirection: 'column' },
    name: { fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-900)' },
    email: { color: 'var(--text-600)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 },
    body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
    row: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border-200)', borderRadius: 12, background: '#fff' },
    label: { color: 'var(--text-500)', fontSize: 13 },
    value: { color: 'var(--text-900)', fontWeight: 600 },
    badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: 'rgb(16,185,129)', fontWeight: 700, fontSize: 12 },
    footer: { padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-200)' },
    link: { color: 'var(--accent-600)', fontWeight: 700, textDecoration: 'none' },
    btn: { border: 'none', borderRadius: 999, padding: '10px 16px', background: 'linear-gradient(90deg, var(--accent-600), var(--accent-500))', color: '#fff', fontWeight: 800, cursor: 'pointer' }
  };

  const formatTs = (v) => {
    if (!v) return '—';
    try {
      // Firestore Timestamp
      if (typeof v === 'object' && (v.seconds || v._seconds)) {
        const ms = (v.seconds || v._seconds) * 1000 + Math.floor((v.nanoseconds || v._nanoseconds || 0) / 1e6);
        return new Date(ms).toLocaleString();
      }
      // ISO string
      if (typeof v === 'string') {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toLocaleString();
      }
      // JS Date
      if (v instanceof Date) return v.toLocaleString();
    } catch {}
    return String(v);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) { setProfile(null); setPLoading(false); return; }
      setPLoading(true); setPError('');
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (!active) return;
        setProfile(snap.exists() ? snap.data() : {});
      } catch (e) {
        if (!active) return;
        setPError(e.message || 'Failed to load profile');
      } finally {
        if (active) setPLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  const handleLogout = async () => { await signOut(auth); };

  return (
    <div style={ui.page}>
      {loading ? (
        <div style={{ padding: 24 }}>Loading...</div>
      ) : !user ? (
        <div style={ui.card}>
          <div style={ui.header}>
            <div>
              <FiUser size={48} />
            </div>
            <div style={ui.titleWrap}>
              <h3 style={ui.name}>Welcome!</h3>
              <div style={ui.email}>Please log in or sign up to view your profile.</div>
            </div>
          </div>
          <div style={ui.footer}>
            <Link to="/login" style={ui.link}>Login</Link>
            <Link to="/signup" style={ui.link}>Sign Up</Link>
          </div>
        </div>
      ) : (
        <div style={ui.card}>
          <div style={ui.header}>
            { (profile?.photoURL || user.photoURL) ? (
              <img src={profile?.photoURL || user.photoURL} alt="avatar" style={ui.avatar} />
            ) : (
              <div style={{ width:72, height:72, borderRadius:'50%', display:'grid', placeItems:'center', background:'#f1f5f9', border:'1px solid var(--border-200)' }}>
                <FiUser size={32} color="#64748b" />
              </div>
            )}
            <div style={ui.titleWrap}>
              <h3 style={ui.name}>{profile?.name || user.displayName || 'User'}</h3>
              <div style={ui.email}><FiMail /> {profile?.email || user.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={handleLogout} style={ui.btn}><FiLogOut /> Logout</button>
            </div>
          </div>

          <div style={ui.body}>
            <div style={ui.row}>
              <FiPhone />
              <div style={{ flex: 1 }}>
                <div style={ui.label}>Phone</div>
                <div style={ui.value}>{profile?.phone || 'Not set'}</div>
              </div>
              {profile?.phoneVerified ? (
                <span style={ui.badge}><FiCheckCircle /> Verified</span>
              ) : (
                <Link to="/profile-complete" style={ui.link}>Verify</Link>
              )}
            </div>

            <div style={ui.row}>
              <FiClock />
              <div style={{ flex: 1 }}>
                <div style={ui.label}>Created</div>
                <div style={ui.value}>{formatTs(profile?.createdAt)}</div>
              </div>
            </div>

            <div style={ui.row}>
              <FiClock />
              <div style={{ flex: 1 }}>
                <div style={ui.label}>Last Login</div>
                <div style={ui.value}>{formatTs(profile?.lastLoginAt)}</div>
              </div>
            </div>

            <div style={ui.row}>
              <FiClock />
              <div style={{ flex: 1 }}>
                <div style={ui.label}>Updated</div>
                <div style={ui.value}>{formatTs(profile?.updatedAt)}</div>
              </div>
            </div>
          </div>
          {pError && <div style={{ color: 'var(--danger-500)', padding: '0 16px 16px' }}>{pError}</div>}
        </div>
      )}
    </div>
  );
};

export default Profile;
