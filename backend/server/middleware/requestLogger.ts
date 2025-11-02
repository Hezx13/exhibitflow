import { NextFunction, Request } from 'express';
import { Log } from '../models/log';

// Method decorator for logging
export function LogRequest(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (req: Request, res: any, ...args: any[]) {
    const startTime = Date.now();

    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody: any;
    console.log('Request received');
    res.json = function (body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    res.send = function (body: any) {
      if (responseBody === undefined) {
        responseBody = body;
      }
      return originalSend.call(this, body);
    };

    const onFinish = () => {
      res.removeListener('finish', onFinish);
      res.removeListener('close', onFinish);

      const logEntry = new Log({
        endpoint: req.originalUrl,
        method: req.method,
        userId: (req as any).user?.userId,
        timestamp: new Date(),
        requestBody: req.body,
        requestParams: {
          ...req.params,
          department: req.headers['department'] as string,
        },
        requestQuery: req.query,
        responseStatus: res.statusCode,
        executionTime: Date.now() - startTime,
        userAgent: req.headers['user-agent'],

        ip: req.ip,
      });

      logEntry.save().catch((err) => {
        console.error('Error saving log entry:', err);
      });
    };

    res.on('finish', onFinish);
    res.on('close', onFinish);

    return originalMethod.apply(this, [req, res, ...args]);
  };

  return descriptor;
}

export const requestLogger = () => {
  return async (req: Request, res: any, next: NextFunction) => {
    const startTime = Date.now();
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody: any;

    res.json = function (body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    res.send = function (body: any) {
      if (responseBody === undefined) {
        responseBody = body;
      }
      return originalSend.call(this, body);
    };

    res.on('finish', () => {
      const logEntry = new Log({
        endpoint: req.originalUrl,
        method: req.method,
        userId: (req as any).user?.id,
        timestamp: new Date(),
        requestBody: req.body,
        requestParams: req.params,
        requestQuery: req.query,
        response: responseBody,
        responseStatus: res.statusCode,
        executionTime: Date.now() - startTime,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

      logEntry.save().catch((err) => {
        console.error('Error saving log entry:', err);
      });
    });

    next();
  };
};
