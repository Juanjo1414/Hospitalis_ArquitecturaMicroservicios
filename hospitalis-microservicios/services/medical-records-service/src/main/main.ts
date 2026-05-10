import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MedicalRecordsModule } from './infrastructure/config/medical-records.module';

async function bootstrap() {
  const app = await NestFactory.create(MedicalRecordsModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Medical Records Service running on http://localhost:${port}`);
}
bootstrap();
