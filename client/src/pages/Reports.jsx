import { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, IndianRupee, Package, Users, CreditCard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const fmt = v => `₹${Number(v || 0).toLocaleString('en-IN')}`;

export default function Reports() {
  const { dark } = useTheme();
  const [period, setPeriod] = useState('monthly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try { const { data } = await api.get(`/reports?period=${period}`); setReport(data.data); }
      catch { toast.error('Failed to load report'); }
      finally { setLoading(false); }
    };
    fetchReport();
  }, [period]);

  const textColor = dark ? '#e2e8f0' : '#334155';
  const gridColor = dark ? '#334155' : '#e2e8f0';

  const cards = report ? [
    { label: 'Revenue', value: fmt(report.revenue), icon: TrendingUp, color: '#059669', bg: '#ecfdf5' },
    { label: 'Expenses', value: fmt(report.expenses), icon: TrendingDown, color: '#e11d48', bg: '#fff1f2' },
    { label: 'Gross Profit', value: fmt(report.grossProfit), icon: IndianRupee, color: report.grossProfit >= 0 ? '#059669' : '#e11d48', bg: report.grossProfit >= 0 ? '#ecfdf5' : '#fff1f2' },
    { label: 'Inventory Value', value: fmt(report.inventoryValue), icon: Package, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Pending Payments', value: fmt(report.pendingPayments), icon: CreditCard, color: '#d97706', bg: '#fffbeb' },
    { label: 'Sales Count', value: report.salesCount, icon: Users, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
  ] : [];

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Business performance insights</p>
        </div>
      </div>

      <div className="ct-tabs mb-4" style={{ width: '100%', maxWidth: 'fit-content', overflowX: 'auto' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`ct-tab text-capitalize ${period === p ? 'active' : ''}`}>{p}</button>
        ))}
      </div>

      {loading ? <div className="row g-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="col-6 col-lg-4"><div className="skeleton" style={{ height: 112 }} /></div>)}</div> : report && (
        <>
          <div className="row g-3 mb-4">
            {cards.map((c, i) => (
              <div key={i} className="col-6 col-lg-4">
                <div className="animate-fade-in" style={{ padding: '1.25rem', borderRadius: '1rem', background: c.bg, border: '1px solid var(--surface-200)' }}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <c.icon size={20} style={{ color: c.color }} />
                    <span style={{ fontSize: '.875rem', color: 'var(--surface-500)' }}>{c.label}</span>
                  </div>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: c.color }}>{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {report.topProducts?.length > 0 && (
            <div className="ct-card mb-4" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '1rem' }}>Top Selling Products</h3>
              {report.topProducts.map((p, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <span style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--surface-900)' }}>{p.name}</span>
                  </div>
                  <div className="text-end">
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--surface-900)' }}>{fmt(p.revenue)}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginLeft: '.5rem' }}>({p.quantity} sold)</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {report.topCustomers?.length > 0 && (
            <div className="ct-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '1rem' }}>Top Customers</h3>
              {report.topCustomers.map((c, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#ecfdf5', color: '#059669', fontSize: '.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--surface-900)' }}>{c.name}</p><p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{c.mobile}</p></div>
                  </div>
                  <div className="text-end">
                    <span style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--surface-900)' }}>{fmt(c.spent)}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginLeft: '.5rem' }}>({c.orders} orders)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
