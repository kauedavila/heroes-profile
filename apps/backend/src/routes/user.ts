import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate, requireRole, requireVip, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      role: req.user.role,
      vipLevel: req.user.vipLevel,
      vipExpiry: req.user.vipExpiry,
      gameData: req.user.gameData,
      isVip: req.user.isVip(),
      createdAt: req.user.createdAt,
    },
  });
});

// Update user profile
router.put('/profile', [
  authenticate,
  body('name').optional().trim().isLength({ min: 2 }),
  body('avatar').optional().isURL(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { name, avatar } = req.body;

    if (name !== undefined) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;

    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
        role: req.user.role,
        vipLevel: req.user.vipLevel,
        isVip: req.user.isVip(),
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update game data
router.put('/game-data', [
  authenticate,
  body('gameData').isObject(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const { gameData } = req.body;

    // Merge new game data with existing data
    req.user.gameData = { ...req.user.gameData, ...gameData };
    await req.user.save();

    res.json({
      message: 'Game data updated successfully',
      gameData: req.user.gameData,
    });
  } catch (error) {
    console.error('Game data update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Grant VIP (Master only)
router.post('/grant-vip', [
  authenticate,
  requireRole(['master']),
  body('userId').isMongoId(),
  body('vipLevel').isInt({ min: 1, max: 5 }),
  body('durationDays').isInt({ min: 1 }),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, vipLevel, durationDays } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const vipExpiry = new Date();
    vipExpiry.setDate(vipExpiry.getDate() + durationDays);

    user.vipLevel = vipLevel;
    user.vipExpiry = vipExpiry;
    await user.save();

    res.json({
      message: 'VIP granted successfully',
      user: {
        id: user._id,
        name: user.name,
        vipLevel: user.vipLevel,
        vipExpiry: user.vipExpiry,
        isVip: user.isVip(),
      },
    });
  } catch (error) {
    console.error('Grant VIP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List users (Master only)
router.get('/list', [
  authenticate,
  requireRole(['master']),
], async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ isActive: true });

    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        vipLevel: user.vipLevel,
        vipExpiry: user.vipExpiry,
        isVip: user.isVip(),
        gameData: {
          level: user.gameData.level,
          experience: user.gameData.experience,
          gold: user.gameData.gold,
        },
        createdAt: user.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deactivate user (Master only)
router.delete('/:userId', [
  authenticate,
  requireRole(['master']),
], async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    user.refreshTokens = [];
    await user.save();

    res.json({
      message: 'User deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;