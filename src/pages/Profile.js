import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiCheckCircle, FiClock, FiMail, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pLoading, setPLoading] = useState(true);
  const [pError, setPError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';
  const [avatarOk, setAvatarOk] = useState(true);

  const ui = {
    page: { minHeight: '100svh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 16, paddingBottom: 96, background: 'var(--bg, #f8fafc)' },
    card: { width: '100%', maxWidth: 560, borderRadius: 16, border: '1px solid var(--border-200)', background: '#fff', boxShadow: '0 10px 30px rgba(16,24,40,0.08)' },
    header: { padding: 20, borderBottom: '1px solid var(--border-200)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    avatar: { width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-200)' },
    titleWrap: { display: 'flex', flexDirection: 'column', minWidth: 0 },
    name: { fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-900)' },
    email: { color: 'var(--text-600)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', wordBreak: 'break-word' },
    body: { padding: 12, display: 'flex', flexDirection: 'column', gap: 12 },
    row: { display: 'flex', alignItems: 'center', gap: 12, padding: 12, border: '1px solid var(--border-200)', borderRadius: 12, background: '#fff', flexWrap: 'wrap' },
    label: { color: 'var(--text-500)', fontSize: 13 },
    value: { color: 'var(--text-900)', fontWeight: 600 },
    badge: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', color: 'rgb(16,185,129)', fontWeight: 700, fontSize: 12 },
    footer: { padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-200)' },
    link: { color: 'var(--accent-600)', fontWeight: 700, textDecoration: 'none' },
    btn: { border: 'none', borderRadius: 999, padding: '10px 16px', background: 'linear-gradient(90deg, var(--accent-600), var(--accent-500))', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }
  };

  const formatTs = (v) => {
    if (!v) return '—';
    try {
      // Firestore Timestamp (has toDate)
      if (typeof v === 'object' && typeof v.toDate === 'function') {
        return v.toDate().toLocaleString();
      }
      // Firestore Timestamp shape
      if (typeof v === 'object' && (typeof v.seconds === 'number' || typeof v._seconds === 'number')) {
        const sec = typeof v.seconds === 'number' ? v.seconds : v._seconds;
        const nsec = typeof v.nanoseconds === 'number' ? v.nanoseconds : (typeof v._nanoseconds === 'number' ? v._nanoseconds : 0);
        const ms = sec * 1000 + Math.floor(nsec / 1e6);
        return new Date(ms).toLocaleString();
      }
      // Milliseconds number
      if (typeof v === 'number') {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toLocaleString();
      }
      // ISO or RFC string
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
    try { console.log('[Profile] component mounted'); } catch {}
    return () => { try { console.log('[Profile] component unmounted'); } catch {} };
  }, []);

  const renders = useRef(0);
  renders.current += 1;
  try { console.log('[Profile] render count:', renders.current); } catch {}

  useEffect(() => {
    try { console.log('[Profile] auth state changed. user:', user); } catch {}
  }, [user]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) {
        try { console.log('[Profile] No user, skipping load'); } catch {}
        setProfile(null); setPLoading(false); return;
      }
      setPLoading(true); setPError('');
      try { console.log('[Profile] Loading profile for uid:', user?.uid); } catch {}
      try { console.log('[Profile] auth metadata:', user?.metadata); } catch {}
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (!active) return;
        let data = snap.exists() ? snap.data() : {};
        try {
          console.log('[Profile] Firestore doc exists:', snap.exists(), 'path:', `users/${user.uid}`);
          console.log('[Profile] Firestore user doc:', data);
          console.log('[Profile] Types:', {
            createdAt: { type: typeof data?.createdAt, hasToDate: !!(data?.createdAt && typeof data.createdAt.toDate === 'function') },
            lastLoginAt: { type: typeof data?.lastLoginAt, hasToDate: !!(data?.lastLoginAt && typeof data.lastLoginAt.toDate === 'function') },
            updatedAt: { type: typeof data?.updatedAt, hasToDate: !!(data?.updatedAt && typeof data.updatedAt.toDate === 'function') }
          });
          console.log('[Profile] Formatted:', {
            createdAt: formatTs(data?.createdAt),
            lastLoginAt: formatTs(data?.lastLoginAt),
            updatedAt: formatTs(data?.updatedAt)
          });
          console.log('[Profile] Auth fallbacks:', {
            creationTime: user?.metadata?.creationTime,
            lastSignInTime: user?.metadata?.lastSignInTime,
          });
          if (debug) setDebugInfo({
            path: `users/${user.uid}`,
            exists: snap.exists(),
            data,
            types: {
              createdAt: { type: typeof data?.createdAt, hasToDate: !!(data?.createdAt && typeof data.createdAt.toDate === 'function') },
              lastLoginAt: { type: typeof data?.lastLoginAt, hasToDate: !!(data?.lastLoginAt && typeof data.lastLoginAt.toDate === 'function') },
              updatedAt: { type: typeof data?.updatedAt, hasToDate: !!(data?.updatedAt && typeof data.updatedAt.toDate === 'function') }
            },
            formatted: {
              createdAt: formatTs(data?.createdAt),
              lastLoginAt: formatTs(data?.lastLoginAt),
              updatedAt: formatTs(data?.updatedAt)
            },
            auth: {
              uid: user?.uid,
              email: user?.email,
              metadata: user?.metadata,
            }
          });
          if (!snap.exists()) {
            console.log('[Profile] Doc missing. Hydrating from Auth user...');
            const hydrated = {
              email: user.email || null,
              name: user.displayName || '',
              photoURL: user.photoURL || null,
              phone: user.phoneNumber || null,
              phoneVerified: !!user.phoneNumber,
              createdAt: user?.metadata?.creationTime || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(ref, hydrated, { merge: true });
            data = hydrated;
            console.log('[Profile] Hydration complete.');
          }
        } catch {}
        setProfile(data);
      } catch (e) {
        if (!active) return;
        try { console.error('[Profile] Failed to load profile:', e); } catch {}
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
            { (profile?.photoURL || user.photoURL) && avatarOk ? (
              <img
                src={profile?.photoURL || user.photoURL}
                alt="avatar"
                style={ui.avatar}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setAvatarOk(false)}
              />
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

          {pLoading ? (
            <div style={{ padding: 16 }}>Loading profile...</div>
          ) : (
          <div style={ui.body}>
            <div style={ui.row}>
              <FiPhone />
              <div style={{ flex: 1 }}>
                <div style={ui.label}>Phone</div>
                <div style={ui.value}>
                  {profile?.phone || user?.phoneNumber || ((profile?.phoneVerified || !!user?.phoneNumber) ? 'Verified' : 'Not set')}
                </div>
              </div>
              {(profile?.phoneVerified || !!user?.phoneNumber) ? (
                <span style={ui.badge}><FiCheckCircle /> Verified</span>
              ) : (
                <Link to="/profile-complete" style={ui.link}>Verify</Link>
              )}
            </div>

            {/* Removed Created/Last Login/Updated rows per request */}
          </div>
          )}
          {debug && (
            <pre style={{ padding: 12, margin: 12, background: '#0f172a', color: '#e2e8f0', borderRadius: 8, overflow: 'auto' }}>
              {JSON.stringify({ user: user && { uid: user.uid, email: user.email, metadata: user.metadata }, profile, debugInfo }, null, 2)}
            </pre>
          )}
          {pError && <div style={{ color: 'var(--danger-500)', padding: '0 16px 16px' }}>{pError}</div>}
        </div>
      )}
    </div>
  );
};

export default Profile;
