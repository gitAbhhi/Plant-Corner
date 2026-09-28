import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-deco">
        <div className="deco-circle deco-1" />
        <div className="deco-circle deco-2" />
        <div className="deco-text">
          <h1>GeoPlant</h1>
          <p>Discover plants near you, connect with local growers, and grow your garden.</p>
          <div className="deco-leaves">🌿 🌱 🍃 🌾</div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card animate-fadeUp">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Leaf size={24} /></div>
            <span>GeoPlant</span>
          </div>
          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input
                  className="input"
                  type="email" placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
