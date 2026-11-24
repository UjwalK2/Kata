import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createJsonStore } from './src/server/db.ts';

const PORT = Number(process.env.PORT) || 3000;
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

async function startServer() {
  const app = express();
  const store = createJsonStore();
  await store.init();

  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, storage: 'local-json' });
  });

  // Collection endpoints
  app.get('/api/collection', async (_req, res) => {
    try {
      const items = await store.listCollection();
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to read collection database.' });
    }
  });

  app.post('/api/collection', async (req, res) => {
    try {
      const { title, seed, config, previewSvg } = req.body ?? {};
      if (!config || typeof seed !== 'number') {
        res.status(400).json({ error: 'Valid seed and config are required.' });
        return;
      }
      const created = await store.mintToCollection({ title, seed, config, previewSvg });
      res.status(201).json({ item: created });
    } catch (err) {
      res.status(500).json({ error: 'Failed to mint piece to collection.' });
    }
  });

  app.delete('/api/collection/:id', async (req, res) => {
    try {
      const removed = await store.deleteCollectionItem(req.params.id);
      if (!removed) {
        res.status(404).json({ error: 'Collection item not found.' });
        return;
      }
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete collection item.' });
    }
  });

  // Custom palettes endpoints
  app.get('/api/palettes', async (_req, res) => {
    try {
      const items = await store.listPalettes();
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to read palettes database.' });
    }
  });

  app.post('/api/palettes', async (req, res) => {
    try {
      const { name, bg, ink, accent } = req.body ?? {};
      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'Palette name is required.' });
        return;
      }
      if (!HEX_COLOR_RE.test(bg) || !HEX_COLOR_RE.test(ink) || !HEX_COLOR_RE.test(accent)) {
        res.status(400).json({ error: 'BG, INK, and ACCENT must be valid hex colors.' });
        return;
      }
      const palette = await store.addPalette({ name, bg, ink, accent });
      res.status(201).json({ item: palette });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save palette.' });
    }
  });

  app.delete('/api/palettes/:id', async (req, res) => {
    try {
      const removed = await store.deletePalette(req.params.id);
      if (!removed) {
        res.status(404).json({ error: 'Palette not found.' });
        return;
      }
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete palette.' });
    }
  });

  // Recent rolls endpoints
  app.get('/api/recent', async (_req, res) => {
    try {
      const items = await store.listRecent();
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to read recent rolls.' });
    }
  });

  app.post('/api/recent', async (req, res) => {
    try {
      const { title, seed, config } = req.body ?? {};
      if (!config || typeof seed !== 'number') {
        res.status(400).json({ error: 'Valid seed and config are required.' });
        return;
      }
      const items = await store.pushRecent({ title, seed, config });
      res.status(201).json({ items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save recent roll.' });
    }
  });

  app.delete('/api/recent', async (_req, res) => {
    try {
      await store.clearRecent();
      res.json({ cleared: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to clear recent rolls.' });
    }
  });

  // Custom SVG assets endpoints
  app.get('/api/assets', async (_req, res) => {
    try {
      const items = await store.listAssets();
      res.json({ items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to load custom SVG assets.' });
    }
  });

  app.post('/api/assets', async (req, res) => {
    try {
      const { name, jpName, svgContent } = req.body ?? {};
      if (!name || typeof name !== 'string' || !svgContent || typeof svgContent !== 'string') {
        res.status(400).json({ error: 'Asset name and valid SVG markup are required.' });
        return;
      }
      const asset = await store.addAsset({ name, jpName, svgContent });
      if (!asset) {
        res.status(400).json({ error: 'Invalid or empty SVG markup.' });
        return;
      }
      res.status(201).json({ item: asset });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save SVG asset.' });
    }
  });

  app.delete('/api/assets/:id', async (req, res) => {
    try {
      const removed = await store.deleteAsset(req.params.id);
      if (!removed) {
        res.status(404).json({ error: 'SVG asset not found.' });
        return;
      }
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete SVG asset.' });
    }
  });

  // Local device SVG export endpoint
  app.get('/api/exports', async (_req, res) => {
    try {
      const files = await store.listExports();
      res.json({ files });
    } catch (err) {
      res.status(500).json({ error: 'Failed to list saved exports.' });
    }
  });

  app.post('/api/exports', async (req, res) => {
    try {
      const { filename, svgContent } = req.body ?? {};
      if (!svgContent || typeof svgContent !== 'string' || !svgContent.includes('<svg')) {
        res.status(400).json({ error: 'Valid SVG content is required.' });
        return;
      }
      const saved = await store.saveExportFile(String(filename || 'plate'), svgContent);
      res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save SVG file locally.' });
    }
  });

  // Serve Vite middleware in development or built dist/ in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', async (_req, res) => {
      const indexHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
      res.status(200).set('Content-Type', 'text/html').send(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KATA Micro-Graphic Designer server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
