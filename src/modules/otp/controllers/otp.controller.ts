import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from '../services/otp.service';
import { SendOtpDto } from '../dtos/send-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';


@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.otpService.sendOtp(dto.phoneNumber);
  }

  @Post('verify')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto.phoneNumber, dto.code);
  }
}
