import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  ShieldCheck, Users, Leaf, TrendingUp,
  Ban, CheckCircle, Trash2, Search, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPage.css';

export default function AdminPage() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([adminAPI.getMetrics(), adminAPI.getUsers()])
      .then(([mRes, uRes]) => {
        setMetrics(mRes.data);
        setUsers(uRes.data || []);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await adminAPI.unblockUser(userId);
        toast.success('User unblocked');
      } else {
        await adminAPI.blockUser(userId);
        toast.success('User blocked & JWT invalidated');
      }
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isBlocked: !isBlocked } : u
      ));
    } catch { toast.error('Action failed'); }
  };

  const handleRemoveListing = async (plantId) => {
    if (!confirm('Remove this listing from the platform?')) return;
    try {
      await adminAPI.removeListing(plantId);
      toast.success('Listing removed from map');
    } catch { toast.error('Failed to remove listing'); }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="admin-loading"><span className="spinner" /> Loading admin data...</div>
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title-row">
          <div className="admin-badge"><ShieldCheck size={16} /> Admin</div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Platform overview and moderation tools</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon users"><Users size={22} /></div>
          <div className="metric-body">
            <div className="metric-num">{metrics?.totalUsers ?? '—'}</div>
            <div className="metric-label">Total Users</div>
          </div>
          <div className="metric-trend up"><TrendingUp size={14} /> Live</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon plants"><Leaf size={22} /></div>
          <div className="metric-body">
            <div className="metric-num">{metrics?.activePlants ?? '—'}</div>
            <div className="metric-label">Active Listings</div>
          </div>
          <div className="metric-trend up"><TrendingUp size={14} /> On Map</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon sales"><TrendingUp size={22} /></div>
          <div className="metric-body">
            <div className="metric-num">{metrics?.totalSold ?? '—'}</div>
            <div className="metric-label">Completed Sales</div>
          </div>
          <div className="metric-trend">{metrics?.conversionRate ?? '0'}% rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon blocked"><Ban size={22} /></div>
          <div className="metric-body">
            <div className="metric-num">{metrics?.blockedUsers ?? '—'}</div>
            <div className="metric-label">Blocked Users</div>
          </div>
          <div className="metric-trend warn">Moderated</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview', 'users'].map(t => (
          <button
            key={t} className={`admin-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? <><TrendingUp size={14} /> Overview</> : <><Users size={14} /> Users</>}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="overview-section">
          <div className="overview-card card">
            <h3>Platform Health</h3>
            <div className="health-items">
              <div className="health-item">
                <span>Active Listings</span>
                <div className="health-bar">
                  <div className="health-fill" style={{ width: `${Math.min((metrics?.activePlants / 100) * 100, 100)}%` }} />
                </div>
                <span className="health-val">{metrics?.activePlants}</span>
              </div>
              <div className="health-item">
                <span>Conversion Rate</span>
                <div className="health-bar">
                  <div className="health-fill good" style={{ width: `${metrics?.conversionRate || 0}%` }} />
                </div>
                <span className="health-val">{metrics?.conversionRate || 0}%</span>
              </div>
              <div className="health-item">
                <span>Blocked / Total Users</span>
                <div className="health-bar">
                  <div className="health-fill warn" style={{ width: `${metrics?.totalUsers ? (metrics.blockedUsers / metrics.totalUsers) * 100 : 0}%` }} />
                </div>
                <span className="health-val">{metrics?.blockedUsers}/{metrics?.totalUsers}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="users-section">
          <div className="users-toolbar">
            <div className="search-bar">
              <Search size={15} className="search-icon" />
              <input
                className="search-input" placeholder="Search users..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => adminAPI.getUsers().then(r => setUsers(r.data || []))}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="users-table-wrap card">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Listings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className={u.isBlocked ? 'blocked-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">{u.username?.[0]?.toUpperCase()}</div>
                        <span>{u.username}</span>
                      </div>
                    </td>
                    <td className="email-cell">{u.email}</td>
                    <td className="date-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="center-cell">{u.activeListings ?? 0}</td>
                    <td>
                      <span className={`status-pill ${u.isBlocked ? 'blocked' : 'active'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className={`btn btn-sm ${u.isBlocked ? 'btn-outline' : 'btn-danger'}`}
                          onClick={() => handleBlock(u.id, u.isBlocked)}
                          title={u.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {u.isBlocked ? <CheckCircle size={13} /> : <Ban size={13} />}
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={6} className="empty-row">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
