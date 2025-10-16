import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { TwilioService } from '../../twilioSMS/services/twilioSms.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
  ) {}

  /**
   * Generate and send OTP for phone login.
   */
  async sendOtp(phoneNumber: string) {
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    // Normalize phone number — e.g., remove spaces and dashes
    phoneNumber = phoneNumber.replace(/\s|-/g, '');

    let user = await this.userRepo.findOne({ where: { phoneNumber } });
    if (!user) {
      user = this.userRepo.create({ phoneNumber });
    }

    // Generate a 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = otp;
    user.otpExpiresAt = expiresAt;

    await this.userRepo.save(user);

    try {
      // Send OTP via Twilio SMS
      await this.twilioService.sendSms(
        phoneNumber,
        `Your verification code is: ${otp}`,
      );
    } catch (err) {
      console.error('❌ Twilio send error:', err);
      throw new InternalServerErrorException('Failed to send OTP');
    }

    console.log(`✅ OTP sent to ${phoneNumber}: ${otp}`);
    return { message: 'OTP sent successfully' };
  }

  /**
   * Verify OTP and issue JWT
   */
  async verifyOtp(phoneNumber: string, otp: string) {
    if (!phoneNumber || !otp)
      throw new BadRequestException('Phone number and OTP are required');

    const user = await this.userRepo.findOne({ where: { phoneNumber } });
    if (!user) throw new UnauthorizedException('User not found');

    if (!user.otp || user.otp !== otp)
      throw new UnauthorizedException('Invalid OTP');

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    // Clear OTP after success
    user.otp = null;
    user.otpExpiresAt = null;
    await this.userRepo.save(user);

    const payload = { sub: user.id, phoneNumber: user.phoneNumber };
    const token = this.jwtService.sign(payload);

    return {
      message: 'OTP verified successfully',
      accessToken: token,
      user,
    };
  }

  /**
   * Handle Google OAuth login
   */
  async validateGoogleUser(profile: any) {
    const { googleId, email } = profile;
    if (!email) throw new BadRequestException('Google profile missing email');

    let user = await this.userRepo.findOne({
      where: [{ googleId }, { email }],
    });

    if (!user) {
      user = this.userRepo.create({ googleId, email });
      await this.userRepo.save(user);
    } else if (!user.googleId) {
      user.googleId = googleId;
      await this.userRepo.save(user);
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { accessToken: token, user };
  }
}
