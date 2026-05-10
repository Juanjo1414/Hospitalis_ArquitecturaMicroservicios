import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PharmacyModule } from './infrastructure/config/pharmacy.module';
async function bootstrap() {
  const app = await NestFactory.create(PharmacyModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`Pharmacy Service running on http://localhost:${port}`);
}
bootstrap();
