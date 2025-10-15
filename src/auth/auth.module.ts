import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { User } from './entities/user.entity';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import ms from 'ms';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ session: false }), // <-- needed for AuthGuard('google')
    TypeOrmModule.forFeature([User]),
JwtModule.register({
  secret: process.env.JWT_SECRET || 'default_secret',
  signOptions: {
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 86400, // 1 day fallback
  },
}),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
