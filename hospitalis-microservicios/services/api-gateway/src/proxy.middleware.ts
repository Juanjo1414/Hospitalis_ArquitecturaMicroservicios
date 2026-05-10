import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import * as http from 'http';

/**
 * API Gateway — Lightweight HTTP Proxy
 * Routes /api/<service>/* → http://localhost:<port>/<service>/*
 */
@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Gateway');
  private routeMap: Record<string, string>;

  constructor(private config: ConfigService) {
    this.routeMap = {
      'auth':            this.env('AUTH_SERVICE_URL',            'http://localhost:3001'),
      'patients':        this.env('PATIENTS_SERVICE_URL',        'http://localhost:3002'),
      'appointments':    this.env('APPOINTMENTS_SERVICE_URL',    'http://localhost:3003'),
      'medical-records': this.env('MEDICAL_RECORDS_SERVICE_URL', 'http://localhost:3004'),
      'prescriptions':   this.env('PHARMACY_SERVICE_URL',        'http://localhost:3005'),
      'medications':     this.env('PHARMACY_SERVICE_URL',        'http://localhost:3005'),
      'messages':        this.env('MESSAGING_SERVICE_URL',       'http://localhost:3006'),
      'users':           this.env('ADMIN_SERVICE_URL',           'http://localhost:3007'),
      'audit':           this.env('ADMIN_SERVICE_URL',           'http://localhost:3007'),
      'settings':        this.env('ADMIN_SERVICE_URL',           'http://localhost:3007'),
    };
  }

  private env(key: string, fallback: string): string {
    return this.config.get<string>(key) ?? fallback;
  }

  use(req: Request, res: Response, _next: NextFunction) {
    // /api/auth/login?foo=bar → backendPath="/auth/login?foo=bar"
    const backendPath = req.originalUrl.replace(/^\/api/, '');
    
    // Extract prefix ignoring query parameters: "/auth/login?foo=bar" -> "auth"
    const pathWithoutQuery = backendPath.split('?')[0];
    const prefix = pathWithoutQuery.split('/')[1];
    const target = this.routeMap[prefix];

    if (!target) {
      return res.status(404).json({
        statusCode: 404,
        message: `Unknown route: /api/${prefix}`,
        error: 'Not Found',
      });
    }

    const parsed = new URL(target);

    // NestJS already parsed the body via express.json(), so we need to re-serialize it
    const bodyData = req.body && Object.keys(req.body).length > 0
      ? JSON.stringify(req.body)
      : null;

    const headers: Record<string, any> = {};
    // Forward relevant headers
    for (const key of Object.keys(req.headers)) {
      if (key === 'host' || key === 'content-length') continue;
      headers[key] = req.headers[key];
    }
    headers['host'] = `${parsed.hostname}:${parsed.port}`;
    if (bodyData) {
      headers['content-type'] = 'application/json';
      headers['content-length'] = Buffer.byteLength(bodyData);
    }

    const options: http.RequestOptions = {
      hostname: parsed.hostname,
      port: parseInt(parsed.port),
      path: backendPath,
      method: req.method,
      headers,
      timeout: 15000,
    };

    this.logger.log(`${req.method} /api${backendPath} → ${target}${backendPath}`);

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      this.logger.error(`Proxy error /${prefix}: ${err.message}`);
      if (!res.headersSent) {
        res.status(502).json({
          statusCode: 502,
          message: `Service unavailable: ${prefix}`,
          error: 'Bad Gateway',
        });
      }
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({
          statusCode: 504,
          message: `Service timeout: ${prefix}`,
          error: 'Gateway Timeout',
        });
      }
    });

    // Write body if present (NestJS already consumed the stream via express.json)
    if (bodyData) {
      proxyReq.write(bodyData);
    }
    proxyReq.end();
  }
}
