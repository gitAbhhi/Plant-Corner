import { useState } from 'react';
import { MapPin, DollarSign, User, MessageCircle, Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ChatOverlay from '../Chat/ChatOverlay';
import './PlantPopup.css';

export default function PlantPopup({ plant }) {
  const { isLoggedIn, user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const isMine = user?.id === plant?.userId;

  return (
    <div className="plant-popup">
      <div className="popup-img-wrap">
        {plant.imageUrl
          ? <img src={plant.imageUrl} alt={plant.title} className="popup-img" />
          : <div className="popup-img-placeholder"><Leaf size={32} /></div>
        }
        <div className="popup-status">{plant.status}</div>
      </div>

      <div className="popup-body">
        <h3 className="popup-title">{plant.title}</h3>
        <p className="popup-desc">{plant.description}</p>

        <div className="popup-meta">
          <span className="popup-price"><DollarSign size={14} />{plant.price}</span>
          <span className="popup-seller"><User size={14} />{plant.sellerName}</span>
        </div>

        <div className="popup-location">
          <MapPin size={13} />
          <span>{plant.latitude?.toFixed(4)}, {plant.longitude?.toFixed(4)}</span>
        </div>

        {isLoggedIn && !isMine && plant.status === 'ACTIVE' && (
          <button className="btn btn-primary popup-chat-btn" onClick={() => setChatOpen(true)}>
            <MessageCircle size={15} /> Message Seller
          </button>
        )}
      </div>

      {chatOpen && (
        <ChatOverlay
          plantId={plant.id}
          plantTitle={plant.title}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
