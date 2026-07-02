import { useState, useEffect } from 'react';
import { Plus, Search, Users, Eye, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { page, search, limit: 15 } });
      setCustomers(data.data); setPagination(data.pagination);
    } catch { toast.error('Failed to fetch customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const onSubmit = async (formData) => {
    try {
      if (editItem) { await api.put(`/customers/${editItem._id}`, formData); toast.success('Customer updated!'); }
      else { await api.post('/customers', formData); toast.success('Customer added!'); }
      closeForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await api.delete(`/customers/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };

  const handleView = async (id) => {
    try { const { data } = await api.get(`/customers/${id}`); setViewCustomer(data.data); }
    catch { toast.error('Failed to load customer'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    Object.entries(item).forEach(([key, val]) => { if (key !== '_id' && key !== '__v') setValue(key, val); });
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Customers</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Manage customer records and purchase history</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary-ct">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="ct-search mb-4">
        <Search />
        <input type="text" placeholder="Search by name, mobile, city..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="ct-card" style={{ overflow: 'hidden' }}>
        <div className="ct-table-wrap">
          <table className="ct-table">
            <thead><tr>
              <th className="text-start">Name</th><th className="text-start">Mobile</th><th className="text-start">City</th>
              <th className="text-end">Total Purchases</th><th className="text-end">Outstanding</th><th className="text-center">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} style={{ padding: '1rem' }}><div className="skeleton" style={{ height: 32 }} /></td></tr>
              )) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center" style={{ padding: '3rem 0', color: 'var(--surface-500)' }}>
                  <Users size={48} style={{ margin: '0 auto .75rem', display: 'block', color: 'var(--surface-300)' }} />No customers found
                </td></tr>
              ) : customers.map(c => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{c.fullName}</td>
                  <td style={{ color: 'var(--surface-600)' }}>{c.mobile}</td>
                  <td style={{ color: 'var(--surface-500)' }}>{c.city || c.village || '-'}</td>
                  <td className="text-end" style={{ fontWeight: 600, color: 'var(--surface-900)' }}>₹{(c.totalPurchases || 0).toLocaleString('en-IN')}</td>
                  <td className="text-end"><span style={{ color: c.outstandingBalance > 0 ? '#e11d48' : '#059669', fontWeight: 600 }}>₹{(c.outstandingBalance || 0).toLocaleString('en-IN')}</span></td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <button onClick={() => handleView(c._id)} className="btn-icon"><Eye size={18} /></button>
                      <button onClick={() => openEdit(c)} className="btn-icon"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(c._id)} className="btn-icon danger"><Trash2 size={18} /></button>
                    </div>
                  </td>
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="ct-modal-overlay">
          <div className="ct-modal animate-fade-in">
            <div className="ct-modal-header">
              <h2>{editItem ? 'Edit' : 'Add'} Customer</h2>
              <button onClick={closeForm} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="ct-modal-body">
              <div className="row g-3 mb-3">
                <div className="col-sm-6"><label className="ct-label">Full Name *</label><input {...register('fullName', { required: true })} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Mobile *</label><input {...register('mobile', { required: true })} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Alternate Mobile</label><input {...register('alternateMobile')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Village</label><input {...register('village')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">City</label><input {...register('city')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">State</label><input {...register('state')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">PIN Code</label><input {...register('pinCode')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Referred By</label><input {...register('referredBy')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Constructor Name</label><input {...register('constructorName')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Constructor Mobile</label><input {...register('constructorMobile')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Total Purchases</label><input {...register('constructorMobile')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Total Paid</label><input {...register('constructorMobile')} className="ct-input" /></div>
              </div>
              <div className="mb-3"><label className="ct-label">Address</label><textarea {...register('address')} rows={2} className="ct-input" style={{ resize: 'none' }} /></div>
              <div className="d-flex gap-3">
                <button type="submit" className="btn-primary-ct flex-grow-1">{editItem ? 'Update' : 'Add'} Customer</button>
                <button type="button" onClick={closeForm} className="btn-outline-ct">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {viewCustomer && (
        <div className="ct-modal-overlay">
          <div className="ct-modal animate-fade-in">
            <div className="ct-modal-header">
              <h2>{viewCustomer.fullName}</h2>
              <button onClick={() => setViewCustomer(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <div className="ct-modal-body">
              <div className="row g-3 mb-4" style={{ fontSize: '.875rem' }}>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Mobile:</span> <span style={{ fontWeight: 500, color: 'var(--surface-900)', marginLeft: '.5rem' }}>{viewCustomer.mobile}</span></div>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>City:</span> <span style={{ fontWeight: 500, color: 'var(--surface-900)', marginLeft: '.5rem' }}>{viewCustomer.city || '-'}</span></div>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Total Purchases:</span> <span style={{ fontWeight: 500, color: 'var(--surface-900)', marginLeft: '.5rem' }}>₹{(viewCustomer.totalPurchases || 0).toLocaleString('en-IN')}</span></div>
                <div className="col-6"><span style={{ color: 'var(--surface-500)' }}>Outstanding:</span> <span style={{ fontWeight: 500, marginLeft: '.5rem', color: viewCustomer.outstandingBalance > 0 ? '#e11d48' : '#059669' }}>₹{(viewCustomer.outstandingBalance || 0).toLocaleString('en-IN')}</span></div>
              </div>
              <h3 style={{ fontWeight: 600, color: 'var(--surface-900)', marginBottom: '.75rem' }}>Purchase History</h3>
              {viewCustomer.purchases?.length ? viewCustomer.purchases.map((p, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-2" style={{ padding: '.75rem', borderRadius: '.75rem', background: 'var(--surface-50)' }}>
                  <div><p style={{ fontSize: '.875rem', fontWeight: 500, color: 'var(--surface-900)' }}>{p.invoiceNumber}</p><p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{new Date(p.saleDate).toLocaleDateString('en-IN')}</p></div>
                  <div className="text-end"><p style={{ fontWeight: 600, color: 'var(--surface-900)' }}>₹{p.grandTotal?.toLocaleString('en-IN')}</p>
                    <span className={`ct-badge ${p.paymentStatus === 'paid' ? 'ct-badge-green' : 'ct-badge-amber'}`}>{p.paymentStatus?.replace('_', ' ')}</span>
                  </div>
                </div>
              )) : <p className="text-center" style={{ padding: '1rem', color: 'var(--surface-500)', fontSize: '.875rem' }}>No purchases yet</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
