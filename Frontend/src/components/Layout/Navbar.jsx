import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Map, Package, ShieldCheck, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = [
    { to: '/', label: 'Explore Map', icon: <Map size={16} /> },
    ...(isLoggedIn ? [
      { to: '/my-listings', label: 'My Listings', icon: <Package size={16} /> },
      { to: '/messages', label: 'Messages', icon: <MessageCircle size={16} /> },
    ] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: <ShieldCheck size={16} /> }] : []),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon"><Leaf size={20} /></div>
          <span className="brand-text">Plant<span>Corner</span></span>
        </Link>

        <div className={`navbar-links ${open ? 'open' : ''}`}>
          {navLinks.map(l => (
            <Link
              key={l.to} to={l.to}
              className={`nav-link ${location.pathname === l.to ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.icon}{l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="user-menu">
              <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
              <span className="user-name">{user?.username}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
