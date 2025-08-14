import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // <-- NEW IMPORT
import helmet from 'helmet';
import { ThrottlerGuard, ThrottlerStorageService } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true, // <-- NEW: This is essential for webhook signature verification
  });

  // Security middleware
  app.use(helmet());

  // Global validation pipe for automatic DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global rate limiting
  const reflector = app.get(Reflector);
  const throttler = app.get(ThrottlerStorageService);
  app.useGlobalGuards(new ThrottlerGuard(reflector, throttler));

  // Sanitize error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();