import { createServer } from '../server';

let app: any;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await createServer();
  }
  return app(req, res);
}
