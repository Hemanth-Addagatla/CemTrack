import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Search } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NewSale() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cementStock, setCementStock] = useState([]);
  const [steelStock, setSteelStock] = useState([]);
  const [items, setItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const [c, s] = await Promise.all([api.get('/inventory/cement?limit=200'), api.get('/inventory/steel?limit=200')]);
        setCementStock(c.data.data); setSteelStock(s.data.data);
      } catch {}
    };
    fetchStock();
  }, []);

  useEffect(() => {
    if (customerSearch.length >= 2) {
      api.get(`/customers?search=${customerSearch}&limit=10`).then(r => setCustomers(r.data.data)).catch(() => {});
    }
  }, [customerSearch]);

  const addItem = () => setItems([...items, { productType: 'cement', product: '', quantity: 1, unitPrice: 0, discount: 0, gst: 0 }]);

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    if (field === 'product') {
      const type = updated[index].productType;
      const stock = type === 'cement' ? cementStock : steelStock;
      const found = stock.find(s => s._id === value);
      if (found) updated[index].unitPrice = found.sellingPrice;
    }
    const qty = Number(updated[index].quantity) || 0;
    const price = Number(updated[index].unitPrice) || 0;
    const disc = Number(updated[index].discount) || 0;
    const gst = Number(updated[index].gst) || 0;
    updated[index].total = (qty * price) - disc + gst;
    setItems(updated);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice) || 0), 0);
  const totalDiscount = items.reduce((s, i) => s + (Number(i.discount) || 0), 0);
  const totalGst = items.reduce((s, i) => s + (Number(i.gst) || 0), 0);
  const grandTotal = subtotal - totalDiscount + totalGst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return toast.error('Select a customer');
    if (items.length === 0) return toast.error('Add at least one item');
    if (items.some(i => !i.product)) return toast.error('Select product for all items');
    setLoading(true);
    try {
      const saleItems = items.map(i => ({
        productType: i.productType, product: i.product,
        quantity: Number(i.quantity), unitPrice: Number(i.unitPrice),
        discount: Number(i.discount) || 0, gst: Number(i.gst) || 0,
        total: (Number(i.quantity) * Number(i.unitPrice)) - (Number(i.discount) || 0) + (Number(i.gst) || 0)
      }));
      await api.post('/sales', { customer: selectedCustomer._id, items: saleItems, amountPaid: Number(amountPaid) || 0, paymentMode, dueDate: dueDate || undefined, remarks });
      toast.success('Sale created successfully!');
      navigate('/sales');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create sale'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)', marginBottom: '1.5rem' }}>New Sale</h1>

      <form onSubmit={handleSubmit}>
        {/* Customer */}
        <div className="ct-card mb-4" style={{ padding: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '.75rem' }}>Customer</h2>
          {selectedCustomer ? (
            <div className="d-flex align-items-center justify-content-between" style={{ padding: '.75rem', borderRadius: '.75rem', background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
              <div><p style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{selectedCustomer.fullName}</p><p style={{ fontSize: '.875rem', color: 'var(--surface-500)' }}>{selectedCustomer.mobile}</p></div>
              <button type="button" onClick={() => setSelectedCustomer(null)} style={{ fontSize: '.875rem', color: 'var(--primary-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Change</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div className="ct-search" style={{ maxWidth: '100%' }}>
                <Search />
                <input type="text" placeholder="Search customer by name or mobile..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
              </div>
              {customers.length > 0 && customerSearch.length >= 2 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '.25rem', background: '#fff', borderRadius: '.75rem', boxShadow: '0 20px 60px rgba(0,0,0,.12)', border: '1px solid var(--surface-200)', maxHeight: '12rem', overflowY: 'auto', zIndex: 10 }}>
                  {customers.map(c => (
                    <button key={c._id} type="button" onClick={() => { setSelectedCustomer(c); setCustomerSearch(''); setCustomers([]); }}
                      style={{ width: '100%', textAlign: 'left', padding: '.625rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.875rem' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--surface-50)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                      <p style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{c.fullName}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{c.mobile} • {c.city || c.village || ''}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="ct-card mb-4" style={{ padding: '1.25rem' }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--surface-900)' }}>Items</h2>
            <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.875rem', color: 'var(--primary-600)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
              <Plus size={16} /> Add Item
            </button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="mb-3" style={{ padding: '1rem', borderRadius: '.75rem', background: 'var(--surface-50)', border: '1px solid var(--surface-200)' }}>
              <div className="row g-3 mb-2">
                <div className="col-6 col-sm-3">
                  <select value={item.productType} onChange={e => updateItem(index, 'productType', e.target.value)} className="ct-select">
                    <option value="cement">Cement</option><option value="steel">Steel</option>
                  </select>
                </div>
                <div className="col-6 col-sm-7">
                  <select value={item.product} onChange={e => updateItem(index, 'product', e.target.value)} className="ct-select">
                    <option value="">Select Product</option>
                    {(item.productType === 'cement' ? cementStock : steelStock).filter(s => s.currentStock > 0).map(s => (
                      <option key={s._id} value={s._id}>
                        {item.productType === 'cement' ? `${s.brand} ${s.cementType} ${s.grade} (${s.currentStock} bags)` : `${s.brand} ${s.diameterMM}mm ${s.quality} (${s.currentStock} ${s.unit})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-auto">
                  <button type="button" onClick={() => removeItem(index)} className="btn-icon danger" style={{ marginTop: '.25rem' }}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-6 col-sm-3"><label style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginBottom: '.125rem', display: 'block' }}>Qty</label><input type="number" value={item.quantity} min={1} onChange={e => updateItem(index, 'quantity', e.target.value)} className="ct-input" /></div>
                <div className="col-6 col-sm-3"><label style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginBottom: '.125rem', display: 'block' }}>Price ₹</label><input type="number" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', e.target.value)} className="ct-input" /></div>
                <div className="col-6 col-sm-3"><label style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginBottom: '.125rem', display: 'block' }}>Discount ₹</label><input type="number" value={item.discount} onChange={e => updateItem(index, 'discount', e.target.value)} className="ct-input" /></div>
                <div className="col-6 col-sm-3"><label style={{ fontSize: '.75rem', color: 'var(--surface-500)', marginBottom: '.125rem', display: 'block' }}>GST ₹</label><input type="number" value={item.gst} onChange={e => updateItem(index, 'gst', e.target.value)} className="ct-input" /></div>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-center" style={{ padding: '1.5rem 0', color: 'var(--surface-500)', fontSize: '.875rem' }}>Click "Add Item" to begin</p>}
        </div>

        {/* Payment & Summary */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="ct-card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '.75rem' }}>Payment</h2>
              <div className="mb-3"><label className="ct-label">Payment Mode</label>
                <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)} className="ct-select">
                  <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option><option value="credit">Credit</option>
                </select></div>
              <div className="mb-3"><label className="ct-label">Amount Paid ₹</label><input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0" className="ct-input" /></div>
              <div className="mb-3"><label className="ct-label">Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="ct-input" /></div>
              <div><label className="ct-label">Remarks</label><input value={remarks} onChange={e => setRemarks(e.target.value)} className="ct-input" /></div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="ct-card" style={{ padding: '1.25rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--surface-900)', marginBottom: '.75rem' }}>Summary</h2>
              <div style={{ fontSize: '.875rem' }}>
                <div className="d-flex justify-content-between mb-1"><span style={{ color: 'var(--surface-500)' }}>Subtotal</span><span style={{ color: 'var(--surface-900)' }}>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between mb-1"><span style={{ color: 'var(--surface-500)' }}>Discount</span><span style={{ color: '#059669' }}>-₹{totalDiscount.toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between mb-1"><span style={{ color: 'var(--surface-500)' }}>GST</span><span style={{ color: 'var(--surface-900)' }}>₹{totalGst.toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between pt-2 mt-2" style={{ borderTop: '1px solid var(--surface-200)', fontWeight: 700, fontSize: '1.125rem' }}><span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between" style={{ color: '#059669' }}><span>Paid</span><span>₹{(Number(amountPaid) || 0).toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between" style={{ color: '#e11d48', fontWeight: 600 }}><span>Balance</span><span>₹{Math.max(0, grandTotal - (Number(amountPaid) || 0)).toLocaleString('en-IN')}</span></div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary-ct w-100 justify-content-center mt-3" style={{ padding: '.75rem' }}>
                {loading ? 'Creating...' : 'Create Sale & Generate Invoice'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
