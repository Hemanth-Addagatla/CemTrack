import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingCart, Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [viewSale, setViewSale] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/sales', { params: { page, search, status: statusFilter, limit: 15 } });
      setSales(data.data); setPagination(data.pagination);
    } catch { toast.error('Failed to load sales'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, [page, search, statusFilter]);

  const handleView = async (id) => {
    try { const { data } = await api.get(`/sales/${id}`); setViewSale(data.data); }
    catch { toast.error('Failed to load sale'); }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Sales</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Track all sales and invoices</p>
        </div>
        <button onClick={() => navigate('/sales/new')} className="btn-primary-ct">
          <Plus size={16} /> New Sale
        </button>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
        <div className="ct-search flex-grow-1" style={{ maxWidth: '28rem' }}>
          <Search />
          <input type="text" placeholder="Search by invoice..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="ct-select" style={{ width: 'auto', maxWidth: '12rem' }}>
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="ct-card" style={{ overflow: 'hidden' }}>
        <div className="ct-table-wrap">
          <table className="ct-table" style={{ minWidth: 1000 }}>
            <thead><tr>
              <th className="text-start">Invoice</th><th className="text-start">Customer</th><th className="text-start">Date</th>
              <th className="text-end">Total</th><th className="text-end">Paid</th><th className="text-end">Balance</th>
              <th className="text-start">Status</th><th className="text-center">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={8} style={{ padding: '1rem' }}><div className="skeleton" style={{ height: 32 }} /></td></tr>
              )) : sales.length === 0 ? (
                <tr><td colSpan={8} className="text-center" style={{ padding: '3rem 0', color: 'var(--surface-500)' }}>
                  <ShoppingCart size={48} style={{ margin: '0 auto .75rem', display: 'block', color: 'var(--surface-300)' }} />No sales found
                </td></tr>
              ) : sales.map(s => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary-600)' }}>{s.invoiceNumber}</td>
                  <td style={{ color: 'var(--surface-900)' }}>{s.customer?.fullName || '-'}</td>
                  <td style={{ color: 'var(--surface-500)', fontSize: '.75rem' }}>{new Date(s.saleDate).toLocaleDateString('en-IN')}</td>
                  <td className="text-end" style={{ fontWeight: 600, color: 'var(--surface-900)' }}>₹{s.grandTotal?.toLocaleString('en-IN')}</td>
                  <td className="text-end" style={{ color: '#059669' }}>₹{s.amountPaid?.toLocaleString('en-IN')}</td>
                  <td className="text-end" style={{ color: '#e11d48' }}>₹{s.remainingBalance?.toLocaleString('en-IN')}</td>
                  <td><span className={`ct-badge ${s.paymentStatus === 'paid' ? 'ct-badge-green' : s.paymentStatus === 'partially_paid' ? 'ct-badge-amber' : s.paymentStatus === 'overdue' ? 'ct-badge-red' : 'ct-badge-gray'}`}>{s.paymentStatus?.replace('_', ' ')}</span></td>
                  <td className="text-center"><button onClick={() => handleView(s._id)} className="btn-icon"><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="ct-pagination">
            <span className="ct-pagination-info">Page {pagination.page} of {pagination.pages}</span>
            <div className="d-flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* View Sale Modal */}
      {viewSale && (
        <div className="ct-modal-overlay">
          <div className="ct-modal animate-fade-in">
            <div className="ct-modal-header">
              <h2>Invoice: {viewSale.invoiceNumber}</h2>
              <button onClick={() => setViewSale(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <div className="ct-modal-body">
              <div className="row g-3 mb-3" style={{ fontSize: '.875rem' }}>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Customer:</span><span style={{ marginLeft: '.5rem', fontWeight: 500, color: 'var(--surface-900)' }}>{viewSale.customer?.fullName}</span></div>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Date:</span><span style={{ marginLeft: '.5rem', fontWeight: 500, color: 'var(--surface-900)' }}>{new Date(viewSale.saleDate).toLocaleDateString('en-IN')}</span></div>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Payment:</span><span style={{ marginLeft: '.5rem', fontWeight: 500 }}>{viewSale.paymentMode}</span></div>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Status:</span><span style={{ marginLeft: '.5rem', fontWeight: 500, color: viewSale.paymentStatus === 'paid' ? '#059669' : '#d97706' }}>{viewSale.paymentStatus?.replace('_', ' ')}</span></div>
              </div>
              <h3 style={{ fontWeight: 600, color: 'var(--surface-900)', marginBottom: '.5rem' }}>Items</h3>
              <div className="mb-3">
                {viewSale.items?.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between mb-2" style={{ padding: '.75rem', borderRadius: '.75rem', background: 'var(--surface-50)' }}>
                    <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--surface-900)' }}>{item.description || item.brand}</p><p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{item.quantity} × ₹{item.unitPrice}</p></div>
                    <p style={{ fontWeight: 600, color: 'var(--surface-900)' }}>₹{item.total?.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--surface-200)', paddingTop: '.75rem', fontSize: '.875rem' }}>
                <div className="d-flex justify-content-between"><span style={{ color: 'var(--surface-500)' }}>Subtotal</span><span style={{ color: 'var(--surface-900)' }}>₹{viewSale.subtotal?.toLocaleString('en-IN')}</span></div>
                {viewSale.totalDiscount > 0 && <div className="d-flex justify-content-between"><span style={{ color: 'var(--surface-500)' }}>Discount</span><span style={{ color: '#059669' }}>-₹{viewSale.totalDiscount?.toLocaleString('en-IN')}</span></div>}
                {viewSale.totalGst > 0 && <div className="d-flex justify-content-between"><span style={{ color: 'var(--surface-500)' }}>GST</span><span>₹{viewSale.totalGst?.toLocaleString('en-IN')}</span></div>}
                <div className="d-flex justify-content-between mt-2 pt-2" style={{ borderTop: '1px solid var(--surface-200)', fontWeight: 700, fontSize: '1.125rem' }}><span>Grand Total</span><span>₹{viewSale.grandTotal?.toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between" style={{ color: '#059669' }}><span>Paid</span><span>₹{viewSale.amountPaid?.toLocaleString('en-IN')}</span></div>
                {viewSale.remainingBalance > 0 && <div className="d-flex justify-content-between" style={{ color: '#e11d48', fontWeight: 600 }}><span>Balance Due</span><span>₹{viewSale.remainingBalance?.toLocaleString('en-IN')}</span></div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
