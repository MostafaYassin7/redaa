import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { Request, Response } from 'express';

import { ConfigService } from '@nestjs/config';
import { InitiateSessionDto } from '../dtos/initiate-session.dto';
import { ExecutePaymentDto } from '../dtos/execute-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
  ) {}

  /** 🔹 Step 1: Initiate MyFatoorah session */
  @Post('initiate-session')
  async initiateSession(@Body() body: InitiateSessionDto, @Res() res: Response) {
    try {
      const data = await this.paymentService.initiateSession(
        body.InvoiceAmount,
        body.CurrencyIso,
      );
      return res.json(data);
    } catch (error) {
      throw new HttpException(
        'Failed to initiate session',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** 🔹 Step 2: Execute payment */
  @Post('execute-payment')
  async executePayment(@Body() body: ExecutePaymentDto, @Res() res: Response) {
    try {
      const data = await this.paymentService.executePayment(body);
      return res.json(data);
    } catch (error) {
      throw new HttpException(
        'Failed to execute payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /** 🔹 Step 3: Webhook (payment-status) */
  @Post('webhook/payment-status')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const secret = this.configService.get<string>('MYFATOORAH_WEBHOOK_SECRET') || "";
    const signature = req.headers['myfatoorah-signature'] as string | "";

    if (!signature) {
      return res.status(400).json({ message: 'Missing signature header' });
    }

    const isValid = this.paymentService.validateSignature(
      req.body,
      secret,
      signature,
    );

    if (!isValid) {
      return res.status(403).json({ message: 'Invalid signature' });
    }

    // ✅ Handle webhook content here later (update DB, etc.)
    console.log('Webhook received:', req.body);

    return res.json({ message: 'Webhook processed successfully' });
  }
}
