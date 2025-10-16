import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Otp } from '../entities/otp.entity';
import { TwilioService } from '../../twilioSMS/services/twilioSms.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    private readonly twilio: TwilioService,
  ) {}

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  }

  async sendOtp(phoneNumber: string) {
    // Delete old expired codes
    await this.otpRepo.delete({ expiresAt: LessThan(new Date()) });

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes expiry

    const otp = this.otpRepo.create({ phoneNumber, code, expiresAt });
    await this.otpRepo.save(otp);

    await this.twilio.sendSms(phoneNumber, `Your verification code is ${code}`);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(phoneNumber: string, code: string) {
    const otp = await this.otpRepo.findOne({ where: { phoneNumber, code } });
    if (!otp) throw new BadRequestException('Invalid code');
    if (otp.verified) throw new BadRequestException('Code already used');
    if (otp.expiresAt < new Date()) throw new BadRequestException('Code expired');

    otp.verified = true;
    await this.otpRepo.save(otp);
    return { message: 'Phone verified successfully' };
  }
}
