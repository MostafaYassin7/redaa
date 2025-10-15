import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strips properties not in the DTO
    forbidNonWhitelisted: true, // throws error for unknown properties
    transform: true, // transforms payload to DTO instance
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
