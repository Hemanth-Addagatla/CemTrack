import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, CreditCard, TrendingUp, AlertTriangle, IndianRupee, ArrowUpRight, Wallet, BarChart3 } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';

const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

const StatCard = ({ title, value, icon: Icon, prefix = '', suffix = '' }) => (
  <div className="stat-card glass animate-fade-in">
    <div className="stat-glow" />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="stat-icon">
          <Icon size={24} className="animate-float" style={{ animationDelay: `${Math.random() * 2}s` }} />
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .3s' }} className="hover-arrow">
          <ArrowUpRight size={16} style={{ color: 'var(--surface-400)' }} />
        </div>
      </div>
      <div>
        <p className="stat-value truncate" title={`${prefix}${typeof value === 'number' ? value.toLocaleString('en-IN') : value}${suffix}`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </p>
        <p className="stat-label truncate" title={title}>{title}</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/charts')
        ]);
        setStats(statsRes.data.data);
        setCharts(chartsRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="row g-3 mb-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="col-6 col-md-4 col-xl"><div className="skeleton" style={{ height: 128 }} /></div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-lg-6"><div className="skeleton" style={{ height: 320 }} /></div>
          <div className="col-lg-6"><div className="skeleton" style={{ height: 320 }} /></div>
        </div>
      </div>
    );
  }

  const s = stats || {};
  const statCards = [
    { title: 'Total Inventory Value', value: formatCurrency(s.totalInventoryValue), icon: Package },
    { title: 'Total Cement Bags', value: s.totalCementBags, icon: Package },
    { title: 'Total Steel Stock', value: s.totalSteelStock, icon: BarChart3 },
    { title: "Today's Sales", value: formatCurrency(s.todaySales), icon: ShoppingCart },
    { title: 'Monthly Revenue', value: formatCurrency(s.monthlyRevenue), icon: TrendingUp },
    { title: 'Pending Payments', value: formatCurrency(s.pendingPayments), icon: CreditCard },
    { title: 'Total Customers', value: s.totalCustomers, icon: Users },
    { title: 'Low Stock Alerts', value: s.lowStockAlerts, icon: AlertTriangle },
    { title: "Today's Expenses", value: formatCurrency(s.todayExpenses), icon: Wallet },
    { title: 'Monthly Profit', value: formatCurrency(s.monthlyProfit), icon: IndianRupee },
  ];

  const textColor = dark ? '#e2e8f0' : '#334155';
  const gridColor = dark ? '#334155' : '#e2e8f0';

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--surface-900),var(--surface-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="font-heading">Dashboard</h1>
        <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem', fontWeight: 500 }}>Welcome back! Here's your business overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card, i) => (
          <div key={i} className="col-6 col-md-4 col-xl">
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="chart-card glass">
            <h3>Daily Sales (30 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts?.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: '1px solid #334155', borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="chart-card glass">
            <h3>Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts?.monthlySales || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 11 }} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: '1px solid #334155', borderRadius: 12, fontSize: 13 }} />
                <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="chart-card glass">
            <h3>Payment Collection</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts?.paymentCollection || []}>
                <defs>
                  <linearGradient id="colorPayment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: textColor, fontSize: 11 }} />
                <Tooltip contentStyle={{ background: dark ? '#1e293b' : '#fff', border: '1px solid #334155', borderRadius: 12, fontSize: 13 }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" fillOpacity={1} fill="url(#colorPayment)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="chart-card glass">
            <h3>Recent Sales</h3>
            <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: '.5rem' }}>
              {(charts?.recentSales || []).length === 0 ? (
                <p className="text-center py-4" style={{ color: 'var(--surface-500)', fontSize: '.875rem' }}>No recent sales</p>
              ) : (
                charts.recentSales.map((sale, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between py-2" style={{ borderBottom: '1px solid var(--surface-100)' }}>
                    <div>
                      <p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--surface-900)' }}>{sale.customer?.fullName || 'Walk-in'}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{sale.invoiceNumber}</p>
                    </div>
                    <div className="text-end">
                      <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--surface-900)' }}>{formatCurrency(sale.grandTotal)}</p>
                      <span className={`ct-badge ${sale.paymentStatus === 'paid' ? 'ct-badge-green' : sale.paymentStatus === 'partially_paid' ? 'ct-badge-amber' : 'ct-badge-red'}`}>
                        {sale.paymentStatus?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
