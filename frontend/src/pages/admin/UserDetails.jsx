import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import Loading from '../../components/Loading';
import RatingStars from '../../components/RatingStars';
import { roleLabel } from '../../utils/roleLabel';
export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await adminAPI.getUserDetails(id);
      setUser(res.data.user);
    } catch (err) {
      setError('Failed to load user details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading user details..." />;
  if (error) return <div className="message error-message">{error}</div>;
  if (!user) return <div className="message error-message">User not found.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Details</h1>
        <Link to="/admin/users" className="btn btn-secondary">← Back to Users</Link>
      </div>
      <div className="card" style={{ maxWidth: 600 }}>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <p>{user.name}</p>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <p>{user.email}</p>
          </div>
          <div className="detail-item">
            <label>Address</label>
            <p>{user.address}</p>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <p><span className={`role-badge role-${user.role}`}>{roleLabel(user.role)}</span></p>
          </div>
        </div>
        {user.role === 'store_owner' && user.store && (
          <div className="store-rating-section" style={{ marginTop: 24, borderTop: '1px solid #eee', paddingTop: 24 }}>
            <h3>Store Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Store Name</label>
                <p>{user.store.name}</p>
              </div>
              <div className="detail-item">
                <label>Average Rating</label>
                <p><RatingStars rating={user.store.average_rating} readonly /></p>
              </div>
              <div className="detail-item">
                <label>Total Ratings</label>
                <p>{user.store.total_ratings}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
