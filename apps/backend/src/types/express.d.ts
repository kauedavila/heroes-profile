import { IUser } from '../models/User';
import { TokenPayload } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      tokenPayload?: TokenPayload;
    }
  }
}