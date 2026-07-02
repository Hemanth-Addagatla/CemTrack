import { useState, useEffect } from 'react';
import { Plus, Search, Package, Trash2, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

const CEMENT_BRANDS = ['ACC', 'Ultratech', 'Ambuja', 'Dalmia', 'Shree', 'Birla', 'Ramco', 'JK Cement', 'India Cements', 'Other'];
const STEEL_BRANDS = ['Tata Tiscon', 'JSW NeoSteel', 'SAIL', 'Kamdhenu', 'Vizag', 'Jindal', 'Rathi', 'Other'];
const CEMENT_TYPES = ['OPC', 'PPC', 'PSC', 'RHPC', 'LHC', 'WHC', 'Other'];
const GRADES = ['43 Grade', '53 Grade', '33 Grade', 'Other'];
const ROD_TYPES = ['TMT Bar', 'CTD Bar', 'Mild Steel Rod', 'Wire Rod', 'Other'];
const QUALITIES = ['Fe415', 'Fe500', 'Fe500D', 'Fe550', 'Fe550D', 'Fe600', 'Other'];
const DIAMETERS = [6, 8, 10, 12, 16, 20, 25, 32, 40];

export default function Inventory() {
  const [tab, setTab] = useState('cement');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/inventory/${tab}`, { params: { page, search, limit: 15 } });
      setData(res.data); setPagination(res.pagination);
    } catch { toast.error('Failed to fetch inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [tab, page, search]);

  const onSubmit = async (formData) => {
    try {
      if (editItem) { await api.put(`/inventory/${tab}/${editItem._id}`, formData); toast.success('Stock updated!'); }
      else { await api.post(`/inventory/${tab}`, formData); toast.success('Stock added!'); }
      setShowForm(false); setEditItem(null); reset(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stock entry?')) return;
    try { await api.delete(`/inventory/${tab}/${id}`); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Delete failed'); }
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Inventory</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Manage your cement and steel stock</p>
        </div>
        <button onClick={() => { closeForm(); setShowForm(true); }} className="btn-primary-ct">
          <Plus size={16} /> Add Stock
        </button>
      </div>

      <div className="ct-tabs mb-3">
        {['cement', 'steel'].map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }}
            className={`ct-tab text-capitalize ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      <div className="ct-search mb-4">
        <Search />
        <input type="text" placeholder="Search by brand, supplier, invoice..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="ct-card" style={{ overflow: 'hidden' }}>
        <div className="ct-table-wrap">
          <table className="ct-table" style={{ minWidth: 1000 }}>
            <thead>
              <tr>
                {tab === 'cement' ? (
                  <><th className="text-start">Brand</th><th className="text-start">Type</th><th className="text-start">Grade</th>
                    <th className="text-end">Stock</th><th className="text-end">Purchase ₹</th><th className="text-end">Selling ₹</th></>
                ) : (
                  <><th className="text-start">Brand</th><th className="text-start">Type</th><th className="text-start">Quality</th>
                    <th className="text-end">Dia (mm)</th><th className="text-end">Stock</th><th className="text-end">₹/unit</th></>
                )}
                <th className="text-start">Status</th><th className="text-start">Date</th><th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={9} style={{ padding: '1rem' }}><div className="skeleton" style={{ height: 32 }} /></td></tr>
              )) : data.length === 0 ? (
                <tr><td colSpan={9} className="text-center" style={{ padding: '3rem 0', color: 'var(--surface-500)' }}>
                  <Package size={48} style={{ margin: '0 auto .75rem', display: 'block', color: 'var(--surface-300)' }} />No inventory found
                </td></tr>
              ) : data.map(item => (
                <tr key={item._id}>
                  {tab === 'cement' ? (
                    <><td style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{item.brand}</td>
                      <td style={{ color: 'var(--surface-600)' }}>{item.cementType}</td>
                      <td style={{ color: 'var(--surface-600)' }}>{item.grade}</td>
                      <td className="text-end" style={{ fontWeight: 600, color: 'var(--surface-900)' }}>{item.currentStock}</td>
                      <td className="text-end" style={{ color: 'var(--surface-600)' }}>₹{item.purchasePrice}</td>
                      <td className="text-end" style={{ color: 'var(--surface-600)' }}>₹{item.sellingPrice}</td></>
                  ) : (
                    <><td style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{item.brand}</td>
                      <td style={{ color: 'var(--surface-600)' }}>{item.rodType}</td>
                      <td style={{ color: 'var(--surface-600)' }}>{item.quality}</td>
                      <td className="text-end" style={{ color: 'var(--surface-600)' }}>{item.diameterMM}mm</td>
                      <td className="text-end" style={{ fontWeight: 600, color: 'var(--surface-900)' }}>{item.currentStock}</td>
                      <td className="text-end" style={{ color: 'var(--surface-600)' }}>₹{item.sellingPrice}</td></>
                  )}
                  <td>
                    <span className={`ct-badge ${item.status === 'in-stock' ? 'ct-badge-green' : item.status === 'low-stock' ? 'ct-badge-amber' : 'ct-badge-red'}`}>
                      {item.status?.replace('-', ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--surface-500)', fontSize: '.75rem' }}>{new Date(item.dateReceived).toLocaleDateString('en-IN')}</td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <button onClick={() => openEdit(item)} className="btn-icon"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item._id)} className="btn-icon danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="ct-pagination">
            <span className="ct-pagination-info">Page {pagination.page} of {pagination.pages} ({pagination.total} items)</span>
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
              <h2>{editItem ? 'Edit' : 'Add'} {tab === 'cement' ? 'Cement' : 'Steel'} Stock</h2>
              <button onClick={closeForm} className="btn-icon"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="ct-modal-body">
              {tab === 'cement' ? (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-4"><label className="ct-label">Brand *</label><select {...register('brand', { required: true })} className="ct-select"><option value="">Select</option>{CEMENT_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                    <div className="col-sm-4"><label className="ct-label">Type *</label><select {...register('cementType', { required: true })} className="ct-select"><option value="">Select</option>{CEMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="col-sm-4"><label className="ct-label">Grade *</label><select {...register('grade', { required: true })} className="ct-select"><option value="">Select</option>{GRADES.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-4"><label className="ct-label">No. of Bags *</label><input type="number" {...register('bags', { required: true, valueAsNumber: true })} className="ct-input" /></div>
                    <div className="col-sm-4"><label className="ct-label">Purchase Price ₹ *</label><input type="number" {...register('purchasePrice', { required: true, valueAsNumber: true })} className="ct-input" /></div>
                    <div className="col-sm-4"><label className="ct-label">Selling Price ₹ *</label><input type="number" {...register('sellingPrice', { required: true, valueAsNumber: true })} className="ct-input" /></div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6"><label className="ct-label">Supplier Name</label><input {...register('supplierName')} className="ct-input" /></div>
                    <div className="col-sm-6"><label className="ct-label">Supplier Contact</label><input {...register('supplierContact')} className="ct-input" /></div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-4"><label className="ct-label">Vehicle Number</label><input {...register('vehicleNumber')} className="ct-input" /></div>
                    <div className="col-sm-4"><label className="ct-label">Driver Name</label><input {...register('driverName')} className="ct-input" /></div>
                    <div className="col-sm-4"><label className="ct-label">Invoice Number</label><input {...register('invoiceNumber')} className="ct-input" /></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-4"><label className="ct-label">Brand *</label><select {...register('brand', { required: true })} className="ct-select"><option value="">Select</option>{STEEL_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                    <div className="col-sm-4"><label className="ct-label">Rod Type *</label><select {...register('rodType', { required: true })} className="ct-select"><option value="">Select</option>{ROD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="col-sm-4"><label className="ct-label">Quality *</label><select {...register('quality', { required: true })} className="ct-select"><option value="">Select</option>{QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}</select></div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-3"><label className="ct-label">Diameter (mm) *</label><select {...register('diameterMM', { required: true, valueAsNumber: true })} className="ct-select"><option value="">Select</option>{DIAMETERS.map(d => <option key={d} value={d}>{d}mm</option>)}</select></div>
                    <div className="col-sm-3"><label className="ct-label">Quantity *</label><input type="number" {...register('quantity', { required: true, valueAsNumber: true })} className="ct-input" /></div>
                    <div className="col-sm-3"><label className="ct-label">Purchase ₹ *</label><input type="number" {...register('purchasePrice', { required: true, valueAsNumber: true })} className="ct-input" /></div>
                    <div className="col-sm-3"><label className="ct-label">Selling ₹ *</label><input type="number" {...register('sellingPrice', { required: true, valueAsNumber: true })} className="ct-input" /></div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-sm-6"><label className="ct-label">Supplier Name</label><input {...register('supplierName')} className="ct-input" /></div>
                    <div className="col-sm-6"><label className="ct-label">Vehicle Number</label><input {...register('vehicleNumber')} className="ct-input" /></div>
                  </div>
                </>
              )}
              <div className="row g-3 mb-3">
                <div className="col-sm-6"><label className="ct-label">Storage Location</label><input {...register('storageLocation')} className="ct-input" /></div>
                <div className="col-sm-6"><label className="ct-label">Remarks</label><input {...register('remarks')} className="ct-input" /></div>
              </div>
              <div className="d-flex gap-3 mt-3">
                <button type="submit" className="btn-primary-ct flex-grow-1">{editItem ? 'Update Stock' : 'Add Stock'}</button>
                <button type="button" onClick={closeForm} className="btn-outline-ct">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
