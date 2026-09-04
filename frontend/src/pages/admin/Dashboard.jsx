import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import RatingStars from '../../components/RatingStars';
import Loading from '../../components/Loading';
import { ErrorMessage } from '../../components/Message';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [storesList, setStoresList] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await adminAPI.getDashboard();
        setStats(res.data.dashboard);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleCardClick = async (section) => {
    if (activeSection === section) {
      setActiveSection(null);
      return;
    }

    setActiveSection(section);
    setSectionLoading(true);

    try {
      if (section === 'users') {
        const res = await adminAPI.listUsers({});
        setUsersList(res.data.users);
      } else if (section === 'stores') {
        const res = await adminAPI.listStores({});
        setStoresList(res.data.stores);
      }
    } catch (err) {
      setError(`Failed to load ${section}.`);
    } finally {
      setSectionLoading(false);
    }
  };

  const getBadgeClass = (role) => {
    if (role === 'admin') return 'role-admin';
    if (role === 'store_owner') return 'role-store_owner';
    return 'role-user';
  };

  if (loading) return <div className="page-container"><Loading /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '2px' }}>
            System activity and platform summaries.
          </p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Users */}
          <div
            className="card"
            onClick={() => handleCardClick('users')}
            style={{
              cursor: 'pointer',
              borderColor: activeSection === 'users' ? 'var(--primary)' : 'var(--border)',
              backgroundColor: activeSection === 'users' ? '#fcfcfd' : 'var(--surface)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Users
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '12px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {stats.totalUsers}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeSection === 'users' ? 'Hide details' : 'View list →'}
              </span>
            </div>
          </div>

          {/* Total Stores */}
          <div
            className="card"
            onClick={() => handleCardClick('stores')}
            style={{
              cursor: 'pointer',
              borderColor: activeSection === 'stores' ? 'var(--primary)' : 'var(--border)',
              backgroundColor: activeSection === 'stores' ? '#fcfcfd' : 'var(--surface)',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Stores
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '12px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {stats.totalStores}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeSection === 'stores' ? 'Hide details' : 'View list →'}
              </span>
            </div>
          </div>

          {/* Total Ratings */}
          <div
            className="card"
            style={{
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ratings Submitted
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '12px' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                {stats.totalRatings}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                Cumulative
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Users Section */}
      {activeSection === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fafafa'
          }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Registered Users</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/admin/users')}
              >
                Open Full View
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>
            </div>
          </div>

          {sectionLoading ? (
            <div style={{ padding: '24px' }}><Loading /></div>
          ) : usersList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px', fontSize: '0.8125rem' }}>
              No users registered yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <button
                          className="link-button"
                          onClick={() => navigate(`/admin/users/${u.id}`)}
                          style={{ fontWeight: 600 }}
                        >
                          {u.name}
                        </button>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>{u.address}</td>
                      <td>
                        <span className={`role-badge ${getBadgeClass(u.role)}`}>
                          {u.role === 'store_owner' ? 'Store Owner' : u.role === 'user' ? 'Normal User' : 'Admin'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expanded Stores Section */}
      {activeSection === 'stores' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fafafa'
          }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>Registered Stores</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate('/admin/stores')}
              >
                Open Full View
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveSection(null)}
              >
                ✕
              </button>
            </div>
          </div>

          {sectionLoading ? (
            <div style={{ padding: '24px' }}><Loading /></div>
          ) : storesList.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px', fontSize: '0.8125rem' }}>
              No stores registered yet.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Store Name</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Average Rating</th>
                    <th>Total Reviews</th>
                  </tr>
                </thead>
                <tbody>
                  {storesList.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                      <td>{s.address}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <RatingStars rating={s.rating} readonly />
                          <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                            {s.rating > 0 ? s.rating.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--text-muted)'
                        }}>
                          {s.total_ratings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}