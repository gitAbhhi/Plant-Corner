const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getOrCreateRoom,
  getMyRooms,
  getRoomMessages,
} = require('../controllers/chat.controller');

// All chat routes require authentication
router.post('/room',                   protect, getOrCreateRoom);
router.get('/rooms',                   protect, getMyRooms);
router.get('/rooms/:roomId/messages',  protect, getRoomMessages);

module.exports = router;
