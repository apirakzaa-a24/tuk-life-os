import express from 'express';
import { createServer } from 'vite';

const app = express();
const port = Number(process.env.PORT || 3000);

async function start() {
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
  app.listen(port, '0.0.0.0', () => {
    console.log(`[TUK LIFE OS v1.0] Full Mobile Server Running on http://localhost:${port}`);
  });
}

start();
