import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ExecutePaymentDto {
  @IsString()
  SessionId: string;

  @IsNumber()
  InvoiceValue: number;

  @IsOptional()
  @IsString()
  CallBackUrl?: string;

  @IsOptional()
  @IsString()
  ErrorUrl?: string;

  @IsOptional()
  @IsString()
  DisplayCurrencyIso?: string;

  @IsOptional()
  @IsString()
  CustomerName?: string;

  @IsOptional()
  @IsString()
  CustomerEmail?: string;

  @IsOptional()
  @IsString()
  CustomerMobile?: string;

  @IsOptional()
  @IsString()
  Language?: string;
}
