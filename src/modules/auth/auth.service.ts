import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PublicUser } from './interfaces/public-user.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

/**
 * Authentication business logic service.
 *
 * Service responsibility:
 * - Register new users.
 * - Validate login credentials.
 * - Create JWT access tokens.
 * - Return safe public user objects.
 */
@Injectable()
export class AuthService {
  // Dependencies injected by NestJS DI container.
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Registers a new user account.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Email is normalized to lowercase for uniqueness consistency.
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Prevent duplicate account creation.
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password before saving (never store plain passwords).
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Persist user record in database.
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
        bio: dto.bio ?? null,
        interests: dto.interests ?? [],
      },
    });

    // Create signed JWT and return public profile data.
    const accessToken = await this.signAccessToken(user.id, user.email);
    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  /**
   * Logs user in by validating email + password.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find user by normalized email.
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Do not reveal whether email or password is wrong.
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare raw password with bcrypt hash.
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Issue fresh access token on successful login.
    const accessToken = await this.signAccessToken(user.id, user.email);
    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  /**
   * Fetches profile for currently authenticated user.
   */
  async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return this.toPublicUser(user);
  }

  /**
   * Cookie max age used by controller while setting auth cookie.
   */
  getCookieMaxAgeMs(): number {
    return this.configService.get<number>('JWT_COOKIE_MAX_AGE_MS', 900000);
  }

  /**
   * Creates JWT token payload and signs it.
   */
  private async signAccessToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
    };

    return this.jwtService.signAsync(payload);
  }

  /**
   * Removes sensitive fields and returns public-safe user object.
   */
  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      username: user.displayName, // Mapping displayName to username for frontend
      role: 'MEMBER', // Default role for now as it's not in the User model yet
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      interests: user.interests,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

