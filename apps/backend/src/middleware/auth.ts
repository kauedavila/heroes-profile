import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/authService';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
  tokenPayload?: TokenPayload;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const payload = AuthService.verifyAccessToken(token);

    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireVip = (minLevel: number = 1) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.isVip() || req.user.vipLevel < minLevel) {
      return res.status(403).json({ 
        message: 'VIP access required',
        requiredVipLevel: minLevel,
        currentVipLevel: req.user.vipLevel
      });
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = AuthService.verifyAccessToken(token);

      if (payload) {
        const user = await User.findById(payload.userId);
        if (user && user.isActive) {
          req.user = user;
          req.tokenPayload = payload;
        }
      }
    }

    next();
  } catch (error) {
    // In optional auth, we don't fail on errors, just continue without user
    next();
  }
};