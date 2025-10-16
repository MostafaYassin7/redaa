import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { OtpService } from './services/otp.service';
import { OtpController } from './controllers/otp.controller';
import { TwilioModule } from '../twilioSMS/twilio.module';


@Module({
  imports: [TypeOrmModule.forFeature([Otp]), TwilioModule],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}
