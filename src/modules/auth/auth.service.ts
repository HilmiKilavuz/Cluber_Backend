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
import { MailService } from '../mail/mail.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as crypto from 'crypto';

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
    private readonly mailService: MailService,
  ) { }

  /**
   * Registers a new user account.
   */
  async register(dto: RegisterDto): Promise<{ user: PublicUser; message: string }> {
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

    // Generate a 6-digit verification code.
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Upsert into PendingUser to allow resending/overwriting if they try again before verifying
    const pendingUser = await this.prisma.pendingUser.upsert({
      where: { email: dto.email.toLowerCase() },
      update: {
        passwordHash,
        displayName: dto.displayName,
        verificationCode,
        expiresAt,
      },
      create: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
        verificationCode,
        expiresAt,
      },
    });

    // Send verification email in the background.
    this.mailService.sendVerificationEmail(pendingUser.email, verificationCode).catch(console.error);

    // [DEV ONLY] Print the code to the terminal to easily copy it!
    console.log(`\n========================================`);
    console.log(`[TEST ORTAMI] Yeni Kayıt İsteği`);
    console.log(`E-Posta: ${dto.email}`);
    console.log(`Doğrulama Kodu: ${verificationCode}`);
    console.log(`========================================\n`);

    return {
      user: {
        id: pendingUser.id,
        email: pendingUser.email,
        displayName: pendingUser.displayName,
        username: pendingUser.displayName,
        role: 'MEMBER',
        bio: null,
        avatarUrl: null,
        interests: [],
        createdAt: pendingUser.createdAt,
        updatedAt: pendingUser.createdAt,
      },
      message: 'Verification code sent.',
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
   * Verifies the email address using the provided code and logs the user in.
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<AuthResponse> {
    const pendingUser = await this.prisma.pendingUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!pendingUser) {
      throw new UnauthorizedException('Invalid email or verification code');
    }

    if (pendingUser.verificationCode !== dto.code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    if (pendingUser.expiresAt < new Date()) {
      throw new UnauthorizedException('Verification code has expired');
    }

    // Create the actual user
    const user = await this.prisma.user.create({
      data: {
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        displayName: pendingUser.displayName,
        bio: null,
        interests: [],
      },
    });

    // Delete the pending user
    await this.prisma.pendingUser.delete({
      where: { id: pendingUser.id },
    });

    const accessToken = await this.signAccessToken(user.id, user.email);
    return {
      accessToken,
      user: this.toPublicUser(user),
    };
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

