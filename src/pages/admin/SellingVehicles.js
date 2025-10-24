import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import '../../pages/Admin.css';

function SellingVehicles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSell = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'sell'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(docs);
      } catch (err) {
        console.error('Failed to fetch sell documents:', err);
        setError('Failed to load selling vehicles.');
      } finally {
        setLoading(false);
      }
    };

    fetchSell();
  }, []);

  if (loading) return (
    <div className="admin-panel-container">
      <h2>Loading selling vehicles...</h2>
    </div>
  );

  if (error) return (
    <div className="admin-panel-container">
      <h2>Error</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h2>Selling Vehicles</h2>
        <p>Submissions from the Sell Vehicle page</p>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '20px' }}>
          <p>No selling submissions found.</p>
        </div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {items.map((it) => (
            <div key={it.id} className="admin-card" style={{ textAlign: 'left' }}>
              <h3>{it.vehicle || '—'}</h3>
              <p><strong>Name:</strong> {it.name || '—'}</p>
              <p><strong>Phone:</strong> {it.phone || '—'}</p>
              <p><strong>Year:</strong> {it.year || '—'}</p>
              <p><strong>Expected Price:</strong> {it.price || '—'}</p>
              {it.desc ? <p><strong>Description:</strong> {it.desc}</p> : null}

              {it.images && it.images.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Images:</strong>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    {it.images.map((u, idx) => (
                      <a key={idx} href={u} target="_blank" rel="noreferrer">
                        <img src={u} alt={`img-${idx}`} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 4, border: '1px solid #eee' }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                <em>ID: {it.id}</em>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellingVehicles;
