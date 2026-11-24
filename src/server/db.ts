import fs from 'node:fs/promises';
import path from 'node:path';
import type {
  CollectionItem,
  MicroSvgAsset,
  PaletteDef,
  PlateConfig,
  RecentRoll,
} from '../engine/types.ts';

export interface DatabasePaths {
  rootDir: string;
  collectionFile: string;
  palettesFile: string;
  recentFile: string;
  assetsFile: string;
  exportsDir: string;
}

export function getDatabasePaths(baseDir = path.resolve(process.cwd(), 'data')): DatabasePaths {
  return {
    rootDir: baseDir,
    collectionFile: path.join(baseDir, 'collection.json'),
    palettesFile: path.join(baseDir, 'palettes.json'),
    recentFile: path.join(baseDir, 'recent.json'),
    assetsFile: path.join(baseDir, 'assets.json'),
    exportsDir: path.join(baseDir, 'exports'),
  };
}

const writeLocks = new Map<string, Promise<unknown>>();

function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = writeLocks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  writeLocks.set(key, next);
  return next;
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tmpPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmpPath, filePath);
}

export function sanitizeSvgServer(rawSvg: string): { viewBox: string; innerSvg: string } | null {
  const trimmed = rawSvg.trim();
  if (!trimmed || trimmed.length > 200_000) return null;

  const cleaned = trimmed
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

  const svgMatch = cleaned.match(/<svg([^>]*)>([\s\S]*?)<\/svg>/i);
  if (svgMatch) {
    const attrs = svgMatch[1];
    const vbMatch = attrs.match(/viewBox\s*=\s*["']([^"']+)["']/i);
    const viewBox = vbMatch ? vbMatch[1] : '0 0 100 100';
    return { viewBox, innerSvg: svgMatch[2].trim() };
  }

  if (/<(path|circle|rect|line|polygon|polyline|ellipse|g)\b/i.test(cleaned)) {
    return { viewBox: '0 0 100 100', innerSvg: cleaned };
  }

  return null;
}

