import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Building2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)', marginBottom: '1.25rem' }}>Settings</h1>

      {/* Profile */}
      <div className="ct-card mb-4" style={{ padding: '1.5rem' }}>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div style={{ width: 64, height: 64, borderRadius: '1rem', background: 'linear-gradient(135deg,var(--primary-500),var(--primary-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,.2)' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{user?.name?.[0] || 'M'}</span>
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--surface-900)' }}>{user?.name}</h2>
            <p style={{ color: 'var(--surface-500)' }}>{user?.email}</p>
            <span className="ct-badge ct-badge-indigo" style={{ marginTop: '.25rem' }}>Admin</span>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="ct-card mb-4" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '1rem' }}>Appearance</h3>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            {dark ? <Moon size={20} style={{ color: '#818cf8' }} /> : <Sun size={20} style={{ color: '#d97706' }} />}
            <div>
              <p style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{dark ? 'Dark Mode' : 'Light Mode'}</p>
              <p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>Toggle between light and dark themes</p>
            </div>
          </div>
          <button onClick={toggleTheme} style={{
            position: 'relative', width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: dark ? 'var(--primary-600)' : 'var(--surface-300)', transition: 'background .2s'
          }}>
            <div style={{
              position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%', background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s',
              left: dark ? 24 : 4
            }} />
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="ct-card mb-4" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '1rem' }}>Change Password</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-3"><label className="ct-label">Current Password</label><input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="ct-input" /></div>
          <div className="mb-3"><label className="ct-label">New Password</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="ct-input" /></div>
          <div className="mb-3"><label className="ct-label">Confirm Password</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="ct-input" /></div>
          <button type="submit" className="btn-primary-ct">Update Password</button>
        </form>
      </div>

      {/* About */}
      <div className="ct-card" style={{ padding: '1.5rem' }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <Building2 size={20} style={{ color: 'var(--primary-600)' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--surface-900)' }}>CemTrack v1.0</h3>
        </div>
        <p style={{ fontSize: '.875rem', color: 'var(--surface-500)' }}>Cement & Steel Shop Inventory Management System. Built with MERN Stack.</p>
      </div>
    </div>
  );
}
