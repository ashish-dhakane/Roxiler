import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/admin';
import RatingStars from '../../components/RatingStars';
import Loading from '../../components/Loading';
import { ErrorMessage, SuccessMessage } from '../../components/Message';

export default function StoresManagement() {
  const [stores, setStores] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        sort: sort.by,
        order: sort.order,
      };
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await adminAPI.listStores(params);
      setStores(res.data.stores);
    } catch (err) {
      setError('Failed to load stores.');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  const fetchAvailableOwners = useCallback(async () => {
    try {
      const res = await adminAPI.listAvailableOwners();
      setAvailableOwners(res.data.owners);
    } catch (err) {
      // Ignore fallback
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (showForm) {
      fetchAvailableOwners();
    }
  }, [showForm, fetchAvailableOwners]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    fetchStores();
  };

  const clearFilters = () => {
    setFilters({ name: '', email: '', address: '' });
  };

  const handleSortChange = (e) => {
    setSort((prev) => ({ ...prev, by: e.target.value }));
  };

  const toggleSortOrder = () => {
    setSort((prev) => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }));
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Store name is required.';
    if (form.name.length > 60) errs.name = 'Store name cannot exceed 60 characters.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) errs.email = 'Please provide a valid email.';
    if (!form.address.trim()) errs.address = 'Store address is required.';
    if (form.address.length > 400) errs.address = 'Address cannot exceed 400 characters.';
    return errs;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        address: form.address,
        owner_id: form.owner_id ? parseInt(form.owner_id, 10) : null,
      };
      await adminAPI.createStore(payload);
      setSuccess('Store created successfully.');
      setForm({ name: '', email: '', address: '', owner_id: '' });
      setShowForm(false);
      fetchStores();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create store.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Stores</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
            Store inventory, owner associations, and performance ratings.
          </p>
        </div>
        <div className="header-actions">
          <button
            className={`btn btn-sm ${showForm ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Close' : '+ Add Store'}
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Creation Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>Register New Store</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateStore}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Store Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Max 60 characters"
                  required
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Store Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="contact@store.com"
                  required
                />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Assigned Owner</label>
                <select name="owner_id" value={form.owner_id} onChange={handleFormChange}>
                  <option value="">Unassigned</option>
                  {availableOwners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.name} ({owner.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Store Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Physical address"
                  required
                />
                {formErrors.address && <span className="field-error">{formErrors.address}</span>}
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Store'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px', marginBottom: '20px' }}>
        <form onSubmit={applyFilters}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              name="name"
              placeholder="Search store name..."
              value={filters.name}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="email"
              placeholder="Search email..."
              value={filters.email}
              onChange={handleFilterChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Search address..."
              value={filters.address}
              onChange={handleFilterChange}
            />
          </div>

          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                Apply
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={clearFilters}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>Sort:</span>
              <select
                value={sort.by}
                onChange={handleSortChange}
                style={{ width: 'auto', padding: '5px 8px', fontSize: '0.8125rem' }}
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="address">Address</option>
                <option value="rating">Rating</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={toggleSortOrder}
              >
                {sort.order === 'asc' ? 'Asc ↑' : 'Desc ↓'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="card"><Loading /></div>
      ) : stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
          No stores found.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Average Rating</th>
                  <th>Reviews</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td><strong>{store.name}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{store.email}</td>
                    <td>{store.address}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RatingStars rating={store.rating} readonly />
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                          {store.rating > 0 ? store.rating.toFixed(2) : '0.00'}
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
                        {store.total_ratings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}