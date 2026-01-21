import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { setupSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';


async function bootstrap() {
  console.log('Starting application...');
  console.log("Environment:", process.env.NODE_ENV);
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

   // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable serialization (to use @Exclude decorator)
  //app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Apply global response transformation
  app.useGlobalInterceptors(new TransformInterceptor());

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });
  
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor())

  // Setup Swagger (only if enabled)
  const swaggerEnabled = configService.get<boolean>('app.swagger.enabled');
  if (swaggerEnabled) {
    setupSwagger(app);
  }
  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 Application running on: http://localhost:${process.env.PORT}`);
  console.log(`🌍 Environment: ${configService.get('app.environment')}`);
}
bootstrap();
