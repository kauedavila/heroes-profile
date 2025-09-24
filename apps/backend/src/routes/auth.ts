import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { AuthService } from '../services/authService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = await AuthService.generateTokenPair(user);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        vipLevel: user.vipLevel,
        gameData: user.gameData,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await AuthService.generateTokenPair(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        vipLevel: user.vipLevel,
        gameData: user.gameData,
        isVip: user.isVip(),
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const payload = AuthService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Remove old refresh token
    await AuthService.revokeRefreshToken(user, refreshToken);

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await AuthService.generateTokenPair(user);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken && req.user) {
      await AuthService.revokeRefreshToken(req.user, refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout all devices
router.post('/logout-all', authenticate, async (req: AuthRequest, res) => {
  try {
    if (req.user) {
      await AuthService.revokeAllRefreshTokens(req.user);
    }

    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticate, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      vipLevel: req.user.vipLevel,
      gameData: req.user.gameData,
      isVip: req.user.isVip(),
    },
  });
});

export default router;