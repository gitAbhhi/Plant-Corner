import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, MapPin, Upload, Leaf, DollarSign } from 'lucide-react';
import { plantsAPI, uploadImage } from '../../services/api';
import toast from 'react-hot-toast';
import './AddListingModal.css';

export default function AddListingModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    latitude: '', longitude: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1,
  });

  const detectLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
        toast.success('Location detected!');
      },
      () => { toast.error('Could not detect location'); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error('Please upload a plant image'); return; }
    if (!form.latitude || !form.longitude) { toast.error('Please set location'); return; }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(imageFile);
      const res = await plantsAPI.create({
        ...form,
        price: parseFloat(form.price),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        imageUrl,
      });
      onSuccess(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fadeIn" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card animate-fadeUp">
        <div className="modal-header">
          <div className="modal-title">
            <Leaf size={18} /> List a Plant
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Image upload */}
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${imagePreview ? 'has-image' : ''}`}>
            <input {...getInputProps()} />
            {imagePreview
              ? <img src={imagePreview} alt="preview" className="drop-preview" />
              : <div className="drop-placeholder">
                  <Upload size={24} />
                  <span>{isDragActive ? 'Drop here!' : 'Drag & drop or click to upload'}</span>
                  <small>JPG, PNG, WebP</small>
                </div>
            }
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Plant Name *</label>
              <input className="input" placeholder="e.g. Monstera Deliciosa"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Price ($) *</label>
              <div className="input-wrap">
                <DollarSign size={15} className="input-icon" />
                <input className="input" type="number" min="0" step="0.01" placeholder="25.00"
                  style={{ paddingLeft: 32 }}
                  value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea className="input" rows={3} placeholder="Describe the plant's condition, size, care tips..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <div className="location-row">
              <input className="input" placeholder="Latitude" value={form.latitude}
                onChange={e => setForm({ ...form, latitude: e.target.value })} required readOnly />
              <input className="input" placeholder="Longitude" value={form.longitude}
                onChange={e => setForm({ ...form, longitude: e.target.value })} required readOnly />
              <button type="button" className="btn btn-outline" onClick={detectLocation} disabled={locating}>
                {locating ? <span className="spinner" /> : <MapPin size={15} />}
                {locating ? 'Detecting...' : 'Detect'}
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Uploading...</> : <><Leaf size={15} /> List Plant</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
