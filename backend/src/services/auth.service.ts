import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ENV } from '../config/env.js';
import { UserPayload } from '../types/index.js';

export class AuthService {
  static signToken(user: UserPayload): string {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.active) {
      throw new Error('Identifiants incorrects ou compte inactif');
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error('Identifiants incorrects ou compte inactif');
    }

    const payload: UserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserPayload['role'],
    };

    const token = this.signToken(payload);

    return {
      user: payload,
      token,
    };
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'ADMIN' | 'MANAGER' | 'STAFF';
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role || 'STAFF',
      },
    });

    const payload: UserPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserPayload['role'],
    };

    return {
      user: payload,
      token: this.signToken(payload),
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return user;
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUser(
    id: string,
    data: { name?: string; phone?: string; role?: string; active?: boolean }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    });
  }
}
