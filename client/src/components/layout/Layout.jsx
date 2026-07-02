import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay d-lg-none" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div
        className="sidebar-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Sidebar collapsed={!isHovered} />
      </div>

      {/* Mobile sidebar */}
      <div className={`mobile-sidebar d-lg-none ${mobileOpen ? 'open' : ''}`}>
        <Sidebar collapsed={false} isMobile={true} onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div className={`main-content ${isHovered ? 'shifted' : ''}`}>
        <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
