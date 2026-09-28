import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    const res = await register({ username: form.username, email: form.email, password: form.password });
    if (res.success) {
      toast.success('Account created! Welcome to GeoPlant 🌿');
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
          <h1>Join GeoPlant</h1>
          <p>Connect with a community of plant lovers. Buy and sell locally with ease.</p>
          <div className="deco-leaves">🌿 🌱 🍃 🌾</div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card animate-fadeUp">
          <div className="auth-logo">
            <div className="auth-logo-icon"><Leaf size={24} /></div>
            <span>GeoPlant</span>
          </div>
          <h2>Create your account</h2>
          <p className="auth-sub">Start discovering local plants</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrap">
                <User size={16} className="input-icon" />
                <input className="input" type="text" placeholder="plantlover42"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <div className="input-wrap">
                <Mail size={16} className="input-icon" />
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input className="input" type="password" placeholder="••••••••"
                  value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
              </div>
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
