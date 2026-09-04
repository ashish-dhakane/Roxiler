import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import Loading from '../../components/Loading';
import { ErrorMessage, SuccessMessage } from '../../components/Message';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ by: 'name', order: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
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
      const res = await adminAPI.listUsers(params);
      setUsers(res.data.users);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSortByChange = (e) => {
    setSort((prev) => ({ ...prev, by: e.target.value }));
  };

  const toggleSortOrder = () => {
    setSort((prev) => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }));
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    fetchUsers();
  };

  const clearFilters = () => {
    setFilters({ name: '', email: '', address: '', role: '' });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const errs = {};
    if (form.name.length < 20) errs.name = 'Name must be at least 20 characters.';
    if (form.name.length > 60) errs.name = 'Name must not exceed 60 characters.';
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(form.email)) errs.email = 'Please provide a valid email.';
    if (form.password.length < 8 || form.password.length > 16)
      errs.password = 'Password must be between 8 and 16 characters.';
    else if (!/[A-Z]/.test(form.password))
      errs.password = 'Password must contain at least one uppercase letter.';
    else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(form.password))
      errs.password = 'Password must contain at least one special character.';
    if (form.address.length > 400) errs.address = 'Address must not exceed 400 characters.';
    return errs;
  };

  const handleCreateUser = async (e) => {
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
      await adminAPI.createUser({ ...form, role: formType });
      setSuccess(`User created successfully.`);
      setForm({ name: '', email: '', password: '', address: '' });
      setShowPassword(false);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || err.response?.data?.error || 'Failed to create user.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const roleGroups = [
    { key: 'user', label: 'Normal Users' },
    { key: 'store_owner', label: 'Store Owners' },
    { key: 'admin', label: 'Administrators' },
  ];

  const groupedUsers = roleGroups.map((group) => ({
    ...group,
    users: users.filter((u) => u.role === group.key),
  }));

  const openFormForRole = (role) => {
    setFormType(role);
    setShowForm(true);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '2px' }}>
            Manage user accounts, credentials, and access roles.
          </p>
        </div>
        <div className="header-actions">
          <button
            className={`btn btn-sm ${showForm && formType === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => openFormForRole('user')}
          >
            + Normal User
          </button>
          <button
            className={`btn btn-sm ${showForm && formType === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => openFormForRole('admin')}
          >
            + Admin
          </button>
          <button
            className={`btn btn-sm ${showForm && formType === 'store_owner' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => openFormForRole('store_owner')}
          >
            + Store Owner
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      {/* Creation Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '20px', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0 }}>
              Add {formType === 'admin' ? 'Admin' : formType === 'store_owner' ? 'Store Owner' : 'Normal User'}
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="20-60 characters" required />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="name@domain.com" required />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="8-16 chars, 1 uppercase, 1 special"
                    required
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {formErrors.password && <span className="field-error">{formErrors.password}</span>}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Address</label>
                <input type="text" name="address" value={form.address} onChange={handleFormChange} placeholder="Max 400 characters" required />
                {formErrors.address && <span className="field-error">{formErrors.address}</span>}
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Creating...' : 'Save User'}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              name="name"
              placeholder="Search name..."
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
            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="user">Normal User</option>
              <option value="store_owner">Store Owner</option>
            </select>
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
                onChange={handleSortByChange}
                style={{ width: 'auto', padding: '5px 8px', fontSize: '0.8125rem' }}
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="address">Address</option>
                <option value="role">Role</option>
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

      {/* Role Columns */}
      {loading ? (
        <div className="card"><Loading /></div>
      ) : (
        <div className="user-cards-grid">
          {groupedUsers.map((group) => (
            <div className="user-group-card" key={group.key}>
              <div className="user-group-title">
                <span>{group.label}</span>
                <span className="user-group-count">{group.users.length}</span>
              </div>
              {group.users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>
                  No records
                </div>
              ) : (
                <ul className="user-mini-list">
                  {group.users.map((u) => (
                    <li key={u.id} className="user-mini-item">
                      <button
                        className="link-button"
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        style={{ textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}
                      >
                        {u.name}
                      </button>
                      <span className="user-mini-email">{u.email}</span>
                      <span className="user-mini-address">{u.address}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}