export function createJsonStore(baseDir?: string) {
  const paths = getDatabasePaths(baseDir);

  return {
    paths,

    async init(): Promise<void> {
      await ensureDir(paths.rootDir);
      await ensureDir(paths.exportsDir);
      for (const file of [
        paths.collectionFile,
        paths.palettesFile,
        paths.recentFile,
        paths.assetsFile,
      ]) {
        try {
          await fs.access(file);
        } catch {
          await writeJsonAtomic(file, []);
        }
      }
    },

    // COLLECTION
    async listCollection(): Promise<CollectionItem[]> {
      return readJsonArray<CollectionItem>(paths.collectionFile);
    },

    async mintToCollection(input: {
      title: string;
      seed: number;
      config: PlateConfig;
      previewSvg?: string;
    }): Promise<CollectionItem> {
      return withLock(paths.collectionFile, async () => {
        const items = await readJsonArray<CollectionItem>(paths.collectionFile);
        const maxEdition = items.reduce((m, it) => Math.max(m, it.editionNumber || 0), 0);
        const editionNumber = maxEdition + 1;
        const item: CollectionItem = {
          id: `col-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          editionNumber,
          title: String(input.title || `PLATE-${editionNumber}`).slice(0, 80),
          seed: Number(input.seed) || 0,
          createdAt: new Date().toISOString(),
          config: input.config,
          previewSvg: input.previewSvg,
        };
        const updated = [item, ...items];
        await writeJsonAtomic(paths.collectionFile, updated);
        return item;
      });
    },

    async deleteCollectionItem(id: string): Promise<boolean> {
      return withLock(paths.collectionFile, async () => {
        const items = await readJsonArray<CollectionItem>(paths.collectionFile);
        const next = items.filter((item) => item.id !== id);
        if (next.length === items.length) return false;
        await writeJsonAtomic(paths.collectionFile, next);
        return true;
      });
    },

    // PALETTES
    async listPalettes(): Promise<PaletteDef[]> {
      return readJsonArray<PaletteDef>(paths.palettesFile);
    },

    async addPalette(input: { name: string; bg: string; ink: string; accent: string }): Promise<PaletteDef> {
      return withLock(paths.palettesFile, async () => {
        const items = await readJsonArray<PaletteDef>(paths.palettesFile);
        const palette: PaletteDef = {
          id: `pal-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          name: String(input.name || 'CUSTOM').trim().toUpperCase().slice(0, 32),
          bg: String(input.bg),
          ink: String(input.ink),
          accent: String(input.accent),
          isCustom: true,
        };
        const updated = [palette, ...items];
        await writeJsonAtomic(paths.palettesFile, updated);
        return palette;
      });
    },

    async deletePalette(id: string): Promise<boolean> {
      return withLock(paths.palettesFile, async () => {
        const items = await readJsonArray<PaletteDef>(paths.palettesFile);
        const next = items.filter((p) => p.id !== id);
        if (next.length === items.length) return false;
        await writeJsonAtomic(paths.palettesFile, next);
        return true;
      });
    },

    // RECENT ROLLS
    async listRecent(): Promise<RecentRoll[]> {
      return readJsonArray<RecentRoll>(paths.recentFile);
    },

    async pushRecent(input: { title: string; seed: number; config: PlateConfig }): Promise<RecentRoll[]> {
      return withLock(paths.recentFile, async () => {
        const items = await readJsonArray<RecentRoll>(paths.recentFile);
        const entry: RecentRoll = {
          id: `rec-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          title: String(input.title || 'UNTITLED').slice(0, 80),
          seed: Number(input.seed) || 0,
          rolledAt: new Date().toISOString(),
          config: input.config,
        };
        const deduped = items.filter((r) => r.seed !== entry.seed);
        const updated = [entry, ...deduped].slice(0, 24);
        await writeJsonAtomic(paths.recentFile, updated);
        return updated;
      });
    },

    async clearRecent(): Promise<void> {
      return withLock(paths.recentFile, async () => {
        await writeJsonAtomic(paths.recentFile, []);
      });
    },

    // CUSTOM SVG MICRO-ASSETS
    async listAssets(): Promise<MicroSvgAsset[]> {
      return readJsonArray<MicroSvgAsset>(paths.assetsFile);
    },

    async addAsset(input: { name: string; jpName?: string; svgContent: string }): Promise<MicroSvgAsset | null> {
      const parsed = sanitizeSvgServer(input.svgContent);
      if (!parsed) return null;

      return withLock(paths.assetsFile, async () => {
        const items = await readJsonArray<MicroSvgAsset>(paths.assetsFile);
        const asset: MicroSvgAsset = {
          id: `custom-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          name: String(input.name || 'Custom Asset').trim().slice(0, 48),
          jpName: String(input.jpName || '独自図形').trim().slice(0, 24),
          category: 'CUSTOM',
          viewBox: parsed.viewBox,
          innerSvg: parsed.innerSvg,
          defaultScale: 1.2,
          isCustom: true,
        };
        const updated = [asset, ...items];
        await writeJsonAtomic(paths.assetsFile, updated);
        return asset;
      });
    },

    async deleteAsset(id: string): Promise<boolean> {
      return withLock(paths.assetsFile, async () => {
        const items = await readJsonArray<MicroSvgAsset>(paths.assetsFile);
        const next = items.filter((a) => a.id !== id);
        if (next.length === items.length) return false;
        await writeJsonAtomic(paths.assetsFile, next);
        return true;
      });
    },

    // LOCAL DISK SVG FILE EXPORT
    async saveExportFile(filename: string, svgContent: string): Promise<{ filename: string; path: string }> {
      await ensureDir(paths.exportsDir);
      const safeBase = filename
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64) || `plate_${Date.now()}`;
      const finalName = safeBase.endsWith('.svg') ? safeBase : `${safeBase}.svg`;
      const target = path.join(paths.exportsDir, finalName);
      await fs.writeFile(target, svgContent, 'utf8');
      return { filename: finalName, path: `data/exports/${finalName}` };
    },

    async listExports(): Promise<string[]> {
      await ensureDir(paths.exportsDir);
      const entries = await fs.readdir(paths.exportsDir);
      return entries.filter((f) => f.endsWith('.svg')).sort().reverse();
    },
  };
}
