import { useState, useEffect } from 'react';
import { plantsAPI } from '../services/api';
import { Leaf, Plus, CheckCircle, Trash2, MapPin, DollarSign, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AddListingModal from '../components/Map/AddListingModal';
import './MyListingsPage.css';

const STATUS_COLORS = {
  ACTIVE: { bg: '#e8f5ec', color: '#2d6a4f', label: 'Active' },
  SOLD: { bg: '#fef3c7', color: '#92400e', label: 'Sold' },
  REMOVED: { bg: '#fee2e2', color: '#991b1b', label: 'Removed' },
};

export default function MyListingsPage() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const res = await plantsAPI.getMine();
      setPlants(res.data || []);
    } catch {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleMarkSold = async (id) => {
    try {
      await plantsAPI.markSold(id);
      setPlants(prev => prev.map(p => p.id === id ? { ...p, status: 'SOLD' } : p));
      toast.success('Marked as sold!');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try {
      await plantsAPI.delete(id);
      setPlants(prev => prev.filter(p => p.id !== id));
      toast.success('Listing removed');
    } catch { toast.error('Failed to remove'); }
  };

  const stats = {
    total: plants.length,
    active: plants.filter(p => p.status === 'ACTIVE').length,
    sold: plants.filter(p => p.status === 'SOLD').length,
  };

  return (
    <div className="listings-page">
      <div className="listings-header">
        <div>
          <h1 className="page-title"><Leaf size={24} /> My Listings</h1>
          <p className="page-sub">Manage your plant listings on the marketplace</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> New Listing
        </button>
      </div>

      {/* Stats */}
      <div className="listings-stats">
        <div className="stat-card">
          <div className="stat-icon total"><Package size={20} /></div>
          <div><div className="stat-num">{stats.total}</div><div className="stat-label">Total</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><Leaf size={20} /></div>
          <div><div className="stat-num">{stats.active}</div><div className="stat-label">Active</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon sold"><CheckCircle size={20} /></div>
          <div><div className="stat-num">{stats.sold}</div><div className="stat-label">Sold</div></div>
        </div>
      </div>

      {loading ? (
        <div className="listings-loading"><span className="spinner" /> Loading your listings...</div>
      ) : plants.length === 0 ? (
        <div className="listings-empty">
          <Leaf size={48} />
          <h3>No listings yet</h3>
          <p>Start selling your plants to the local community</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Create First Listing
          </button>
        </div>
      ) : (
        <div className="listings-grid">
          {plants.map(plant => {
            const statusStyle = STATUS_COLORS[plant.status] || STATUS_COLORS.ACTIVE;
            return (
              <div key={plant.id} className="listing-card card">
                <div className="listing-img-wrap">
                  {plant.imageUrl
                    ? <img src={plant.imageUrl} alt={plant.title} className="listing-img" />
                    : <div className="listing-img-placeholder"><Leaf size={28} /></div>
                  }
                  <div
                    className="listing-status-badge"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}
                  >
                    {statusStyle.label}
                  </div>
                </div>

                <div className="listing-body">
                  <h3 className="listing-title">{plant.title}</h3>
                  <p className="listing-desc">{plant.description || 'No description provided.'}</p>

                  <div className="listing-meta">
                    <span className="listing-price"><DollarSign size={14} />{plant.price}</span>
                    <span className="listing-coords">
                      <MapPin size={12} />
                      {plant.latitude?.toFixed(3)}, {plant.longitude?.toFixed(3)}
                    </span>
                  </div>

                  <div className="listing-actions">
                    {plant.status === 'ACTIVE' && (
                      <button className="btn btn-outline btn-sm" onClick={() => handleMarkSold(plant.id)}>
                        <CheckCircle size={14} /> Mark Sold
                      </button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plant.id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <AddListingModal
          onClose={() => setShowAdd(false)}
          onSuccess={(p) => { setPlants(prev => [p, ...prev]); setShowAdd(false); toast.success('Plant listed! 🌿'); }}
        />
      )}
    </div>
  );
}
