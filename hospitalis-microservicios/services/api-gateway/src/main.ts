import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  // rawBody: true keeps the raw stream available for proxying
  const app = await NestFactory.create(GatewayModule, { rawBody: true });
  app.enableCors();
  // Increase limits for file uploads that pass through the gateway
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`
╔═══════════════════════════════════════════════╗
║         Hospitalis API Gateway                ║
║         Running on http://localhost:${port}       ║
╠═══════════════════════════════════════════════╣
║  Routes:                                      ║
║    /api/auth/*             → :3001            ║
║    /api/patients/*         → :3002            ║
║    /api/appointments/*     → :3003            ║
║    /api/medical-records/*  → :3004            ║
║    /api/prescriptions/*    → :3005            ║
║    /api/medications/*      → :3005            ║
║    /api/messages/*         → :3006            ║
║    /api/users/*            → :3007            ║
║    /api/audit-logs/*       → :3007            ║
║    /api/system-config/*    → :3007            ║
╚═══════════════════════════════════════════════╝
  `);
}
bootstrap();
