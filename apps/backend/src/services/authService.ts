import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  vipLevel: number;
}

export class AuthService {
  static generateAccessToken(user: IUser): string {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      vipLevel: user.vipLevel,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  static generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { userId: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  }

  static verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static verifyRefreshToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch (error) {
      return null;
    }
  }

  static async generateTokenPair(user: IUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Add refresh token to user's refresh tokens array
    if (!user.refreshTokens.includes(refreshToken)) {
      user.refreshTokens.push(refreshToken);
      
      // Keep only the last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      
      await user.save();
    }

    return { accessToken, refreshToken };
  }

  static async revokeRefreshToken(user: IUser, refreshToken: string): Promise<void> {
    user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
    await user.save();
  }

  static async revokeAllRefreshTokens(user: IUser): Promise<void> {
    user.refreshTokens = [];
    await user.save();
  }
}

export default AuthService;