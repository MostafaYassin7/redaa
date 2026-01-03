import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class InitiateSessionDto {
  @IsNumber()
  @IsNotEmpty()
  InvoiceAmount: number;

  @IsString()
  @IsNotEmpty()
  CurrencyIso: string;
}
