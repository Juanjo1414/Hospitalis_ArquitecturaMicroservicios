import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MessagingModule } from './infrastructure/config/messaging.module';
async function bootstrap() {
  const app = await NestFactory.create(MessagingModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`Messaging Service running on http://localhost:${port}`);
}
bootstrap();
