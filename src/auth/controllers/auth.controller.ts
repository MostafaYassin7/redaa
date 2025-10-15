import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { SendOtpDto } from '../dtos/req/send-otp-dto';
import { VerifyOtpDto } from '../dtos/res/verify-otp-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ----- OTP -----
  @Post('send-otp')
  sendOtp(@Body() SendOtpDto: SendOtpDto) {
    const { phoneNumber } = SendOtpDto;
    return this.authService.sendOtp(phoneNumber);
  }

  @Post('verify-otp')
  verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { phoneNumber, otp } = verifyOtpDto;
    return this.authService.verifyOtp(phoneNumber, otp);
  }

  // ----- Google -----
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request) {
    const user = await this.authService.validateGoogleUser(req.user);
    return { message: 'Google login success', user };
  }
}
