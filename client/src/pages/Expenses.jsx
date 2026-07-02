import { useState, useEffect } from 'react';
import { Plus, Receipt, Trash2, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Employee Salaries', 'Shop Rent', 'Electricity Bill', 'Water Bill', 'Transportation', 'Vehicle Fuel', 'GST Payments', 'Taxes', 'Maintenance', 'Miscellaneous'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses', { params: { page, category, limit: 15 } });
      setExpenses(data.data); setPagination(data.pagination);
    } catch { toast.error('Failed to fetch expenses'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, category]);

  const onSubmit = async (formData) => {
    try {
      if (editItem) { await api.put(`/expenses/${editItem._id}`, formData); toast.success('Updated!'); }
      else { await api.post('/expenses', formData); toast.success('Expense added!'); }
      closeForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try { await api.delete(`/expenses/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
  };
  const openEdit = (item) => { setEditItem(item); Object.entries(item).forEach(([k, v]) => { if (k !== '_id') setValue(k, k === 'date' ? v?.slice(0, 10) : v); }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); reset(); };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-3 mb-4">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Expenses</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Track all business expenses</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary-ct"><Plus size={16} /> Add Expense</button>
      </div>

      <div className="ct-pills mb-4">
        <button onClick={() => { setCategory(''); setPage(1); }} className={`ct-pill ${!category ? 'active' : ''}`}>All</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={`ct-pill ${category === c ? 'active' : ''}`}>{c}</button>
        ))}
      </div>

      <div className="ct-card" style={{ overflow: 'hidden' }}>
        <div className="ct-table-wrap">
          <table className="ct-table" style={{ minWidth: 800 }}>
            <thead><tr>
              <th className="text-start">Category</th><th className="text-end">Amount</th><th className="text-start">Description</th>
              <th className="text-start">Date</th><th className="text-center">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={5} style={{ padding: '1rem' }}><div className="skeleton" style={{ height: 32 }} /></td></tr>) :
              expenses.length === 0 ? <tr><td colSpan={5} className="text-center" style={{ padding: '3rem 0', color: 'var(--surface-500)' }}><Receipt size={48} style={{ margin: '0 auto .75rem', display: 'block', color: 'var(--surface-300)' }} />No expenses found</td></tr> :
              expenses.map(e => (
                <tr key={e._id}>
                  <td><span className="ct-badge ct-badge-gray">{e.category}</span></td>
                  <td className="text-end" style={{ fontWeight: 600, color: 'var(--surface-900)' }}>₹{e.amount?.toLocaleString('en-IN')}</td>
                  <td style={{ color: 'var(--surface-600)', maxWidth: '16rem' }} className="truncate">{e.description || '-'}</td>
                  <td style={{ color: 'var(--surface-500)', fontSize: '.75rem' }}>{new Date(e.date).toLocaleDateString('en-IN')}</td>
                  <td className="text-center">
                    <button onClick={() => openEdit(e)} className="btn-icon"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(e._id)} className="btn-icon danger"><Trash2 size={16} /></button>
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

      {showForm && (
        <div className="ct-modal-overlay" style={{ alignItems: 'center' }}>
          <div className="ct-modal ct-modal-sm animate-fade-in">
            <div className="ct-modal-header">
              <h2>{editItem ? 'Edit' : 'Add'} Expense</h2>
              <button onClick={closeForm} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="ct-modal-body">
              <div className="mb-3"><label className="ct-label">Category *</label>
                <select {...register('category', { required: true })} className="ct-select"><option value="">Select</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="mb-3"><label className="ct-label">Amount ₹ *</label><input type="number" {...register('amount', { required: true, valueAsNumber: true })} className="ct-input" /></div>
              <div className="mb-3"><label className="ct-label">Date *</label><input type="date" {...register('date', { required: true })} className="ct-input" /></div>
              <div className="mb-3"><label className="ct-label">Description</label><textarea {...register('description')} rows={2} className="ct-input" style={{ resize: 'none' }} /></div>
              <div className="d-flex gap-3">
                <button type="submit" className="btn-primary-ct flex-grow-1">{editItem ? 'Update' : 'Add'}</button>
                <button type="button" onClick={closeForm} className="btn-outline-ct">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
