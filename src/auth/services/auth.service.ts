import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generate & store OTP for phone login
   * For now it’s hardcoded to 3030 for simplicity.
   */
  async sendOtp(phoneNumber: string) {
    if (!phoneNumber) throw new BadRequestException('Phone number is required');

    let user = await this.userRepo.findOne({ where: { phoneNumber } });

    if (!user) {
      user = this.userRepo.create({ phoneNumber });
    }

    const otp = '3030'; // static for now
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpiresAt = expiresAt;

    await this.userRepo.save(user);

    // simulate sending SMS
    console.log(`✅ OTP sent to ${phoneNumber}: ${otp}`);

    return { message: 'OTP sent successfully (use 3030)' };
  }

  /**
   * Verify OTP and issue JWT
   */
  async verifyOtp(phoneNumber: string, otp: string) {
    const user = await this.userRepo.findOne({ where: { phoneNumber } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.otp !== otp) throw new UnauthorizedException('Invalid OTP');

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    // clear OTP
    user.otp = null;
    user.otpExpiresAt = null;
    await this.userRepo.save(user);

    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const token = this.jwtService.sign(payload);

    return { accessToken: token, user };
  }

  /**
   * Handle Google OAuth login (from GoogleStrategy)
   */
  async validateGoogleUser(profile: any) {
    const { googleId, email, displayName } = profile;
    if (!email) throw new BadRequestException('Google profile missing email');

    let user = await this.userRepo.findOne({
      where: [{ googleId }, { email }],
    });

    if (!user) {
      user = this.userRepo.create({
        googleId,
        email,
      });
      await this.userRepo.save(user);
    } else if (!user.googleId) {
      // if existing user has no googleId, link it
      user.googleId = googleId;
      await this.userRepo.save(user);
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { accessToken: token, user };
  }
}
