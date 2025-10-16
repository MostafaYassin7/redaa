import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+\d{10,15}$/, {
    message: 'Phone number must be in international format, e.g., +201234567890',
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a string' })
  @Length(4, 6, { message: 'OTP must be 4 to 6 digits' }) // adjust length based on your OTP
  @Matches(/^\d+$/, { message: 'OTP must contain only digits' })
  otp: string;
}
