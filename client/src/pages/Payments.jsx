import { useState, useEffect } from 'react';
import { CreditCard, Phone, MessageCircle, Clock, AlertTriangle, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Payments() {
  const [tab, setTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('cash');
  const [payRef, setPayRef] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, r, all] = await Promise.all([api.get('/payments/pending'), api.get('/payments/reminders'), api.get('/payments?limit=50')]);
      setPending(p.data.data); setReminders(r.data.data); setPayments(all.data.data);
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleRecordPayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) return toast.error('Enter valid amount');
    try {
      await api.post('/payments', { sale: showPayment._id, amount: Number(payAmount), paymentMode: payMode, reference: payRef });
      toast.success('Payment recorded!');
      setShowPayment(null); setPayAmount(''); setPayRef('');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock, count: pending.length },
    { id: 'reminders', label: 'Reminders', icon: AlertTriangle, count: reminders.length },
    { id: 'all', label: 'All Payments', icon: CreditCard, count: payments.length },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--surface-900)' }}>Payments</h1>
        <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Track and manage customer payments</p>
      </div>

      <div className="ct-tabs mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`ct-tab ${tab === t.id ? 'active' : ''}`}>
            <t.icon size={16} /> {t.label}
            {t.count > 0 && <span className="ct-badge ct-badge-indigo" style={{ marginLeft: '.25rem' }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {loading ? <div>{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton mb-3" style={{ height: 80 }} />)}</div> : (
        <>
          {tab === 'pending' && (
            <div>
              {pending.length === 0 ? <p className="text-center" style={{ padding: '3rem 0', color: 'var(--surface-500)' }}>No pending payments 🎉</p> :
                pending.map(s => (
                  <div key={s._id} className="ct-card d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3" style={{ padding: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{s.customer?.fullName}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{s.invoiceNumber} • {new Date(s.saleDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="text-end">
                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e11d48' }}>₹{s.remainingBalance?.toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>of ₹{s.grandTotal?.toLocaleString('en-IN')}</p>
                      </div>
                      <button onClick={() => setShowPayment(s)} className="btn-primary-ct" style={{ whiteSpace: 'nowrap' }}>Record Payment</button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'reminders' && (
            <div>
              {reminders.length === 0 ? <p className="text-center" style={{ padding: '3rem 0', color: 'var(--surface-500)' }}>No due reminders</p> :
                reminders.map((r, i) => (
                  <div key={i} className="ct-card d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3" style={{ padding: '1rem' }}>
                    <div>
                      <p style={{ fontWeight: 500, color: 'var(--surface-900)' }}>{r.customerName}</p>
                      <p style={{ fontSize: '.75rem', color: 'var(--surface-500)' }}>{r.phone} • Due: {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : 'Not set'}</p>
                      {r.daysRemaining !== null && <p style={{ fontSize: '.75rem', fontWeight: 500, marginTop: '.125rem', color: r.daysRemaining < 0 ? '#e11d48' : r.daysRemaining <= 3 ? '#d97706' : 'var(--surface-500)' }}>
                        {r.daysRemaining < 0 ? `${Math.abs(r.daysRemaining)} days overdue` : `${r.daysRemaining} days remaining`}
                      </p>}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e11d48', marginRight: '.75rem' }}>₹{r.amountDue?.toLocaleString('en-IN')}</p>
                      <a href={`tel:${r.phone}`} className="btn-icon" style={{ background: '#ecfdf5', color: '#059669' }}><Phone size={16} /></a>
                      <a href={`https://wa.me/91${r.phone}?text=Dear ${r.customerName}, your payment of ₹${r.amountDue} is pending. Please make the payment at your earliest convenience. - CemTrack`}
                        target="_blank" rel="noopener" className="btn-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><MessageCircle size={16} /></a>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {tab === 'all' && (
            <div className="ct-card" style={{ overflow: 'hidden' }}>
              <table className="ct-table">
                <thead><tr>
                  <th className="text-start">Customer</th><th className="text-start">Invoice</th>
                  <th className="text-end">Amount</th><th className="text-start">Mode</th><th className="text-start">Date</th>
                </tr></thead>
                <tbody>{payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ color: 'var(--surface-900)' }}>{p.customer?.fullName}</td>
                    <td style={{ color: 'var(--primary-600)' }}>{p.sale?.invoiceNumber}</td>
                    <td className="text-end" style={{ fontWeight: 600, color: '#059669' }}>₹{p.amount?.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--surface-500)', textTransform: 'capitalize' }}>{p.paymentMode?.replace('_', ' ')}</td>
                    <td style={{ color: 'var(--surface-500)', fontSize: '.75rem' }}>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}

      {showPayment && (
        <div className="ct-modal-overlay" style={{ alignItems: 'center' }}>
          <div className="ct-modal ct-modal-sm animate-fade-in" style={{ padding: '1.5rem' }}>
            <div className="d-flex justify-content-between mb-3">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--surface-900)' }}>Record Payment</h2>
              <button onClick={() => setShowPayment(null)} className="btn-icon"><X size={20} /></button>
            </div>
            <p style={{ fontSize: '.875rem', color: 'var(--surface-500)', marginBottom: '.25rem' }}>{showPayment.invoiceNumber} • {showPayment.customer?.fullName}</p>
            <p style={{ fontSize: '.875rem', marginBottom: '1rem' }}>Balance: <span style={{ fontWeight: 700, color: '#e11d48' }}>₹{showPayment.remainingBalance?.toLocaleString('en-IN')}</span></p>
            <div className="mb-3"><label className="ct-label">Amount ₹</label><input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} max={showPayment.remainingBalance} className="ct-input" /></div>
            <div className="mb-3"><label className="ct-label">Mode</label>
              <select value={payMode} onChange={e => setPayMode(e.target.value)} className="ct-select">
                <option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option>
              </select></div>
            <div className="mb-3"><label className="ct-label">Reference</label><input value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="UPI ref / Cheque no" className="ct-input" /></div>
            <button onClick={handleRecordPayment} className="btn-primary-ct w-100 justify-content-center">Record Payment</button>
          </div>
        </div>
      )}
    </div>
  );
}
