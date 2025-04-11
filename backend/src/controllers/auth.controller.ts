import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { generateToken } from '../middleware/auth';
import { Types } from 'mongoose';

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UserResponse {
  id: Types.ObjectId;
  username: string;
  email: string;
  profilePicture?: string;
}

interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}

function formatUserResponse(user: IUser): UserResponse {
  if (!user._id) {
    throw new Error('User ID is required');
  }
  
  return {
    id: user._id as Types.ObjectId,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture
  };
}

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      roles: ['user']
    });

    await user.save();

    // Generate token
    if (!user._id) {
      throw new Error('User ID is required');
    }
    const token = generateToken(user._id.toString());

    res.status(201).json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    if (!user._id) {
      throw new Error('User ID is required');
    }
    const token = generateToken(user._id.toString());

    res.json({
      user: formatUserResponse(user),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.json({
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: Request<{}, {}, ProfileUpdateRequest>, res: Response) => {
  const updates = Object.keys(req.body) as Array<keyof ProfileUpdateRequest>;
  const allowedUpdates: Array<keyof ProfileUpdateRequest> = ['username', 'email', 'password', 'profilePicture'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = req.user as IUser;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Type-safe update
    updates.forEach(update => {
      const value = req.body[update];
      if (value !== undefined) {
        switch (update) {
          case 'username':
            user.username = value;
            break;
          case 'email':
            user.email = value;
            break;
          case 'password':
            user.password = value;
            break;
          case 'profilePicture':
            user.profilePicture = value;
            break;
        }
      }
    });

    await user.save();

    res.json({
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error updating profile' });
  }
};
