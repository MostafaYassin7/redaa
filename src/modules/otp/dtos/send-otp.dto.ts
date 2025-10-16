import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?\d[\d\s\-()]{6,20}$/, {
    message: 'Invalid phone number format',
  })
  phoneNumber: string;
}
