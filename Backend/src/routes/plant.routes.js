const router  = require('express').Router();
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');
const {
  getPlants,
  getMyPlants,
  getPlantById,
  createPlant,
  updatePlant,
  markSold,
  deletePlant,
  adminRemove,
} = require('../controllers/plant.controller');

// Public routes
router.get('/',     getPlants);
router.get('/my',   protect, getMyPlants);
router.get('/:id',  getPlantById);

// Authenticated routes
router.post('/',           protect, createPlant);
router.put('/:id',         protect, updatePlant);
router.patch('/:id/sold',  protect, markSold);
router.delete('/:id',      protect, deletePlant);

// Admin only
router.patch('/:id/remove', protect, adminOnly, adminRemove);

module.exports = router;
