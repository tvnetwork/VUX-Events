import { createServer } from '../server.js';

let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  const start = Date.now();
  console.log(`[Vercel] Request: ${req.method} ${req.url} - ${new Date().toISOString()}`);
  
  try {
    if (!appPromise) {
      console.log('[Vercel] Initializing Express server instance...');
      appPromise = createServer();
    }
    
    const app = await appPromise;
    console.log(`[Vercel] Dispatching to Express: ${req.url}`);
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel] Critical Handler Error after', Date.now() - start, 'ms:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Terminal Server Error',
        message: error.message || 'The server failed to start or process the request.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        requestId: req.headers['x-vercel-id'] || 'unknown'
      });
    }
  }
}
