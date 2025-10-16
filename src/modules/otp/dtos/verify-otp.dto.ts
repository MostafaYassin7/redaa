import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?\d[\d\s\-()]{6,20}$/, {
    message: 'Invalid phone number format',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  code: string;
}
