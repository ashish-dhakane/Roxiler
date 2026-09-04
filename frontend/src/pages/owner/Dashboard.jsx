import { useState, useEffect } from 'react';
import { storeOwnerAPI } from '../../api/storeOwner';
import RatingStars from '../../components/RatingStars';
import Loading from '../../components/Loading';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await storeOwnerAPI.getDashboard();
      setData(res.data.dashboard);
    } catch (err) {
      setError('Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <div className="message error-message">{error}</div>;
  if (!data) return <div className="message error-message">No store data found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Store Owner Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{data.average_rating}</h3>
            <p>Average Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{data.total_ratings}</h3>
            <p>Total Ratings</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 16 }}>Your Store: {data.store.name}</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          {data.store.email} | {data.store.address}
        </p>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Users Who Rated Your Store</h2>
        {data.raters.length === 0 ? (
          <div className="empty-state">
            <p>No ratings yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.raters.map((rater) => (
                  <tr key={rater.id}>
                    <td>{rater.name}</td>
                    <td>{rater.email}</td>
                    <td>{rater.address}</td>
                    <td><RatingStars rating={rater.rating} readonly showValue /></td>
                    <td>{new Date(rater.rated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
