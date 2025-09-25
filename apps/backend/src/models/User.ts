import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  googleId?: string;
  name: string;
  avatar?: string;
  role: 'user' | 'master';
  vipLevel: number;
  vipExpiry?: Date;
  gameData: {
    level: number;
    experience: number;
    gold: number;
    characters: any[];
    inventory: any[];
    currentStage: number;
  };
  refreshTokens: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isVip(): boolean;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'master'],
    default: 'user',
  },
  vipLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  vipExpiry: {
    type: Date,
    default: null,
  },
  gameData: {
    level: {
      type: Number,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
    gold: {
      type: Number,
      default: 100,
    },
    characters: [{
      id: String,
      name: String,
      class: String,
      level: Number,
      stats: {
        health: Number,
        attack: Number,
        defense: Number,
        speed: Number,
      },
      equipment: {
        weapon: String,
        armor: String,
        accessory: String,
      },
    }],
    inventory: [{
      id: String,
      name: String,
      type: String,
      rarity: String,
      quantity: Number,
    }],
    currentStage: {
      type: Number,
      default: 1,
    },
  },
  refreshTokens: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Check VIP status
UserSchema.methods.isVip = function(): boolean {
  return this.vipLevel > 0 && (!this.vipExpiry || this.vipExpiry > new Date());
};

export default mongoose.model<IUser>('User', UserSchema);