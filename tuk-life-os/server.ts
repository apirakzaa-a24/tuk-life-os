import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
dotenv.config();
async function startServer() {
  const app = express();
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`[TUK LIFE OS v7] Professional Full Release running on http://localhost:${port}`);
  });
}
startServer();
