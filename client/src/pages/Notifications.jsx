import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Package, CreditCard, AlertTriangle, ShoppingCart, BarChart3 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ICONS = { low_stock: AlertTriangle, payment_due: CreditCard, payment_overdue: CreditCard, new_stock: Package, daily_summary: BarChart3, sale_created: ShoppingCart };
const COLORS = { low_stock: '#d97706', payment_due: '#2563eb', payment_overdue: '#e11d48', new_stock: '#059669', daily_summary: '#6366f1', sale_created: '#8b5cf6' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try { const { data } = await api.get('/notifications', { params: { type: filter, limit: 100 } }); setNotifications(data.data); }
    catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [filter]);

  const markRead = async (id) => { try { await api.put(`/notifications/${id}/read`); fetchData(); } catch { toast.error('Failed'); } };
  const markAllRead = async () => { try { await api.put('/notifications/read-all'); toast.success('All marked as read'); fetchData(); } catch { toast.error('Failed'); } };
  const deleteNotif = async (id) => { try { await api.delete(`/notifications/${id}`); fetchData(); } catch { toast.error('Failed'); } };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Notifications</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Stay updated on your business activities</p>
        </div>
        <button onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem 1rem', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 500, color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer', transition: 'background .15s' }}
          onMouseOver={e => e.currentTarget.style.background = 'var(--primary-50)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
          <CheckCheck size={16} /> Mark All Read
        </button>
      </div>

      <div className="ct-pills mb-4">
        {['', 'low_stock', 'payment_due', 'payment_overdue', 'new_stock', 'sale_created'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`ct-pill text-capitalize ${filter === f ? 'active' : ''}`}>
            {f ? f.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      <div>
        {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton mb-2" style={{ height: 64 }} />) :
        notifications.length === 0 ? (
          <div className="text-center" style={{ padding: '4rem 0' }}>
            <Bell size={64} style={{ color: 'var(--surface-200)', margin: '0 auto .75rem', display: 'block' }} />
            <p style={{ color: 'var(--surface-500)' }}>No notifications</p>
          </div>
        ) : notifications.map(n => {
          const Icon = ICONS[n.type] || Bell;
          const color = COLORS[n.type] || 'var(--surface-500)';
          return (
            <div key={n._id} className={`notif-card mb-2 ${!n.isRead ? 'unread' : ''}`}>
              <div className="notif-icon" style={{ background: n.isRead ? 'var(--surface-100)' : 'var(--primary-100)' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '.875rem', fontWeight: 500, color: n.isRead ? 'var(--surface-600)' : 'var(--surface-900)' }}>{n.title}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginTop: '.125rem' }}>{n.message}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--surface-400)', marginTop: '.25rem' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <div className="d-flex gap-1">
                {!n.isRead && <button onClick={() => markRead(n._id)} className="btn-icon"><Check size={16} /></button>}
                <button onClick={() => deleteNotif(n._id)} className="btn-icon danger"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
