import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      {/* Animated background blobs */}
      <div className="login-blob" style={{ top: '25%', left: '-80px', width: '384px', height: '384px', background: 'rgba(79,70,229,.2)', animation: 'float 6s ease-in-out infinite' }} />
      <div className="login-blob" style={{ bottom: '25%', right: '-80px', width: '384px', height: '384px', background: 'rgba(99,102,241,.15)', animation: 'float 6s ease-in-out infinite 1s' }} />
      <div className="login-blob" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', background: 'rgba(99,102,241,.05)' }} />

      {/* Login card */}
      <div className="login-card animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{ width: 64, height: 64, margin: '0 auto', borderRadius: '1rem', background: 'linear-gradient(135deg,var(--primary-500),var(--primary-700))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,.3)', marginBottom: '1rem' }}>
            <Building2 size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.025em' }}>CemTrack</h1>
          <p style={{ color: 'var(--surface-500)', fontSize: '.875rem', marginTop: '.25rem' }}>Cement & Steel Inventory Management</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--surface-300)', marginBottom: '.75rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-500)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@cemtrack.com" className="login-input" style={{ paddingLeft: '2.75rem' }} />
            </div>
          </div>

          <div className="mb-4">
            <label style={{ display: 'block', fontWeight: 600, color: 'var(--surface-300)', marginBottom: '.75rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-500)' }} />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="login-input" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--surface-500)', cursor: 'pointer', padding: 0 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary-ct w-100 justify-content-center" style={{ padding: '.75rem', fontSize: '.9rem', fontWeight: 600 }}>
            {loading ? (
              <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center mt-4" style={{ color: 'var(--surface-500)', fontSize: '.75rem' }}>
          Protected system access. Authorized personnel only.
        </p>
      </div>
    </div>
  );
}
