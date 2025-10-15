import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must be in international format, e.g., +201234567890',
  })
  phoneNumber: string;
}
