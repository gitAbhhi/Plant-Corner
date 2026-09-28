import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { plantsAPI } from '../services/api';
import PlantPopup from '../components/Map/PlantPopup';
import AddListingModal from '../components/Map/AddListingModal';
import BotanistAI from '../components/AI/BotanistAI';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import './MapPage.css';

// Custom green pin icon
const greenIcon = new L.DivIcon({
  html: `<div class="custom-pin">
    <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill="#4a7c59"/>
      <circle cx="16" cy="16" r="8" fill="white"/>
      <text x="16" y="20" text-anchor="middle" font-size="10" fill="#4a7c59">🌿</text>
    </svg>
  </div>`,
  className: '',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
});

function BoundsWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => { onBoundsChange(e.target.getBounds()); },
    zoomend: (e) => { onBoundsChange(e.target.getBounds()); },
  });
  return null;
}

export default function MapPage() {
  const { isLoggedIn } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPlants = useCallback(async (bounds) => {
    try {
      const params = { status: 'ACTIVE' };
      if (bounds) {
        params.swLat = bounds.getSouthWest().lat;
        params.swLng = bounds.getSouthWest().lng;
        params.neLat = bounds.getNorthEast().lat;
        params.neLng = bounds.getNorthEast().lng;
      }
      if (search) params.q = search;
      const res = await plantsAPI.getAll(params);
      setPlants(res.data || []);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  const handleListingAdded = (newPlant) => {
    setPlants(prev => [...prev, newPlant]);
    setShowAddModal(false);
    toast.success('Plant listed successfully! 🌿');
  };

  return (
    <div className="map-page">
      {/* Search bar overlay */}
      <div className="map-controls animate-fadeUp">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            className="search-input" placeholder="Search plants..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchPlants()}
          />
        </div>
        <div className="map-stats">
          <Leaf size={14} />
          <span>{plants.length} plants found</span>
        </div>
        {isLoggedIn && (
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> List a Plant
          </button>
        )}
      </div>

      {loading && (
        <div className="map-loading">
          <span className="spinner" /> Loading map...
        </div>
      )}

      <MapContainer
        center={[20, 0]} zoom={3} className="leaflet-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onBoundsChange={fetchPlants} />
        {plants.map(plant => (
          <Marker key={plant.id} position={[plant.latitude, plant.longitude]} icon={greenIcon}>
            <Popup><PlantPopup plant={plant} /></Popup>
          </Marker>
        ))}
      </MapContainer>

      {showAddModal && (
        <AddListingModal onClose={() => setShowAddModal(false)} onSuccess={handleListingAdded} />
      )}

      <BotanistAI />
    </div>
  );
}
