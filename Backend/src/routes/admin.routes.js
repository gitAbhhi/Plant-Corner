const router = require('express').Router();
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const { adminRemove } = require('../controllers/plant.controller');
const {
  getMetrics,
  getUsers,
  blockUser,
  unblockUser,
} = require('../controllers/admin.controller');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/metrics',                  getMetrics);
router.get('/users',                    getUsers);
router.patch('/users/:userId/block',    blockUser);
router.patch('/users/:userId/unblock',  unblockUser);
router.patch('/plants/:plantId/remove', adminRemove);

module.exports = router;
