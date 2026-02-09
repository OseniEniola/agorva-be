import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantInfo {
  subdomain: string | null;
  isMainDomain: boolean;
}

// Extend Express Request to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantInfo;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.hostname || req.headers.host?.split(':')[0] || '';

    // Extract subdomain from hostname
    // e.g., "john-farm.agorva.com" -> subdomain = "john-farm"
    // "agorva.com" -> subdomain = null (main domain)
    // "localhost" or "127.0.0.1" -> subdomain = null (development)

    let subdomain: string | null = null;
    let isMainDomain = true;

    // Handle different environments
    const parts = host.split('.');

    // For localhost/IP addresses (development)
    if (host === 'localhost' || host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      // Check if there's a subdomain in localhost setup (e.g., john-farm.localhost)
      if (parts.length > 1 && parts[0] !== 'localhost') {
        subdomain = parts[0];
        isMainDomain = false;
      }
    } else {
      // Production: Extract subdomain if present
      // agorva.com -> parts = ['agorva', 'com'] (2 parts = main domain)
      // john-farm.agorva.com -> parts = ['john-farm', 'agorva', 'com'] (3+ parts = subdomain)
      if (parts.length > 2) {
        subdomain = parts[0];
        isMainDomain = false;
      }
    }

    // Attach tenant info to request
    req.tenant = {
      subdomain,
      isMainDomain,
    };

    next();
  }
}
