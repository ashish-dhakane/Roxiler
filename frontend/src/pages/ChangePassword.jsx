import { useState } from 'react';
import { authAPI } from '../api/auth';
import { ErrorMessage, SuccessMessage } from '../components/Message';

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validate = () => {
    if (!form.currentPassword) return 'Current password is required.';
    if (form.newPassword.length < 8 || form.newPassword.length > 16) {
      return 'New password must be between 8 and 16 characters.';
    }
    if (!/[A-Z]/.test(form.newPassword)) {
      return 'New password must contain at least one uppercase letter.';
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(form.newPassword)) {
      return 'New password must contain at least one special character.';
    }
    if (form.newPassword !== form.confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const toggleButtonStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  };

  return (
    <div className="page-container" style={{ maxWidth: 440, padding: '40px 24px' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '6px' }}>Update Password</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '20px' }}>
          Enter your current credentials along with a new secure password.
        </p>

        <ErrorMessage message={error} />
        <SuccessMessage message={success} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword.current ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
                style={{ paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('current')}
                style={toggleButtonStyle}
              >
                {showPassword.current ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword.new ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="8-16 chars, 1 uppercase, 1 special"
                required
                style={{ paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('new')}
                style={toggleButtonStyle}
              >
                {showPassword.new ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Confirm New Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                style={{ paddingRight: '36px' }}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('confirm')}
                style={toggleButtonStyle}
              >
                {showPassword.confirm ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}