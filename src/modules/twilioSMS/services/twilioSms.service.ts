import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio;
  private from: string | undefined;

  constructor(private config: ConfigService) {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    this.from = this.config.get<string>('TWILIO_PHONE_NUMBER');
    if (!sid || !token || !this.from) {
      throw new Error('Twilio credentials is missing in environment variables');
    }
    this.client = new Twilio(sid, token);

  }

  async sendSms(to: string, body: string) {
    return this.client.messages.create({
      body,
      from: this.from,
      to,
    });
  }
}
