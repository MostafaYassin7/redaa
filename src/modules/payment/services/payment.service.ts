import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly baseURL: string;
  private readonly token: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Load base URL and API token from .env
    this.baseURL =
      this.configService.get<string>('MYFATOORAH_BASE_URL') ||
      'https://api-sa.myfatoorah.com';
    this.token = this.configService.get<string>('MYFATOORAH_TOKEN') || '';
  }

  /** 🔹 Step 1: Initiate a MyFatoorah session */
  async initiateSession(InvoiceAmount: number, CurrencyIso: string) {
    try {
      /**
       * NestJS HttpService returns an Observable, not a Promise.
       * We add a `$` at the end of the variable name to remind ourselves that
       * this is an Observable stream (not yet the actual data).
       */
      const response$ = this.httpService.post(
        `${this.baseURL}/v2/InitiateSession`,
        { InvoiceAmount, CurrencyIso },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      /**
       * `firstValueFrom()` converts the Observable into a Promise.
       * It "subscribes" to the Observable, waits for the first response,
       * returns it, and then automatically unsubscribes.
       *
       * This makes it behave exactly like: `const response = await axios.post(...)`
       */
      const { data } = await firstValueFrom(response$);

      return data; // ✅ Actual API response
    } catch (error) {
      this.logger.error('Error initiating session', error);
      throw new Error('Failed to initiate MyFatoorah session');
    }
  }

  /** 🔹 Step 2: Execute the payment */
  async executePayment(paymentData: any) {
    try {
      const response$ = this.httpService.post(
        `${this.baseURL}/v2/ExecutePayment`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Same logic: convert Observable → Promise → extract data
      const { data } = await firstValueFrom(response$);
      return data;
    } catch (error) {
      this.logger.error('Error executing payment', error);
      throw new Error('Failed to execute payment');
    }
  }

  /** 🔹 Step 3: Verify webhook signature (HMAC SHA256) */
  validateSignature(
    bodyData: any,
    secret: string,
    myFatoorahSignature: string,
  ): boolean {
    // MyFatoorah special case for refunds
    if (bodyData['Event'] === 'RefundStatusChanged') {
      delete bodyData['Data']['GatewayReference'];
    }

    const unOrderedArray = bodyData['Data'];
    const orderedKeys = Object.keys(unOrderedArray).sort((a, b) =>
      a.localeCompare(b),
    );

    // Build ordered "key=value" string for hashing
    let orderedString = '';
    orderedKeys.forEach((key) => {
      unOrderedArray[key] = unOrderedArray[key] || '';
      orderedString += `${key}=${unOrderedArray[key]},`;
    });
    orderedString = orderedString.slice(0, -1);

    // Create hash using your secret key
    const hash = crypto
      .createHmac('sha256', secret)
      .update(orderedString)
      .digest('base64');

    return hash === myFatoorahSignature;
  }
}
