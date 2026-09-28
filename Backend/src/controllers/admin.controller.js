const User  = require('../models/User');
const Plant = require('../models/Plant');
const { createError } = require('../middleware/error.middleware');

// GET /api/admin/metrics
const getMetrics = async (req, res, next) => {
  try {
    const [totalUsers, activePlants, totalSold, blockedUsers] = await Promise.all([
      User.countDocuments(),
      Plant.countDocuments({ status: 'ACTIVE' }),
      Plant.countDocuments({ status: 'SOLD' }),
      User.countDocuments({ isBlocked: true }),
    ]);

    const conversionRate =
      totalSold === 0
        ? 0
        : Math.round((totalSold / (activePlants + totalSold)) * 10000) / 100;

    res.json({ totalUsers, activePlants, totalSold, blockedUsers, conversionRate });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users?search=
const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      users.map(async (u) => {
        const activeListings = await Plant.countDocuments({
          user: u._id, status: 'ACTIVE',
        });
        return {
          id:             u._id,
          username:       u.username,
          email:          u.email,
          isBlocked:      u.isBlocked,
          createdAt:      u.createdAt,
          activeListings,
          roles: [u.role === 'admin' ? 'ROLE_ADMIN' : 'ROLE_USER'],
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:userId/block
const blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(createError('User not found', 404));
    user.isBlocked = true;
    await user.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// PATCH /api/admin/users/:userId/unblock
const unblockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return next(createError('User not found', 404));
    user.isBlocked = false;
    await user.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getMetrics, getUsers, blockUser, unblockUser };
