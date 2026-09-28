const Plant = require('../models/Plant');
const { createError } = require('../middleware/error.middleware');

// Format plant to match frontend expected shape
const formatPlant = (plant) => ({
  id: plant._id,
  userId: plant.user?._id || plant.user,
  sellerName: plant.user?.username || '',
  title: plant.title,
  description: plant.description,
  price: plant.price,
  latitude: plant.latitude,
  longitude: plant.longitude,
  imageUrl: plant.imageUrl,
  status: plant.status,
  createdAt: plant.createdAt,
});

// GET /api/plants
const getPlants = async (req, res, next) => {
  try {
    const { swLat, swLng, neLat, neLng, q } = req.query;
    let filter = { status: 'ACTIVE' };

    // Bounding box geo filter
    if (swLat && swLng && neLat && neLng) {
      filter.latitude  = { $gte: parseFloat(swLat), $lte: parseFloat(neLat) };
      filter.longitude = { $gte: parseFloat(swLng), $lte: parseFloat(neLng) };
    }

    // Text search
    if (q) {
      filter.$text = { $search: q };
    }

    const plants = await Plant.find(filter)
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(plants.map(formatPlant));
  } catch (err) {
    next(err);
  }
};

// GET /api/plants/my
const getMyPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find({ user: req.user._id })
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(plants.map(formatPlant));
  } catch (err) {
    next(err);
  }
};

// GET /api/plants/:id
const getPlantById = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('user', 'username email');
    if (!plant) return next(createError('Plant not found', 404));
    res.json(formatPlant(plant));
  } catch (err) {
    next(err);
  }
};

// POST /api/plants
const createPlant = async (req, res, next) => {
  try {
    const { title, description, price, latitude, longitude, imageUrl } = req.body;

    const plant = await Plant.create({
      user: req.user._id,
      title,
      description,
      price: parseFloat(price),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl: imageUrl || null,
    });

    await plant.populate('user', 'username email');
    res.status(201).json(formatPlant(plant));
  } catch (err) {
    next(err);
  }
};

// PUT /api/plants/:id
const updatePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return next(createError('Plant not found', 404));

    if (plant.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to update this listing', 403));
    }

    const { title, description, price, latitude, longitude, imageUrl } = req.body;
    plant.title       = title       ?? plant.title;
    plant.description = description ?? plant.description;
    plant.price       = price       ? parseFloat(price)     : plant.price;
    plant.latitude    = latitude    ? parseFloat(latitude)  : plant.latitude;
    plant.longitude   = longitude   ? parseFloat(longitude) : plant.longitude;
    if (imageUrl) plant.imageUrl = imageUrl;

    await plant.save();
    await plant.populate('user', 'username email');
    res.json(formatPlant(plant));
  } catch (err) {
    next(err);
  }
};

// PATCH /api/plants/:id/sold
const markSold = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return next(createError('Plant not found', 404));

    if (plant.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized', 403));
    }
    if (plant.status !== 'ACTIVE') {
      return next(createError('Only ACTIVE listings can be marked as sold', 400));
    }

    plant.status = 'SOLD';
    await plant.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// DELETE /api/plants/:id
const deletePlant = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return next(createError('Plant not found', 404));

    if (plant.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized', 403));
    }

    plant.status = 'REMOVED';
    await plant.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// PATCH /api/plants/:id/remove  (admin only)
const adminRemove = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return next(createError('Plant not found', 404));
    plant.status = 'REMOVED';
    await plant.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPlants,
  getMyPlants,
  getPlantById,
  createPlant,
  updatePlant,
  markSold,
  deletePlant,
  adminRemove,
};
