import { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { MessageCircle, Leaf, Clock } from 'lucide-react';
import ChatOverlay from '../components/Chat/ChatOverlay';
import toast from 'react-hot-toast';
import './MessagesPage.css';

export default function MessagesPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    chatAPI.getMyRooms()
      .then(res => setRooms(res.data || []))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="messages-page">
      <div className="messages-header">
        <h1 className="page-title"><MessageCircle size={24} /> Messages</h1>
        <p className="page-sub">Your active conversations with buyers and sellers</p>
      </div>

      {loading ? (
        <div className="messages-loading"><span className="spinner" /> Loading conversations...</div>
      ) : rooms.length === 0 ? (
        <div className="messages-empty">
          <MessageCircle size={48} />
          <h3>No conversations yet</h3>
          <p>Browse the map and message sellers to start chatting</p>
        </div>
      ) : (
        <div className="rooms-list">
          {rooms.map(room => (
            <div
              key={room.id}
              className={`room-card card ${activeRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => setActiveRoom(room)}
            >
              <div className="room-plant-img">
                {room.plantImageUrl
                  ? <img src={room.plantImageUrl} alt={room.plantTitle} />
                  : <div className="room-img-placeholder"><Leaf size={18} /></div>
                }
              </div>
              <div className="room-info">
                <div className="room-plant-name">{room.plantTitle}</div>
                <div className="room-participants">
                  {room.buyerName} ↔ {room.sellerName}
                </div>
                {room.lastMessage && (
                  <div className="room-last-msg">{room.lastMessage}</div>
                )}
              </div>
              <div className="room-meta">
                {room.lastMessageTime && (
                  <div className="room-time">
                    <Clock size={11} />
                    {new Date(room.lastMessageTime).toLocaleDateString()}
                  </div>
                )}
                {room.unreadCount > 0 && (
                  <div className="room-unread">{room.unreadCount}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeRoom && (
        <ChatOverlay
          plantId={activeRoom.plantId}
          plantTitle={activeRoom.plantTitle}
          onClose={() => setActiveRoom(null)}
        />
      )}
    </div>
  );
}
