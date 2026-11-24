import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createJsonStore } from './db.ts';
import { createDefaultConfig } from '../engine/generator.ts';

test('JSON store persists collection, palettes, recent rolls, assets, and exports on disk', async () => {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kata-db-test-'));
  try {
    const store = createJsonStore(tmpDir);
    await store.init();

    const cfg = createDefaultConfig(353316362);
    const minted = await store.mintToCollection({
      title: 'STRATA-65',
      seed: 353316362,
      config: cfg,
    });
    assert.equal(minted.editionNumber, 1);

    const col = await store.listCollection();
    assert.equal(col.length, 1);
    assert.equal(col[0].title, 'STRATA-65');

    const pal = await store.addPalette({
      name: 'TOKYO NIGHT',
      bg: '#101010',
      ink: '#efebe0',
      accent: '#ff4d00',
    });
    assert.equal(pal.name, 'TOKYO NIGHT');
    assert.equal((await store.listPalettes()).length, 1);

    await store.pushRecent({ title: 'STRATA-65', seed: 353316362, config: cfg });
    assert.equal((await store.listRecent()).length, 1);

    const asset = await store.addAsset({
      name: 'Diamond Mark',
      svgContent: '<svg viewBox="0 0 100 100"><script>bad()</script><polygon points="50,10 90,50 50,90 10,50"/></svg>',
    });
    assert.ok(asset);
    assert.ok(!asset.innerSvg.includes('<script'));
    assert.equal((await store.listAssets()).length, 1);

    const savedExport = await store.saveExportFile('strata-65', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    assert.equal(savedExport.filename, 'strata-65.svg');
    const exportsList = await store.listExports();
    assert.deepEqual(exportsList, ['strata-65.svg']);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
});
