import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AdminModule } from './infrastructure/config/admin.module';
async function bootstrap() {
  const app = await NestFactory.create(AdminModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Admin Service running on http://localhost:${port}`);
}
bootstrap();
