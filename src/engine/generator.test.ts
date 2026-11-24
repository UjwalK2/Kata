import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePlateScene,
  createDefaultConfig,
  createDefaultStamp,
  decodeHashToState,
  deriveTraitsFromSeed,
  encodeStateToHash,
  getPlateMetadata,
  renderContactSheetSvg,
  renderPlateSvgString,
  sanitizeSvgInnerContent,
} from './generator';
import { BUILTIN_SVG_ASSETS } from './svgAssets';

test('deterministic SVG generation produces identical output for identical config', () => {
  const cfg = createDefaultConfig(353316362);
  const svgA = renderPlateSvgString(cfg);
  const svgB = renderPlateSvgString(cfg);
  assert.equal(svgA, svgB);
  assert.ok(svgA.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svgA.includes('N°6362'));
});

test('deriveTraitsFromSeed respects trait locks', () => {
  const cfg = createDefaultConfig(1001);
  cfg.paletteIndex = 3;
  cfg.locks.palette = true;
  cfg.instrumentIndex = 5;
  cfg.locks.instrument = true;

  const rolled = deriveTraitsFromSeed(999888777, cfg);
  assert.equal(rolled.seed, 999888777);
  assert.equal(rolled.paletteIndex, 3);
  assert.equal(rolled.instrumentIndex, 5);
});

test('URL hash encoding and decoding round-trips key state', () => {
  const cfg = createDefaultConfig(353316362);
  cfg.paletteIndex = 4;
  cfg.layoutIndex = 2;
  cfg.instrumentIndex = 1;
  cfg.nameIndex = 14;
  cfg.complexity = 9;
  cfg.finish.risoPrint = true;
  cfg.finish.japaneseText = true;
  cfg.typography.customWordmark = 'VECTOR LAB';
  cfg.locks.palette = true;

  const hash = encodeStateToHash(cfg);
  const decoded = decodeHashToState(hash);
  assert.equal(decoded.seed, 353316362);
  assert.equal(decoded.paletteIndex, 4);
  assert.equal(decoded.layoutIndex, 2);
  assert.equal(decoded.instrumentIndex, 1);
  assert.equal(decoded.nameIndex, 14);
  assert.equal(decoded.complexity, 9);
  assert.equal(decoded.finish.risoPrint, true);
  assert.equal(decoded.finish.japaneseText, true);
  assert.equal(decoded.typography.customWordmark, 'VECTOR LAB');
  assert.equal(decoded.locks.palette, true);
  assert.equal(decoded.locks.layout, false);
});

test('custom wordmark XML escaping prevents malformed SVG', () => {
  const cfg = createDefaultConfig(123456789);
  cfg.typography.customWordmark = 'A&B <TEST>';
  const svg = renderPlateSvgString(cfg);
  assert.ok(svg.includes('A&amp;B &lt;TEST&gt;'));
  assert.ok(!svg.includes('<TEST>'));
});

test('placed SVG asset stamps render inside generated plate SVG', () => {
  const cfg = createDefaultConfig(353316362);
  const asset = BUILTIN_SVG_ASSETS[0];
  const stamp = createDefaultStamp(asset);
  cfg.stamps = [stamp];

  const svg = renderPlateSvgString(cfg);
  assert.ok(svg.includes('translate(450.0 396.0)'));
});

test('sanitizeSvgInnerContent strips scripts and inline event handlers', () => {
  const dirty = '<svg viewBox="0 0 100 100"><script>alert(1)</script><circle cx="50" cy="50" r="20" onclick="evil()"/></svg>';
  const clean = sanitizeSvgInnerContent(dirty);
  assert.ok(clean);
  assert.equal(clean.viewBox, '0 0 100 100');
  assert.ok(!clean.innerSvg.includes('<script'));
  assert.ok(!clean.innerSvg.includes('onclick'));
  assert.ok(clean.innerSvg.includes('<circle'));
});

test('contact sheet composer renders multiple plates', () => {
  const items = [101, 202, 303, 404].map((s) => deriveTraitsFromSeed(s, createDefaultConfig(s)));
  const sheet = renderContactSheetSvg(items, [], 2);
  assert.ok(sheet.includes('CONTACT SHEET // 4 PLATES'));
  assert.ok(sheet.includes('SEED 101'));
  assert.ok(sheet.includes('SEED 404'));
  const meta = getPlateMetadata(items[0]);
  assert.ok(meta.shortTitle.length > 0);
});

test('computePlateScene returns selectable boxes for all plate elements and applies elementTransforms', () => {
  const cfg = createDefaultConfig(353316362);
  cfg.finish.japaneseText = true;
  const asset = BUILTIN_SVG_ASSETS[0];
  cfg.stamps = [createDefaultStamp(asset)];

  const baseScene = computePlateScene(cfg);
  const ids = new Set(baseScene.elements.map((e) => e.id));
  for (const expectedId of [
    'primary',
    'secondary',
    'dotMatrix',
    'eyeNode',
    'swatch',
    'text:plateNumber',
    'text:series',
    'text:figure',
    'text:matrixLabel',
    'text:eyeLabel',
    'text:coords',
    'text:refTarget',
    'text:wordmark',
    'text:jpName',
    'text:subtitle',
    'text:edition',
    `stamp:${cfg.stamps[0].id}`,
  ]) {
    assert.ok(ids.has(expectedId), `Missing scene element box: ${expectedId}`);
  }

  const baseDotMatrix = baseScene.elements.find((e) => e.id === 'dotMatrix')!;
  cfg.elementTransforms = {
    dotMatrix: { dx: 40, dy: -25, scale: 1.5, rotation: 30 },
  };
  const movedScene = computePlateScene(cfg);
  const movedDotMatrix = movedScene.elements.find((e) => e.id === 'dotMatrix')!;
  assert.equal(movedDotMatrix.cx, baseDotMatrix.cx + 40);
  assert.equal(movedDotMatrix.cy, baseDotMatrix.cy - 25);
  assert.equal(movedDotMatrix.scale, 1.5);
  assert.equal(movedDotMatrix.rotation, 30);
  assert.ok(movedScene.svg.includes('rotate(30) scale(1.500)'));
});

test('all new editable text fields render cleanly into SVG output', () => {
  const cfg = createDefaultConfig(353316362);
  cfg.finish.japaneseText = true;
  cfg.typography.customWordmark = 'Kinetic-26';
  cfg.typography.customPlateNumber = 'N°9001';
  cfg.typography.customSeries = 'LAB — S09';
  cfg.typography.customFigure = 'FIG.99';
  cfg.typography.customMatrixLabel = 'MAT.77';
  cfg.typography.customEyeLabel = 'EYE.88';
  cfg.typography.customCoords = 'A.10 B.20';
  cfg.typography.customRefTarget = 'TGT/ALPHA';
  cfg.typography.customSubtitle = 'CUSTOM SUB';
  cfg.typography.customEdition = '07/50';
  cfg.typography.customJpName = '特別試作';

  const svg = renderPlateSvgString(cfg);
  for (const txt of [
    'Kinetic-26',
    'N°9001',
    'LAB — S09',
    'FIG.99',
    'MAT.77',
    'EYE.88',
    'A.10 B.20',
    'TGT/ALPHA',
    'CUSTOM SUB',
    '07/50',
    '特別試作',
  ]) {
    assert.ok(svg.includes(txt), `Expected SVG to contain "${txt}"`);
  }
});

