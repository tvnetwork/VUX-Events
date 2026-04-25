import { createServer } from '../server';

let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) {
      console.log('[Vercel] Initializing Express server...');
      appPromise = createServer();
    }
    
    const app = await appPromise;
    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel] Critical Handler Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Terminal Server Error',
        message: error.message || 'The server failed to start or process the request.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
