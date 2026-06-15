import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { login, password, rememberMe } = loginDto;

    // Find user with role and user info
    const user = await this.prisma.user.findUnique({
      where: { login },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const payload: JwtPayload = {
      sub: user.id,
      login: user.login,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(
      { ...payload, tv: user.refreshTokenVersion },
      rememberMe,
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate the refresh-token version atomically: the update succeeds only if
    // the presented token's `tv` still matches the user's current version. A
    // replayed (already-rotated) token fails the where-clause and gets zero
    // rows — we treat that as a reuse attempt and invalidate the family by
    // bumping the version, forcing re-login on any outstanding tokens.
    const updated = await this.prisma.user.updateMany({
      where: {
        id: payload.sub,
        isActive: true,
        refreshTokenVersion: payload.tv ?? -1,
      },
      data: { refreshTokenVersion: { increment: 1 } },
    });

    if (updated.count === 0) {
      await this.prisma.user.updateMany({
        where: { id: payload.sub },
        data: { refreshTokenVersion: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newPayload: JwtPayload = {
      sub: user.id,
      login: user.login,
      roleId: user.roleId,
      roleName: user.role.name,
    };

    const accessToken = await this.generateAccessToken(newPayload);
    const newRefreshToken = await this.generateRefreshToken({
      ...newPayload,
      tv: user.refreshTokenVersion,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and set mustChangePassword to false.
    // Bumping refreshTokenVersion invalidates every outstanding refresh token
    // for this user, forcing other sessions to re-authenticate.
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        refreshTokenVersion: { increment: 1 },
      },
    });

    return { message: 'Password changed successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        userInfo: true,
        teacherInfo: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
  }

  private async generateRefreshToken(
    payload: JwtPayload,
    rememberMe?: boolean,
  ): Promise<string> {
    const expiresIn = rememberMe
      ? this.configService.get('JWT_REFRESH_EXPIRES_IN_REMEMBER_ME')
      : this.configService.get('JWT_REFRESH_EXPIRES_IN');

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn,
    });
  }
}
