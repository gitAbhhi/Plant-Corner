const ChatRoom = require('../models/ChatRoom');
const Message  = require('../models/Message');
const Plant    = require('../models/Plant');
const { createError } = require('../middleware/error.middleware');

const formatRoom = (room, lastMessage, lastMessageTime) => ({
  id: room._id,
  plantId:      room.plant?._id   || room.plant,
  plantTitle:   room.plant?.title,
  plantImageUrl:room.plant?.imageUrl,
  buyerId:      room.buyer?._id   || room.buyer,
  buyerName:    room.buyer?.username,
  sellerId:     room.seller?._id  || room.seller,
  sellerName:   room.seller?.username,
  lastMessage,
  lastMessageTime,
  createdAt: room.createdAt,
});

const formatMessage = (msg) => ({
  id:         msg._id,
  chatRoomId: msg.chatRoom,
  senderId:   msg.sender?._id || msg.sender,
  senderName: msg.sender?.username,
  content:    msg.content,
  timestamp:  msg.createdAt,
});

// POST /api/chat/room?plantId=xxx
const getOrCreateRoom = async (req, res, next) => {
  try {
    const { plantId } = req.query;
    const buyerId = req.user._id;

    const plant = await Plant.findById(plantId).populate('user', 'username');
    if (!plant) return next(createError('Plant not found', 404));

    if (plant.user._id.toString() === buyerId.toString()) {
      return next(createError('Cannot message yourself about your own listing', 400));
    }

    let room = await ChatRoom.findOne({ plant: plantId, buyer: buyerId })
      .populate('plant', 'title imageUrl')
      .populate('buyer',  'username')
      .populate('seller', 'username');

    if (!room) {
      room = await ChatRoom.create({
        plant:  plantId,
        buyer:  buyerId,
        seller: plant.user._id,
      });
      room = await room.populate([
        { path: 'plant',  select: 'title imageUrl' },
        { path: 'buyer',  select: 'username' },
        { path: 'seller', select: 'username' },
      ]);
    }

    res.json(formatRoom(room, null, null));
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/rooms
const getMyRooms = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const rooms = await ChatRoom.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('plant',  'title imageUrl')
      .populate('buyer',  'username')
      .populate('seller', 'username')
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      rooms.map(async (room) => {
        const lastMsg = await Message.findOne({ chatRoom: room._id })
          .sort({ createdAt: -1 });
        return formatRoom(
          room,
          lastMsg?.content    || null,
          lastMsg?.createdAt  || null
        );
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

// GET /api/chat/rooms/:roomId/messages
const getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await ChatRoom.findById(roomId);
    if (!room) return next(createError('Chat room not found', 404));

    const isParticipant =
      room.buyer.toString()  === userId.toString() ||
      room.seller.toString() === userId.toString();

    if (!isParticipant) return next(createError('Not a participant', 403));

    const messages = await Message.find({ chatRoom: roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    res.json(messages.map(formatMessage));
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrCreateRoom, getMyRooms, getRoomMessages, formatMessage };
