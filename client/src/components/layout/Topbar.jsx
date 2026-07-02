import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Moon, Sun, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');
  const profileRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications?unreadOnly=true&limit=1');
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="topbar">
      <div className="d-flex align-items-center gap-3 flex-grow-1">
        <button onClick={onMenuClick} className="topbar-btn d-lg-none">
          <Menu size={20} />
        </button>
        <div className="topbar-search d-none d-sm-block">
          <Search />
          <input type="text" placeholder="Search anything..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="d-flex align-items-center gap-1">
        <button onClick={toggleTheme} className="topbar-btn">
          {dark ? <Sun size={20} style={{ color: '#fbbf24' }} /> : <Moon size={20} />}
        </button>

        <button onClick={() => navigate('/notifications')} className="topbar-btn" style={{ position: 'relative' }}>
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px',
              background: '#f43f5e', color: '#fff', fontSize: '10px', fontWeight: 700,
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div style={{ position: 'relative', marginLeft: '.5rem' }} ref={profileRef}>
          <button onClick={() => setShowProfile(!showProfile)} className="profile-btn">
            <div className="profile-avatar">
              {user?.name?.[0] || 'M'}
            </div>
            <span className="d-none d-md-inline" style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--surface-700)' }}>
              {user?.name || 'Manager'}
            </span>
          </button>

          {showProfile && (
            <div className="profile-dropdown animate-fade-in">
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--surface-200)' }}>
                <p style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--surface-900)' }}>{user?.name}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginTop: '2px' }}>{user?.email}</p>
              </div>
              <div style={{ padding: '.5rem' }}>
                <button onClick={() => { navigate('/settings'); setShowProfile(false); }} className="profile-dropdown-item">
                  <User size={16} /> Profile Settings
                </button>
                <button onClick={handleLogout} className="profile-dropdown-item danger">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
