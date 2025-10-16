import { Module } from '@nestjs/common';
import { TwilioService } from './services/twilioSms.service';

@Module({
  providers: [TwilioService],
  exports: [TwilioService], // so OTP module can use it
})
export class TwilioModule {}
