import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, Receipt, BarChart3, Bell, Settings, ChevronLeft, Building2 } from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/inventory', icon: Package, label: 'Inventory' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, isMobile, onClose }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Building2 size={20} />
        </div>
        {!collapsed && (
          <div className="animate-fade-in" style={{ overflow: 'hidden' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--surface-900)', letterSpacing: '-0.025em' }} className="font-heading">CemTrack</h1>
            <p style={{ fontSize: '10px', color: 'var(--surface-400)', letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 500, marginTop: '-2px' }}>Inventory Pro</p>
          </div>
        )}
        {isMobile && (
          <button onClick={onClose} className="btn-icon ms-auto d-lg-none">
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} style={{ opacity: isActive ? 1 : 0.75 }} />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ height: '1.5rem' }} />
    </aside>
  );
}
