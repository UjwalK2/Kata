import {
  BUILTIN_PALETTES,
  INSTRUMENT_NAMES,
  LAYOUT_NAMES,
  PIECE_NAMES,
  PIECE_NAMES_JP,
  SERIES_NAMES,
} from './palettes';
import { BUILTIN_SVG_ASSETS } from './svgAssets';
import type {
  AspectRatioMode,
  ElementTransform,
  MicroSvgAsset,
  PaletteDef,
  PlacedSvgStamp,
  PlateConfig,
  PlateElementBox,
} from './types';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function createDefaultConfig(seed = 353316362): PlateConfig {
  return {
    seed,
    paletteIndex: 0,
    customPalette: null,
    layoutIndex: 0,
    instrumentIndex: 0,
    nameIndex: 0,
    locks: {
      palette: false,
      layout: false,
      instrument: false,
      name: false,
    },
    complexity: 9,
    finish: {
      wordmarkFont: 'MONO',
      risoPrint: false,
      risoOffset: 3.5,
      risoGrain: 0.25,
      japaneseText: false,
    },
    frame: {
      borderStyle: 'SINGLE',
      borderWidth: 1.5,
      cornerMarks: 'CROSSHAIR',
      gridOverlay: 'NONE',
      padding: 44,
      showHeader: true,
      showFooter: true,
      showSwatch: true,
      showCorners: true,
    },
    typography: {
      customWordmark: '',
      customSeries: '',
      customFigure: '',
      customSubtitle: '',
      customEdition: '',
      customPlateNumber: '',
      customMatrixLabel: '',
      customEyeLabel: '',
      customCoords: '',
      customRefTarget: '',
      customJpName: '',
      wordmarkSize: 44,
      letterSpacing: 3,
    },
    instrumentStyle: {
      strokeWidth: 1.8,
      scale: 1,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      secondaryInstrumentIndex: null,
      showTelemetryNodes: true,
      showConnectingVectors: true,
    },
    elementTransforms: {},
    stamps: [],
    aspect: 'SQUARE',
  };
}

export const DEFAULT_TRANSFORM: ElementTransform = {
  dx: 0,
  dy: 0,
  scale: 1,
  rotation: 0,
};

export function getElementTransform(config: PlateConfig, id: string): ElementTransform {
  return config.elementTransforms?.[id] ?? DEFAULT_TRANSFORM;
}

export function deriveTraitsFromSeed(seed: number, current: PlateConfig): PlateConfig {
  const rng = mulberry32(seed);
  const nextPalette = Math.floor(rng() * BUILTIN_PALETTES.length);
  const nextLayout = Math.floor(rng() * LAYOUT_NAMES.length);
  const nextInstrument = Math.floor(rng() * INSTRUMENT_NAMES.length);
  const nextName = Math.floor(rng() * PIECE_NAMES.length);

  return {
    ...current,
    seed,
    paletteIndex: current.locks.palette ? current.paletteIndex : nextPalette,
    customPalette: current.locks.palette ? current.customPalette : null,
    layoutIndex: current.locks.layout ? current.layoutIndex : nextLayout,
    instrumentIndex: current.locks.instrument ? current.instrumentIndex : nextInstrument,
    nameIndex: current.locks.name ? current.nameIndex : nextName,
  };
}

export function randomSeed(): number {
  return Math.floor(100000000 + Math.random() * 899999999);
}

export function getActivePalette(config: PlateConfig): PaletteDef {
  if (config.customPalette) return config.customPalette;
  const idx = ((config.paletteIndex % BUILTIN_PALETTES.length) + BUILTIN_PALETTES.length) % BUILTIN_PALETTES.length;
  return BUILTIN_PALETTES[idx];
}

export function getAspectDimensions(aspect: AspectRatioMode): { width: number; height: number } {
  switch (aspect) {
    case 'POSTER':
      return { width: 800, height: 1200 };
    case 'WIDE':
      return { width: 1200, height: 600 };
    case 'AVATAR':
      return { width: 800, height: 800 };
    case 'SQUARE':
    default:
      return { width: 900, height: 900 };
  }
}

export function getPlateMetadata(config: PlateConfig) {
  const rng = mulberry32(config.seed ^ 0x9e3779b9);
  const palette = getActivePalette(config);
  const layoutName = LAYOUT_NAMES[((config.layoutIndex % LAYOUT_NAMES.length) + LAYOUT_NAMES.length) % LAYOUT_NAMES.length];
  const instrumentName =
    INSTRUMENT_NAMES[((config.instrumentIndex % INSTRUMENT_NAMES.length) + INSTRUMENT_NAMES.length) % INSTRUMENT_NAMES.length];
  const baseName = PIECE_NAMES[((config.nameIndex % PIECE_NAMES.length) + PIECE_NAMES.length) % PIECE_NAMES.length];

  const numSuffix = String(Math.floor(rng() * 90) + 10);
  const rawPlate = config.typography.customPlateNumber?.trim();
  const plateLabel = rawPlate || `N°${String(config.seed).slice(-4).padStart(4, '0')}`;
  const seriesLetter = SERIES_NAMES[Math.floor(rng() * SERIES_NAMES.length)];
  const figNum = String((config.instrumentIndex % 12) + 1).padStart(2, '0');
  const editionNum = Math.floor(rng() * 99) + 1;
  const sysNum = (config.complexity % 9) + 1;

  const wordmark = config.typography.customWordmark?.trim()
    ? config.typography.customWordmark.trim()
    : `${baseName}—${numSuffix}`;

  const shortTitle = config.typography.customWordmark?.trim()
    ? config.typography.customWordmark.trim()
    : `${baseName}-${numSuffix}`;

  const seriesLabel = config.typography.customSeries?.trim()
    ? config.typography.customSeries.trim()
    : config.finish.japaneseText
      ? `小島図版 — SERIES ${seriesLetter}`
      : `KATA — SERIES ${seriesLetter}`;

  const figLabel = config.typography.customFigure?.trim()
    ? config.typography.customFigure.trim()
    : config.finish.japaneseText
      ? `図版.${figNum}`
      : `FIG.${figNum}`;

  const subtitleLabel = config.typography.customSubtitle?.trim()
    ? config.typography.customSubtitle.trim()
    : `SYS.${sysNum} / ${layoutName} / ${instrumentName} / ${palette.name}`;

  const editionLabel = config.typography.customEdition?.trim()
    ? config.typography.customEdition.trim()
    : `${String(editionNum).padStart(2, '0')}/100`;

  const jpName = config.typography.customJpName?.trim()
    ? config.typography.customJpName.trim()
    : PIECE_NAMES_JP[baseName] || '標本図版';

  return {
    palette,
    layoutName,
    instrumentName,
    baseName,
    wordmark,
    shortTitle,
    plateNum: plateLabel,
    seriesLabel,
    figLabel,
    subtitleLabel,
    editionLabel,
    jpName,
  };
}

function getFontFamilyCss(font: PlateConfig['finish']['wordmarkFont']): string {
  switch (font) {
    case 'CONDENSED':
      return "'Oswald', sans-serif";
    case 'GROTESK':
      return "'DM Sans', sans-serif";
    case 'MONO':
    default:
      return "'JetBrains Mono', monospace";
  }
}

function renderInstrumentPrimitives(
  instrumentIdx: number,
  cx: number,
  cy: number,
  radius: number,
  complexity: number,
  strokeWidth: number,
  ink: string,
  accent: string,
  rng: () => number
): string {
  const parts: string[] = [];
  const sw = strokeWidth;
  const name = INSTRUMENT_NAMES[((instrumentIdx % INSTRUMENT_NAMES.length) + INSTRUMENT_NAMES.length) % INSTRUMENT_NAMES.length];

  switch (name) {
    case 'BURST': {
      const rays = 10 + complexity * 2;
      const innerR = radius * 0.28;
      const outerR = radius * 0.96;
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${innerR.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(innerR * 0.24).toFixed(1)}" fill="${accent}"/>`);
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 - Math.PI / 2;
        const r1 = innerR * (i % 2 === 0 ? 1.28 : 1.48);
        const r2 = outerR * (i % 4 === 0 ? 1.0 : 0.88 + rng() * 0.12);
        const x1 = cx + Math.cos(angle) * r1;
        const y1 = cy + Math.sin(angle) * r1;
        const x2 = cx + Math.cos(angle) * r2;
        const y2 = cy + Math.sin(angle) * r2;
        parts.push(
          `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${ink}" stroke-width="${(i % 4 === 0 ? sw : sw * 0.8).toFixed(2)}"/>`
        );
      }
      break;
    }
    case 'RETICLE': {
      const rings = Math.max(2, Math.min(6, Math.floor(complexity / 2) + 1));
      for (let i = 0; i < rings; i++) {
        const r = radius * (0.3 + (i / Math.max(1, rings - 1)) * 0.65);
        const dashed = i % 2 === 1 ? ' stroke-dasharray="5 5"' : '';
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"${dashed}/>`);
      }
      const ext = radius * 1.12;
      const gap = radius * 0.26;
      parts.push(`<line x1="${cx}" y1="${cy - ext}" x2="${cx}" y2="${cy - gap}" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${cx}" y1="${cy + gap}" x2="${cx}" y2="${cy + ext}" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${cx - ext}" y1="${cy}" x2="${cx - gap}" y2="${cy}" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${cx + gap}" y1="${cy}" x2="${cx + ext}" y2="${cy}" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(sw * 2.5).toFixed(1)}" fill="${ink}"/>`);
      const pipAngle = rng() * Math.PI * 2;
      const pipR = radius * 0.62;
      parts.push(
        `<circle cx="${(cx + Math.cos(pipAngle) * pipR).toFixed(1)}" cy="${(cy + Math.sin(pipAngle) * pipR).toFixed(1)}" r="${(sw * 2.8).toFixed(1)}" fill="${accent}"/>`
      );
      break;
    }
    case 'WAVEFORM': {
      const waves = Math.max(2, Math.min(7, Math.ceil(complexity / 2)));
      const w = radius * 2.1;
      const xStart = cx - w / 2;
      parts.push(`<line x1="${xStart}" y1="${cy}" x2="${xStart + w}" y2="${cy}" stroke="${ink}" stroke-width="${(sw * 0.6).toFixed(2)}" stroke-dasharray="3 4"/>`);
      for (let row = 0; row < waves; row++) {
        const amp = radius * (0.18 + (row / waves) * 0.45);
        const freq = 1.5 + (row % 3) * 0.75;
        const phase = rng() * Math.PI;
        let d = '';
        const steps = 48;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const px = xStart + t * w;
          const env = Math.sin(t * Math.PI);
          const py = cy + Math.sin(t * Math.PI * 2 * freq + phase) * amp * env;
          d += `${s === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)} `;
        }
        const col = row === 0 ? accent : ink;
        const op = row === 0 ? 1 : Math.max(0.35, 1 - row * 0.14);
        parts.push(`<path d="${d.trim()}" fill="none" stroke="${col}" stroke-width="${(row === 0 ? sw * 1.2 : sw * 0.85).toFixed(2)}" opacity="${op.toFixed(2)}"/>`);
      }
      break;
    }
    case 'MATRIX': {
      const cols = Math.min(8, 3 + Math.floor(complexity / 2));
      const rows = cols;
      const span = radius * 1.65;
      const cell = span / (cols - 1);
      const sx = cx - span / 2;
      const sy = cy - span / 2;
      parts.push(`<rect x="${(sx - 18).toFixed(1)}" y="${(sy - 18).toFixed(1)}" width="${(span + 36).toFixed(1)}" height="${(span + 36).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${(sw * 0.7).toFixed(2)}" opacity="0.45"/>`);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = sx + c * cell;
          const py = sy + r * cell;
          const roll = rng();
          if (roll > 0.86) {
            parts.push(`<rect x="${(px - 5).toFixed(1)}" y="${(py - 5).toFixed(1)}" width="10" height="10" fill="${accent}"/>`);
          } else if (roll > 0.32) {
            parts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(2.6 + (roll > 0.65 ? 2.2 : 0)).toFixed(1)}" fill="${ink}"/>`);
          } else {
            parts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.2" fill="none" stroke="${ink}" stroke-width="1"/>`);
          }
        }
      }
      break;
    }
    case 'ORBIT': {
      const orbits = Math.max(2, Math.min(5, Math.ceil(complexity / 2.5)));
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(radius * 0.12).toFixed(1)}" fill="${accent}"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(radius * 0.22).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`);
      for (let i = 0; i < orbits; i++) {
        const rx = radius * (0.45 + i * 0.16);
        const ry = rx * (0.28 + rng() * 0.22);
        const rot = -45 + i * (135 / orbits) + rng() * 20;
        parts.push(
          `<ellipse cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${rot.toFixed(1)} ${cx} ${cy})" fill="none" stroke="${ink}" stroke-width="${(sw * 0.85).toFixed(2)}"${i % 2 === 1 ? ' stroke-dasharray="4 4"' : ''}/>`
        );
        const satA = rng() * Math.PI * 2;
        const rad = (rot * Math.PI) / 180;
        const lx = Math.cos(satA) * rx;
        const ly = Math.sin(satA) * ry;
        const gx = cx + lx * Math.cos(rad) - ly * Math.sin(rad);
        const gy = cy + lx * Math.sin(rad) + ly * Math.cos(rad);
        parts.push(`<circle cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" r="${(sw * 2.5).toFixed(1)}" fill="${i === 0 ? accent : ink}"/>`);
      }
      break;
    }
    case 'VERNIER': {
      const w = radius * 2.0;
      const h = radius * 0.9;
      const x0 = cx - w / 2;
      const y0 = cy;
      parts.push(`<rect x="${x0.toFixed(1)}" y="${(y0 - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${(x0 + w).toFixed(1)}" y2="${y0.toFixed(1)}" stroke="${ink}" stroke-width="${sw}"/>`);
      const ticks = 12 + complexity * 2;
      for (let i = 0; i <= ticks; i++) {
        const tx = x0 + (i / ticks) * w;
        const tall = i % 5 === 0 ? h * 0.34 : i % 2 === 0 ? h * 0.22 : h * 0.13;
        parts.push(`<line x1="${tx.toFixed(1)}" y1="${(y0 - tall).toFixed(1)}" x2="${tx.toFixed(1)}" y2="${y0.toFixed(1)}" stroke="${ink}" stroke-width="${(i % 5 === 0 ? sw : sw * 0.7).toFixed(2)}"/>`);
      }
      const subTicks = Math.max(8, Math.floor(ticks * 0.75));
      for (let i = 0; i <= subTicks; i++) {
        const tx = x0 + w * 0.12 + (i / subTicks) * (w * 0.76);
        const tall = i % 4 === 0 ? h * 0.3 : h * 0.16;
        parts.push(`<line x1="${tx.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${tx.toFixed(1)}" y2="${(y0 + tall).toFixed(1)}" stroke="${ink}" stroke-width="${(sw * 0.8).toFixed(2)}"/>`);
      }
      const markerX = x0 + w * (0.28 + rng() * 0.44);
      parts.push(`<line x1="${markerX.toFixed(1)}" y1="${(y0 - h * 0.6).toFixed(1)}" x2="${markerX.toFixed(1)}" y2="${(y0 + h * 0.6).toFixed(1)}" stroke="${accent}" stroke-width="${(sw * 1.4).toFixed(2)}"/>`);
      parts.push(`<polygon points="${markerX.toFixed(1)},${(y0 - h * 0.56).toFixed(1)} ${(markerX - 6).toFixed(1)},${(y0 - h * 0.68).toFixed(1)} ${(markerX + 6).toFixed(1)},${(y0 - h * 0.68).toFixed(1)}" fill="${accent}"/>`);
      break;
    }
    case 'CONTOUR': {
      const levels = 3 + Math.floor(complexity / 2);
      for (let l = 0; l < levels; l++) {
        const rBase = radius * (0.22 + (l / levels) * 0.78);
        const pts: string[] = [];
        const segs = 24;
        const wobbleSeed = l * 1.7 + rng() * 2;
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const deform = 1 + 0.14 * Math.sin(a * 3 + wobbleSeed) + 0.08 * Math.cos(a * 5 - wobbleSeed);
          const px = cx + Math.cos(a) * rBase * deform;
          const py = cy + Math.sin(a) * rBase * deform;
          pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        }
        parts.push(`<polygon points="${pts.join(' ')}" fill="none" stroke="${l === 1 ? accent : ink}" stroke-width="${(l === 1 ? sw * 1.25 : sw * 0.85).toFixed(2)}"/>`);
      }
      parts.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="${accent}"/>`);
      break;
    }
    case 'PRISM': {
      const sides = 3 + (complexity % 4);
      const layers = Math.max(2, Math.min(5, Math.ceil(complexity / 2.5)));
      for (let l = 0; l < layers; l++) {
        const r = radius * (0.28 + (l / Math.max(1, layers - 1)) * 0.68);
        const rot = l * 0.26 + rng() * 0.2;
        const pts: string[] = [];
        for (let i = 0; i < sides; i++) {
          const a = rot + (i / sides) * Math.PI * 2 - Math.PI / 2;
          pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
        }
        parts.push(`<polygon points="${pts.join(' ')}" fill="none" stroke="${l === 0 ? accent : ink}" stroke-width="${sw}"/>`);
      }
      parts.push(`<line x1="${(cx - radius * 1.15).toFixed(1)}" y1="${(cy + 16).toFixed(1)}" x2="${(cx - radius * 0.35).toFixed(1)}" y2="${(cy - 6).toFixed(1)}" stroke="${accent}" stroke-width="${(sw * 1.2).toFixed(2)}"/>`);
      parts.push(`<line x1="${(cx + radius * 0.35).toFixed(1)}" y1="${(cy - 10).toFixed(1)}" x2="${(cx + radius * 1.15).toFixed(1)}" y2="${(cy - 28).toFixed(1)}" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${(cx + radius * 0.38).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + radius * 1.15).toFixed(1)}" y2="${cy.toFixed(1)}" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${(cx + radius * 0.35).toFixed(1)}" y1="${(cy + 10).toFixed(1)}" x2="${(cx + radius * 1.15).toFixed(1)}" y2="${(cy + 28).toFixed(1)}" stroke="${accent}" stroke-width="${sw}"/>`);
      break;
    }
    case 'RADAR': {
      const rings = 4;
      for (let i = 1; i <= rings; i++) {
        const r = (radius * i) / rings;
        parts.push(`<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${(i === rings ? sw : sw * 0.65).toFixed(2)}"${i % 2 === 1 ? ' stroke-dasharray="3 4"' : ''}/>`);
      }
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        parts.push(`<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(ang) * radius).toFixed(1)}" y2="${(cy + Math.sin(ang) * radius).toFixed(1)}" stroke="${ink}" stroke-width="${(sw * 0.5).toFixed(2)}" opacity="0.4"/>`);
      }
      const startAng = rng() * Math.PI * 2;
      const sweep = Math.PI * 0.38;
      const x1 = cx + Math.cos(startAng) * radius;
      const y1 = cy + Math.sin(startAng) * radius;
      const x2 = cx + Math.cos(startAng + sweep) * radius;
      const y2 = cy + Math.sin(startAng + sweep) * radius;
      parts.push(`<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 0,1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${accent}" fill-opacity="0.24" stroke="${accent}" stroke-width="${sw}"/>`);
      const blips = 2 + Math.floor(complexity / 3);
      for (let b = 0; b < blips; b++) {
        const br = radius * (0.25 + rng() * 0.65);
        const ba = rng() * Math.PI * 2;
        parts.push(`<circle cx="${(cx + Math.cos(ba) * br).toFixed(1)}" cy="${(cy + Math.sin(ba) * br).toFixed(1)}" r="3.5" fill="${b === 0 ? accent : ink}"/>`);
      }
      break;
    }
    case 'SPECTRUM': {
      const bars = 8 + complexity * 2;
      const w = radius * 1.9;
      const barW = (w / bars) * 0.64;
      const step = w / bars;
      const x0 = cx - w / 2;
      const baseY = cy + radius * 0.58;
      parts.push(`<line x1="${x0.toFixed(1)}" y1="${baseY.toFixed(1)}" x2="${(x0 + w).toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="${ink}" stroke-width="${sw}"/>`);
      const peakIdx = Math.floor(rng() * bars);
      for (let i = 0; i < bars; i++) {
        const h = radius * (0.16 + rng() * 0.95);
        const bx = x0 + i * step;
        const by = baseY - h;
        const isPeak = i === peakIdx || i === peakIdx - 1;
        parts.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${isPeak ? accent : ink}"/>`);
      }
      break;
    }
    case 'ISOMETRIC': {
      const r = radius * 0.86;
      const pts: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      parts.push(`<polygon points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<polyline points="${pts[5][0].toFixed(1)},${pts[5][1].toFixed(1)} ${cx.toFixed(1)},${cy.toFixed(1)} ${pts[1][0].toFixed(1)},${pts[1][1].toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${pts[3][0].toFixed(1)}" y2="${pts[3][1].toFixed(1)}" stroke="${ink}" stroke-width="${sw}"/>`);
      const ir = r * 0.45;
      const ipts: [number, number][] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        ipts.push([cx + Math.cos(a) * ir, cy + Math.sin(a) * ir]);
      }
      parts.push(`<polygon points="${ipts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}" fill="none" stroke="${accent}" stroke-width="${(sw * 1.1).toFixed(2)}" stroke-dasharray="4 3"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="3.5" fill="${accent}"/>`);
      break;
    }
    case 'ASTROLABE':
    default: {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${radius.toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${sw}"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${(radius * 0.72).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${(sw * 0.8).toFixed(2)}"/>`);
      parts.push(`<circle cx="${cx}" cy="${(cy - radius * 0.22).toFixed(1)}" r="${(radius * 0.5).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="${(sw * 0.8).toFixed(2)}" stroke-dasharray="3 4"/>`);
      const degMarks = 12 + complexity * 2;
      for (let i = 0; i < degMarks; i++) {
        const a = (i / degMarks) * Math.PI * 2;
        const r1 = radius * 0.88;
        const r2 = radius;
        parts.push(`<line x1="${(cx + Math.cos(a) * r1).toFixed(1)}" y1="${(cy + Math.sin(a) * r1).toFixed(1)}" x2="${(cx + Math.cos(a) * r2).toFixed(1)}" y2="${(cy + Math.sin(a) * r2).toFixed(1)}" stroke="${ink}" stroke-width="${(sw * 0.7).toFixed(2)}"/>`);
      }
      const pointerA = rng() * Math.PI * 2;
      parts.push(`<line x1="${(cx - Math.cos(pointerA) * radius * 0.92).toFixed(1)}" y1="${(cy - Math.sin(pointerA) * radius * 0.92).toFixed(1)}" x2="${(cx + Math.cos(pointerA) * radius * 0.92).toFixed(1)}" y2="${(cy + Math.sin(pointerA) * radius * 0.92).toFixed(1)}" stroke="${accent}" stroke-width="${(sw * 1.3).toFixed(2)}"/>`);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="4.5" fill="${ink}"/>`);
      break;
    }
  }

  return parts.join('\n');
}

function wrapElementTransform(
  inner: string,
  cx: number,
  cy: number,
  t: ElementTransform
): string {
  if (t.dx === 0 && t.dy === 0 && t.scale === 1 && t.rotation === 0) {
    return inner;
  }
  return `<g transform="translate(${(cx + t.dx).toFixed(1)} ${(cy + t.dy).toFixed(1)}) rotate(${t.rotation}) scale(${t.scale.toFixed(3)}) translate(${(-cx).toFixed(1)} ${(-cy).toFixed(1)})">${inner}</g>`;
}

export interface PlateSceneResult {
  svg: string;
  width: number;
  height: number;
  stageW: number;
  stageH: number;
  elements: PlateElementBox[];
}

export function computePlateScene(
  config: PlateConfig,
  customAssets: MicroSvgAsset[] = [],
  overrideSize?: { width: number; height: number; idPrefix?: string }
): PlateSceneResult {
  const width = overrideSize?.width ?? getAspectDimensions(config.aspect).width;
  const height = overrideSize?.height ?? getAspectDimensions(config.aspect).height;
  const uid = overrideSize?.idPrefix ?? `${width}x${height}-${config.seed}`;
  const clipId = `plate-clip-${uid}`;
  const grainFilterId = `riso-grain-${uid}`;

  const meta = getPlateMetadata(config);
  const { palette } = meta;
  const rng = mulberry32(config.seed);

  const pad = Math.max(18, Math.min(80, config.frame.padding));
  const innerX = pad;
  const innerY = pad;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const headerH = config.frame.showHeader ? 56 : 16;
  const footerH = config.frame.showFooter ? 124 : 16;
  const stageX = innerX + 24;
  const stageY = innerY + headerH;
  const stageW = innerW - 48;
  const stageH = Math.max(180, innerH - headerH - footerH);

  // Determine layout coordinates for primary + secondary sub-elements
  const layoutName = meta.layoutName;
  let primaryCx = stageX + stageW * 0.42;
  let primaryCy = stageY + stageH * 0.44;
  let primaryR = Math.min(stageW, stageH) * 0.3;

  let secondaryCx = stageX + stageW * 0.74;
  let secondaryCy = stageY + stageH * 0.72;
  let secondaryR = Math.min(stageW, stageH) * 0.15;

  switch (layoutName) {
    case 'CENTERED':
      primaryCx = stageX + stageW * 0.5;
      primaryCy = stageY + stageH * 0.48;
      primaryR = Math.min(stageW, stageH) * 0.33;
      secondaryCx = stageX + stageW * 0.78;
      secondaryCy = stageY + stageH * 0.24;
      secondaryR = Math.min(stageW, stageH) * 0.11;
      break;
    case 'SPLIT':
      primaryCx = stageX + stageW * 0.32;
      primaryCy = stageY + stageH * 0.5;
      primaryR = Math.min(stageW, stageH) * 0.25;
      secondaryCx = stageX + stageW * 0.72;
      secondaryCy = stageY + stageH * 0.5;
      secondaryR = Math.min(stageW, stageH) * 0.18;
      break;
    case 'QUADRANT':
      primaryCx = stageX + stageW * 0.3;
      primaryCy = stageY + stageH * 0.36;
      primaryR = Math.min(stageW, stageH) * 0.23;
      secondaryCx = stageX + stageW * 0.72;
      secondaryCy = stageY + stageH * 0.7;
      secondaryR = Math.min(stageW, stageH) * 0.17;
      break;
    case 'DIAGONAL':
      primaryCx = stageX + stageW * 0.62;
      primaryCy = stageY + stageH * 0.36;
      primaryR = Math.min(stageW, stageH) * 0.26;
      secondaryCx = stageX + stageW * 0.28;
      secondaryCy = stageY + stageH * 0.72;
      secondaryR = Math.min(stageW, stageH) * 0.15;
      break;
    case 'ORBITAL':
      primaryCx = stageX + stageW * 0.52;
      primaryCy = stageY + stageH * 0.5;
      primaryR = Math.min(stageW, stageH) * 0.31;
      secondaryCx = stageX + stageW * 0.22;
      secondaryCy = stageY + stageH * 0.26;
      secondaryR = Math.min(stageW, stageH) * 0.12;
      break;
    case 'MODULAR':
      primaryCx = stageX + stageW * 0.38;
      primaryCy = stageY + stageH * 0.52;
      primaryR = Math.min(stageW, stageH) * 0.26;
      secondaryCx = stageX + stageW * 0.74;
      secondaryCy = stageY + stageH * 0.32;
      secondaryR = Math.min(stageW, stageH) * 0.14;
      break;
    case 'CASCADE':
      primaryCx = stageX + stageW * 0.36;
      primaryCy = stageY + stageH * 0.38;
      primaryR = Math.min(stageW, stageH) * 0.26;
      secondaryCx = stageX + stageW * 0.68;
      secondaryCy = stageY + stageH * 0.68;
      secondaryR = Math.min(stageW, stageH) * 0.17;
      break;
    case 'OFFSET':
    default:
      break;
  }

  // Clamp secondary instrument comfortably inside the stage
  const secMargin = secondaryR * 1.15 + 16;
  secondaryCx = Math.max(stageX + secMargin, Math.min(stageX + stageW - secMargin, secondaryCx));
  secondaryCy = Math.max(stageY + secMargin, Math.min(stageY + stageH - secMargin, secondaryCy));

  // Primary instrument transform (synced with instrumentStyle)
  primaryCx += (config.instrumentStyle.offsetX / 100) * stageW * 0.4;
  primaryCy += (config.instrumentStyle.offsetY / 100) * stageH * 0.4;
  const scaledPrimaryR = primaryR * config.instrumentStyle.scale;

  // Secondary instrument transform
  const secT = getElementTransform(config, 'secondary');
  const secCenterX = secondaryCx + secT.dx;
  const secCenterY = secondaryCy + secT.dy;

  const elements: PlateElementBox[] = [];
  const layers: string[] = [];

  // Defs (Riso grain filter + unique clipPath)
  layers.push(`<defs>`);
  if (config.finish.risoPrint) {
    layers.push(`
      <filter id="${grainFilterId}" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="${config.seed % 999}" result="noise"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${(config.finish.risoGrain * 0.38).toFixed(2)} 0" in="noise" result="coloredNoise"/>
        <feComposite operator="in" in2="SourceGraphic"/>
      </filter>
    `);
  }
  layers.push(`<clipPath id="${clipId}"><rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}"/></clipPath>`);
  layers.push(`</defs>`);

  // Background
  layers.push(`<rect width="${width}" height="${height}" fill="${palette.bg}"/>`);

  // Background Grid Overlay
  if (config.frame.gridOverlay !== 'NONE') {
    const gridParts: string[] = [];
    const step = Math.max(28, 68 - config.complexity * 3);
    if (config.frame.gridOverlay === 'DOTS') {
      for (let gx = innerX + step; gx < innerX + innerW; gx += step) {
        for (let gy = innerY + step; gy < innerY + innerH; gy += step) {
          gridParts.push(`<circle cx="${gx}" cy="${gy}" r="1" fill="${palette.ink}" opacity="0.22"/>`);
        }
      }
    } else if (config.frame.gridOverlay === 'CROSSES') {
      for (let gx = innerX + step; gx < innerX + innerW; gx += step) {
        for (let gy = innerY + step; gy < innerY + innerH; gy += step) {
          gridParts.push(`<path d="M${gx - 3},${gy} L${gx + 3},${gy} M${gx},${gy - 3} L${gx},${gy + 3}" stroke="${palette.ink}" stroke-width="0.8" opacity="0.2"/>`);
        }
      }
    } else if (config.frame.gridOverlay === 'LINES' || config.frame.gridOverlay === 'SUBDIVIDED') {
      const lineStep = config.frame.gridOverlay === 'SUBDIVIDED' ? step : step * 1.5;
      for (let gx = innerX + lineStep; gx < innerX + innerW; gx += lineStep) {
        gridParts.push(`<line x1="${gx}" y1="${innerY}" x2="${gx}" y2="${innerY + innerH}" stroke="${palette.ink}" stroke-width="0.6" opacity="0.12"/>`);
      }
      for (let gy = innerY + lineStep; gy < innerY + innerH; gy += lineStep) {
        gridParts.push(`<line x1="${innerX}" y1="${gy}" x2="${innerX + innerW}" y2="${gy}" stroke="${palette.ink}" stroke-width="0.6" opacity="0.12"/>`);
      }
    }
    layers.push(`<g clip-path="url(#${clipId})">${gridParts.join('')}</g>`);
  }

  // Plate Frame Border
  if (config.frame.borderStyle !== 'NONE') {
    const bw = config.frame.borderWidth;
    const dash = config.frame.borderStyle === 'DASHED' ? ' stroke-dasharray="8 6"' : '';
    layers.push(
      `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="${palette.ink}" stroke-width="${bw}" opacity="0.72"${dash}/>`
    );
    if (config.frame.borderStyle === 'DOUBLE') {
      const gap = 6;
      layers.push(
        `<rect x="${innerX + gap}" y="${innerY + gap}" width="${innerW - gap * 2}" height="${innerH - gap * 2}" fill="none" stroke="${palette.ink}" stroke-width="${Math.max(0.75, bw * 0.6)}" opacity="0.45"/>`
      );
    }
  }

  // Corner Registration Marks
  if (config.frame.showCorners && config.frame.cornerMarks !== 'NONE') {
    const corners: [number, number, number, number][] = [
      [innerX + 18, innerY + 20, 1, 1],
      [innerX + innerW - 18, innerY + 20, -1, 1],
      [innerX + 18, innerY + innerH - 20, 1, -1],
      [innerX + innerW - 18, innerY + innerH - 20, -1, -1],
    ];
    for (const [cx, cy, dx, dy] of corners) {
      if (config.frame.cornerMarks === 'CROSSHAIR') {
        layers.push(`<path d="M${cx - 7},${cy} L${cx + 7},${cy} M${cx},${cy - 7} L${cx},${cy + 7}" stroke="${palette.ink}" stroke-width="1.1" opacity="0.75"/>`);
      } else if (config.frame.cornerMarks === 'BRACKET') {
        layers.push(`<path d="M${cx},${cy + dy * 10} L${cx},${cy} L${cx + dx * 10},${cy}" fill="none" stroke="${palette.ink}" stroke-width="1.3" opacity="0.8"/>`);
      } else if (config.frame.cornerMarks === 'DOT') {
        layers.push(`<circle cx="${cx}" cy="${cy}" r="2.6" fill="${palette.ink}" opacity="0.8"/>`);
      } else if (config.frame.cornerMarks === 'CIRCLE') {
        layers.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${palette.ink}" stroke-width="1.1" opacity="0.75"/>`);
      }
    }
  }

  // Header metadata row inside plate
  if (config.frame.showHeader) {
    const hy = innerY + 46;

    // Plate Number
    const pnT = getElementTransform(config, 'text:plateNumber');
    const pnW = Math.max(44, meta.plateNum.length * 9.8);
    const pnCx = innerX + 26 + pnW / 2;
    const pnCy = hy - 5;
    layers.push(
      wrapElementTransform(
        `<text x="${innerX + 26}" y="${hy}" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="1.8" opacity="0.88">${escapeXml(meta.plateNum)}</text>`,
        pnCx,
        pnCy,
        pnT
      )
    );
    elements.push({
      id: 'text:plateNumber',
      kind: 'text',
      label: 'Plate Number',
      cx: pnCx + pnT.dx,
      cy: pnCy + pnT.dy,
      width: pnW * pnT.scale,
      height: 22 * pnT.scale,
      rotation: pnT.rotation,
      scale: pnT.scale,
      textValue: meta.plateNum,
      textField: 'customPlateNumber',
    });

    // Series Label
    const srT = getElementTransform(config, 'text:series');
    const srW = Math.max(80, meta.seriesLabel.length * 10.2);
    const srCx = innerX + innerW / 2;
    const srCy = hy - 5;
    layers.push(
      wrapElementTransform(
        `<text x="${srCx}" y="${hy}" text-anchor="middle" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2.2" opacity="0.88">${escapeXml(meta.seriesLabel)}</text>`,
        srCx,
        srCy,
        srT
      )
    );
    elements.push({
      id: 'text:series',
      kind: 'text',
      label: 'Series Header',
      cx: srCx + srT.dx,
      cy: srCy + srT.dy,
      width: srW * srT.scale,
      height: 22 * srT.scale,
      rotation: srT.rotation,
      scale: srT.scale,
      textValue: meta.seriesLabel,
      textField: 'customSeries',
    });

    // Figure Label
    const fgT = getElementTransform(config, 'text:figure');
    const fgW = Math.max(44, meta.figLabel.length * 9.8);
    const fgCx = innerX + innerW - 26 - fgW / 2;
    const fgCy = hy - 5;
    layers.push(
      wrapElementTransform(
        `<text x="${innerX + innerW - 26}" y="${hy}" text-anchor="end" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="1.8" opacity="0.88">${escapeXml(meta.figLabel)}</text>`,
        fgCx,
        fgCy,
        fgT
      )
    );
    elements.push({
      id: 'text:figure',
      kind: 'text',
      label: 'Figure Label',
      cx: fgCx + fgT.dx,
      cy: fgCy + fgT.dy,
      width: fgW * fgT.scale,
      height: 22 * fgT.scale,
      rotation: fgT.rotation,
      scale: fgT.scale,
      textValue: meta.figLabel,
      textField: 'customFigure',
    });
  }

  // Telemetry micro-clusters & connecting vectors
  const bodyParts: string[] = [];

  if (config.instrumentStyle.showTelemetryNodes) {
    // Top-left micro dot matrix
    const mx = stageX + 30;
    const my = stageY + 24;
    const mCols = 5;
    const mRows = Math.min(4, Math.max(2, Math.floor(config.complexity / 3)));
    const matrixDots: string[] = [];
    for (let r = 0; r < mRows; r++) {
      for (let c = 0; c < mCols; c++) {
        const active = rng() > 0.22;
        matrixDots.push(
          `<circle cx="${mx + c * 11}" cy="${my + r * 11}" r="${active ? 2.1 : 1.1}" fill="${palette.ink}" opacity="${active ? 0.9 : 0.35}"/>`
        );
      }
    }
    const dmW = (mCols - 1) * 11 + 14;
    const dmH = (mRows - 1) * 11 + 14;
    const dmCx = mx + ((mCols - 1) * 11) / 2;
    const dmCy = my + ((mRows - 1) * 11) / 2;
    const dmT = getElementTransform(config, 'dotMatrix');
    bodyParts.push(wrapElementTransform(matrixDots.join('\n'), dmCx, dmCy, dmT));
    elements.push({
      id: 'dotMatrix',
      kind: 'node',
      label: 'Dot Matrix',
      cx: dmCx + dmT.dx,
      cy: dmCy + dmT.dy,
      width: dmW * dmT.scale,
      height: dmH * dmT.scale,
      rotation: dmT.rotation,
      scale: dmT.scale,
    });

    const mNum = String(Math.floor(rng() * 80) + 10);
    const matrixText =
      config.typography.customMatrixLabel?.trim() ||
      (config.finish.japaneseText ? `標.${mNum}` : `M.${mNum}`);
    const mlX = mx + 22;
    const mlY = my + mRows * 11 + 18;
    const mlT = getElementTransform(config, 'text:matrixLabel');
    const mlW = Math.max(38, matrixText.length * 9);
    bodyParts.push(
      wrapElementTransform(
        `<text x="${mlX}" y="${mlY}" text-anchor="middle" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1.5" opacity="0.85">${escapeXml(matrixText)}</text>`,
        mlX,
        mlY - 4,
        mlT
      )
    );
    elements.push({
      id: 'text:matrixLabel',
      kind: 'text',
      label: 'Matrix Label',
      cx: mlX + mlT.dx,
      cy: mlY - 4 + mlT.dy,
      width: mlW * mlT.scale,
      height: 20 * mlT.scale,
      rotation: mlT.rotation,
      scale: mlT.scale,
      textValue: matrixText,
      textField: 'customMatrixLabel',
    });

    // Top-right mini eye/target node
    const ex = stageX + stageW - 44;
    const ey = stageY + 34;
    const eyeT = getElementTransform(config, 'eyeNode');
    const eyePrimitives = `<circle cx="${ex}" cy="${ey}" r="18" fill="none" stroke="${palette.ink}" stroke-width="1.3"/><circle cx="${ex}" cy="${ey}" r="4.5" fill="${palette.accent}"/>`;
    bodyParts.push(wrapElementTransform(eyePrimitives, ex, ey, eyeT));
    elements.push({
      id: 'eyeNode',
      kind: 'node',
      label: 'Beacon Node',
      cx: ex + eyeT.dx,
      cy: ey + eyeT.dy,
      width: 44 * eyeT.scale,
      height: 44 * eyeT.scale,
      rotation: eyeT.rotation,
      scale: eyeT.scale,
    });

    const yNum = String(Math.floor(rng() * 80) + 10);
    const eyeText = config.typography.customEyeLabel?.trim() || `Y.${yNum}`;
    const elY = ey + 36;
    const elT = getElementTransform(config, 'text:eyeLabel');
    const elW = Math.max(38, eyeText.length * 9);
    bodyParts.push(
      wrapElementTransform(
        `<text x="${ex}" y="${elY}" text-anchor="middle" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1.5" opacity="0.85">${escapeXml(eyeText)}</text>`,
        ex,
        elY - 4,
        elT
      )
    );
    elements.push({
      id: 'text:eyeLabel',
      kind: 'text',
      label: 'Beacon Label',
      cx: ex + elT.dx,
      cy: elY - 4 + elT.dy,
      width: elW * elT.scale,
      height: 20 * elT.scale,
      rotation: elT.rotation,
      scale: elT.scale,
      textValue: eyeText,
      textField: 'customEyeLabel',
    });

    // Bottom-left coordinate readout
    const cxRead = String(Math.floor(rng() * 89) + 10);
    const cyRead = String(Math.floor(rng() * 89) + 10);
    const coordsText =
      config.typography.customCoords?.trim() ||
      (config.finish.japaneseText ? `座.${cxRead} 縦.${cyRead}` : `X.${cxRead} Y.${cyRead}`);
    const coX = stageX + 30;
    const coY = stageY + stageH - 18;
    const coW = Math.max(64, coordsText.length * 9.2);
    const coCx = coX + coW / 2;
    const coCy = coY - 4;
    const coT = getElementTransform(config, 'text:coords');
    bodyParts.push(
      wrapElementTransform(
        `<text x="${coX}" y="${coY}" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1.6" opacity="0.82">${escapeXml(coordsText)}</text>`,
        coCx,
        coCy,
        coT
      )
    );
    elements.push({
      id: 'text:coords',
      kind: 'text',
      label: 'Coordinates',
      cx: coCx + coT.dx,
      cy: coCy + coT.dy,
      width: coW * coT.scale,
      height: 20 * coT.scale,
      rotation: coT.rotation,
      scale: coT.scale,
      textValue: coordsText,
      textField: 'customCoords',
    });
  }

  // Connecting dashed vector from primary to secondary node
  if (config.instrumentStyle.showConnectingVectors) {
    const dx = secCenterX - primaryCx;
    const dy = secCenterY - primaryCy;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const scaledSecR = secondaryR * secT.scale;
    const p1x = primaryCx + ux * (scaledPrimaryR * 0.92);
    const p1y = primaryCy + uy * (scaledPrimaryR * 0.92);
    const p2x = secCenterX - ux * (scaledSecR * 1.15);
    const p2y = secCenterY - uy * (scaledSecR * 1.15);

    if (dist > scaledPrimaryR + scaledSecR + 20) {
      bodyParts.push(`<circle cx="${p1x.toFixed(1)}" cy="${p1y.toFixed(1)}" r="3.2" fill="${palette.ink}"/>`);
      bodyParts.push(
        `<line x1="${(p1x + ux * 10).toFixed(1)}" y1="${(p1y + uy * 10).toFixed(1)}" x2="${p2x.toFixed(1)}" y2="${p2y.toFixed(1)}" stroke="${palette.ink}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.8"/>`
      );
      const ang = Math.atan2(uy, ux);
      const ah1x = p2x - Math.cos(ang - 0.5) * 9;
      const ah1y = p2y - Math.sin(ang - 0.5) * 9;
      const ah2x = p2x - Math.cos(ang + 0.5) * 9;
      const ah2y = p2y - Math.sin(ang + 0.5) * 9;
      bodyParts.push(
        `<polyline points="${ah1x.toFixed(1)},${ah1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)} ${ah2x.toFixed(1)},${ah2y.toFixed(1)}" fill="none" stroke="${palette.ink}" stroke-width="1.2" opacity="0.85"/>`
      );
    }

    // Secondary target instrument
    const secIdx = config.instrumentStyle.secondaryInstrumentIndex !== null
      ? config.instrumentStyle.secondaryInstrumentIndex
      : 1; // RETICLE
    const secPrimitives = renderInstrumentPrimitives(
      secIdx,
      secondaryCx,
      secondaryCy,
      secondaryR,
      Math.max(2, Math.floor(config.complexity * 0.6)),
      Math.max(1, config.instrumentStyle.strokeWidth * 0.85),
      palette.ink,
      palette.accent,
      rng
    );
    bodyParts.push(wrapElementTransform(secPrimitives, secondaryCx, secondaryCy, secT));
    elements.push({
      id: 'secondary',
      kind: 'instrument',
      label: 'Secondary Target',
      cx: secCenterX,
      cy: secCenterY,
      width: secondaryR * 2.25 * secT.scale,
      height: secondaryR * 2.25 * secT.scale,
      rotation: secT.rotation,
      scale: secT.scale,
    });

    const refText =
      config.typography.customRefTarget?.trim() ||
      (config.finish.japaneseText ? '基準/標的' : 'REF/TARGET');
    const placeLabelRight = secondaryCx < stageX + stageW * 0.45;
    const refX = placeLabelRight
      ? secondaryCx + secondaryR + 14
      : secondaryCx - secondaryR - 14;
    const refAnchor = placeLabelRight ? 'start' : 'end';
    const refW = Math.max(64, refText.length * 8.8);
    const refCx = placeLabelRight ? refX + refW / 2 : refX - refW / 2;
    const refCy = secondaryCy;
    const refT = getElementTransform(config, 'text:refTarget');
    bodyParts.push(
      wrapElementTransform(
        `<text x="${refX.toFixed(1)}" y="${(secondaryCy + 4).toFixed(1)}" text-anchor="${refAnchor}" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="11.5" letter-spacing="1.5" opacity="0.82">${escapeXml(refText)}</text>`,
        refCx,
        refCy,
        refT
      )
    );
    elements.push({
      id: 'text:refTarget',
      kind: 'text',
      label: 'Target Label',
      cx: refCx + refT.dx,
      cy: refCy + refT.dy,
      width: refW * refT.scale,
      height: 20 * refT.scale,
      rotation: refT.rotation,
      scale: refT.scale,
      textValue: refText,
      textField: 'customRefTarget',
    });
  }

  // Primary Instrument (with rotation transform around primaryCx, primaryCy)
  const primarySvg = renderInstrumentPrimitives(
    config.instrumentIndex,
    primaryCx,
    primaryCy,
    scaledPrimaryR,
    config.complexity,
    config.instrumentStyle.strokeWidth,
    palette.ink,
    palette.accent,
    rng
  );
  const rotTransform =
    config.instrumentStyle.rotation !== 0
      ? ` transform="rotate(${config.instrumentStyle.rotation} ${primaryCx.toFixed(1)} ${primaryCy.toFixed(1)})"`
      : '';
  bodyParts.push(`<g${rotTransform}>${primarySvg}</g>`);
  elements.push({
    id: 'primary',
    kind: 'instrument',
    label: `Primary (${meta.instrumentName})`,
    cx: primaryCx,
    cy: primaryCy,
    width: scaledPrimaryR * 2.15,
    height: scaledPrimaryR * 2.15,
    rotation: config.instrumentStyle.rotation,
    scale: config.instrumentStyle.scale,
  });

  // User-Placed Micro-Graphic SVG Stamps
  const allAssets = [...BUILTIN_SVG_ASSETS, ...customAssets];
  for (const stamp of config.stamps) {
    const asset = allAssets.find((a) => a.id === stamp.assetId);
    if (!asset) continue;
    const sx = (stamp.x / 1000) * width;
    const sy = (stamp.y / 1000) * height;
    const color =
      stamp.colorMode === 'accent'
        ? palette.accent
        : stamp.colorMode === 'custom'
          ? stamp.customColor
          : palette.ink;
    const flipX = stamp.flipX ? -1 : 1;
    const flipY = stamp.flipY ? -1 : 1;
    const scaleX = stamp.scale * flipX;
    const scaleY = stamp.scale * flipY;
    bodyParts.push(`
      <g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${stamp.rotation}) scale(${scaleX.toFixed(2)} ${scaleY.toFixed(2)}) translate(-50 -50)"
         color="${color}" opacity="${stamp.opacity.toFixed(2)}" style="color: ${color};">
        <g stroke-width="${stamp.strokeWidth}">
          ${asset.innerSvg}
        </g>
      </g>
    `);
    elements.push({
      id: `stamp:${stamp.id}`,
      kind: 'stamp',
      label: stamp.name,
      cx: sx,
      cy: sy,
      width: 96 * stamp.scale,
      height: 96 * stamp.scale,
      rotation: stamp.rotation,
      scale: stamp.scale,
      stampId: stamp.id,
    });
  }

  // Riso Print Misregistered Accent Plate
  if (config.finish.risoPrint) {
    const ro = config.finish.risoOffset;
    layers.push(
      `<g clip-path="url(#${clipId})" opacity="0.24" transform="translate(${ro.toFixed(1)} ${(ro * 0.7).toFixed(1)})" style="mix-blend-mode: screen;">${bodyParts.join('\n')}</g>`
    );
  }

  layers.push(`<g clip-path="url(#${clipId})">${bodyParts.join('\n')}</g>`);

  // Footer / Wordmark Specimen Band
  if (config.frame.showFooter) {
    const ruleY = innerY + innerH - 112;
    layers.push(
      `<line x1="${innerX + 26}" y1="${ruleY}" x2="${innerX + innerW - 26}" y2="${ruleY}" stroke="${palette.ink}" stroke-width="1.2" opacity="0.72"/>`
    );

    const fontFam = getFontFamilyCss(config.finish.wordmarkFont);
    const wmY = ruleY + 50;
    const baseWmSize = Math.max(22, Math.min(72, config.typography.wordmarkSize));
    const maxWmWidth = innerW - 180;
    const estWidth = meta.wordmark.length * (baseWmSize * 0.64 + config.typography.letterSpacing);
    const wmSize = estWidth > maxWmWidth ? Math.max(22, Math.floor((baseWmSize * maxWmWidth) / estWidth)) : baseWmSize;
    const wmLs = config.typography.letterSpacing;

    const wmActualW = Math.max(90, meta.wordmark.length * (wmSize * 0.62 + wmLs));
    const wmCx = innerX + 26 + wmActualW / 2;
    const wmCy = wmY - wmSize * 0.36;
    const wmT = getElementTransform(config, 'text:wordmark');
    layers.push(
      wrapElementTransform(
        `<text x="${innerX + 26}" y="${wmY}" fill="${palette.ink}" font-family="${fontFam}" font-size="${wmSize}" font-weight="600" letter-spacing="${wmLs}">${escapeXml(meta.wordmark)}</text>`,
        wmCx,
        wmCy,
        wmT
      )
    );
    elements.push({
      id: 'text:wordmark',
      kind: 'text',
      label: 'Wordmark',
      cx: wmCx + wmT.dx,
      cy: wmCy + wmT.dy,
      width: wmActualW * wmT.scale,
      height: wmSize * 1.05 * wmT.scale,
      rotation: wmT.rotation,
      scale: wmT.scale,
      textValue: meta.wordmark,
      textField: 'customWordmark',
    });

    if (config.finish.japaneseText) {
      const jpW = Math.max(52, meta.jpName.length * 16);
      const jpCx = innerX + innerW - 26 - jpW / 2;
      const jpCy = wmY - 30;
      const jpT = getElementTransform(config, 'text:jpName');
      layers.push(
        wrapElementTransform(
          `<text x="${innerX + innerW - 26}" y="${wmY - 26}" text-anchor="end" fill="${palette.accent}" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="2">${escapeXml(meta.jpName)}</text>`,
          jpCx,
          jpCy,
          jpT
        )
      );
      elements.push({
        id: 'text:jpName',
        kind: 'text',
        label: 'Japanese Label',
        cx: jpCx + jpT.dx,
        cy: jpCy + jpT.dy,
        width: jpW * jpT.scale,
        height: 22 * jpT.scale,
        rotation: jpT.rotation,
        scale: jpT.scale,
        textValue: meta.jpName,
        textField: 'customJpName',
      });
    }

    const subW = Math.max(120, meta.subtitleLabel.length * 8.8);
    const subCx = innerX + 26 + subW / 2;
    const subCy = ruleY + 76;
    const subT = getElementTransform(config, 'text:subtitle');
    layers.push(
      wrapElementTransform(
        `<text x="${innerX + 26}" y="${ruleY + 80}" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1.6" opacity="0.78">${escapeXml(meta.subtitleLabel)}</text>`,
        subCx,
        subCy,
        subT
      )
    );
    elements.push({
      id: 'text:subtitle',
      kind: 'text',
      label: 'Subtitle Line',
      cx: subCx + subT.dx,
      cy: subCy + subT.dy,
      width: subW * subT.scale,
      height: 20 * subT.scale,
      rotation: subT.rotation,
      scale: subT.scale,
      textValue: meta.subtitleLabel,
      textField: 'customSubtitle',
    });

    const edX = config.frame.showSwatch ? innerX + innerW - 56 : innerX + innerW - 26;
    const edW = Math.max(48, meta.editionLabel.length * 10);
    const edCx = edX - edW / 2;
    const edCy = wmY - 12;
    const edT = getElementTransform(config, 'text:edition');
    layers.push(
      wrapElementTransform(
        `<text x="${edX}" y="${wmY - 8}" text-anchor="end" fill="${palette.ink}" font-family="'JetBrains Mono', monospace" font-size="14" letter-spacing="1.4" opacity="0.88">${escapeXml(meta.editionLabel)}</text>`,
        edCx,
        edCy,
        edT
      )
    );
    elements.push({
      id: 'text:edition',
      kind: 'text',
      label: 'Edition Tag',
      cx: edCx + edT.dx,
      cy: edCy + edT.dy,
      width: edW * edT.scale,
      height: 22 * edT.scale,
      rotation: edT.rotation,
      scale: edT.scale,
      textValue: meta.editionLabel,
      textField: 'customEdition',
    });

    if (config.frame.showSwatch) {
      const swCx = innerX + innerW - 35;
      const swCy = wmY - 13;
      const swT = getElementTransform(config, 'swatch');
      layers.push(
        wrapElementTransform(
          `<rect x="${innerX + innerW - 44}" y="${wmY - 22}" width="18" height="18" fill="${palette.accent}"/>`,
          swCx,
          swCy,
          swT
        )
      );
      elements.push({
        id: 'swatch',
        kind: 'node',
        label: 'Accent Swatch',
        cx: swCx + swT.dx,
        cy: swCy + swT.dy,
        width: 24 * swT.scale,
        height: 24 * swT.scale,
        rotation: swT.rotation,
        scale: swT.scale,
      });
    }
  }

  if (config.finish.risoPrint) {
    layers.push(`<rect width="${width}" height="${height}" fill="${palette.ink}" filter="url(#${grainFilterId})" opacity="0.65" pointer-events="none"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${layers.join('\n')}\n</svg>`;

  return { svg, width, height, stageW, stageH, elements };
}

export function renderPlateSvgString(
  config: PlateConfig,
  customAssets: MicroSvgAsset[] = [],
  overrideSize?: { width: number; height: number; idPrefix?: string }
): string {
  return computePlateScene(config, customAssets, overrideSize).svg;
}

export function renderContactSheetSvg(
  items: PlateConfig[],
  customAssets: MicroSvgAsset[] = [],
  cols = 4
): string {
  const count = items.length;
  const rows = Math.max(1, Math.ceil(count / cols));
  const cellW = 420;
  const cellH = 460;
  const gap = 28;
  const outerPad = 48;
  const headerH = 88;
  const totalW = outerPad * 2 + cols * cellW + (cols - 1) * gap;
  const totalH = outerPad * 2 + headerH + rows * cellH + (rows - 1) * gap;

  const chunks: string[] = [];
  chunks.push(`<rect width="${totalW}" height="${totalH}" fill="#0b0b0b"/>`);
  chunks.push(
    `<text x="${outerPad}" y="${outerPad + 28}" fill="#eae6dc" font-family="'JetBrains Mono', monospace" font-size="22" font-weight="600" letter-spacing="3">KATA — CONTACT SHEET // ${count} PLATES</text>`
  );
  chunks.push(
    `<text x="${totalW - outerPad}" y="${outerPad + 28}" text-anchor="end" fill="#ff4d00" font-family="'JetBrains Mono', monospace" font-size="14" letter-spacing="2">ARCHIVE EDITION</text>`
  );
  chunks.push(
    `<line x1="${outerPad}" y1="${outerPad + 48}" x2="${totalW - outerPad}" y2="${outerPad + 48}" stroke="#262626" stroke-width="1.5"/>`
  );

  items.forEach((cfg, idx) => {
    const c = idx % cols;
    const r = Math.floor(idx / cols);
    const x = outerPad + c * (cellW + gap);
    const y = outerPad + headerH + r * (cellH + gap);
    const meta = getPlateMetadata(cfg);
    const plateSvg = renderPlateSvgString(cfg, customAssets, { width: 900, height: 900 })
      .replace(/^<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '');
    const scale = cellW / 900;

    chunks.push(`<g transform="translate(${x} ${y})">`);
    chunks.push(`<rect width="${cellW}" height="${cellW}" fill="none" stroke="#242424" stroke-width="1"/>`);
    chunks.push(`<g transform="scale(${scale.toFixed(4)})">${plateSvg}</g>`);
    chunks.push(
      `<text x="0" y="${cellW + 24}" fill="#eae6dc" font-family="'JetBrains Mono', monospace" font-size="13" letter-spacing="1.5">${escapeXml(meta.shortTitle)}</text>`
    );
    chunks.push(
      `<text x="${cellW}" y="${cellW + 24}" text-anchor="end" fill="#88837a" font-family="'JetBrains Mono', monospace" font-size="12" letter-spacing="1.2">SEED ${cfg.seed}</text>`
    );
    chunks.push(`</g>`);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}">\n${chunks.join('\n')}\n</svg>`;
}

export function encodeStateToHash(config: PlateConfig): string {
  const params = new URLSearchParams();
  params.set('s', String(config.seed));
  params.set('lp', String(config.paletteIndex));
  params.set('ll', String(config.layoutIndex));
  params.set('li', String(config.instrumentIndex));
  params.set('ln', String(config.nameIndex));
  params.set('d', String(config.complexity));
  params.set('wf', config.finish.wordmarkFont);
  params.set('rp', config.finish.risoPrint ? '1' : '0');
  params.set('jp', config.finish.japaneseText ? '1' : '0');
  params.set('as', config.aspect);
  if (config.typography.customWordmark) {
    params.set('cw', config.typography.customWordmark);
  }
  const locksStr = [
    config.locks.palette ? '1' : '0',
    config.locks.layout ? '1' : '0',
    config.locks.instrument ? '1' : '0',
    config.locks.name ? '1' : '0',
  ].join('');
  if (locksStr !== '0000') {
    params.set('lk', locksStr);
  }
  return `#${params.toString()}`;
}

export function decodeHashToState(hash: string): PlateConfig {
  const base = createDefaultConfig(353316362);
  if (!hash || hash.length < 2) return base;
  const clean = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);

  const seedParam = Number(params.get('s'));
  if (Number.isFinite(seedParam) && seedParam > 0) {
    base.seed = Math.floor(seedParam);
  }

  const lp = params.get('lp');
  const ll = params.get('ll');
  const li = params.get('li');
  const ln = params.get('ln');
  const d = params.get('d');

  if (lp !== null && Number.isFinite(Number(lp))) base.paletteIndex = Number(lp);
  if (ll !== null && Number.isFinite(Number(ll))) base.layoutIndex = Number(ll);
  if (li !== null && Number.isFinite(Number(li))) base.instrumentIndex = Number(li);
  if (ln !== null && Number.isFinite(Number(ln))) base.nameIndex = Number(ln);
  if (d !== null && Number.isFinite(Number(d))) {
    base.complexity = Math.max(1, Math.min(12, Number(d)));
  }

  const wf = params.get('wf');
  if (wf === 'MONO' || wf === 'CONDENSED' || wf === 'GROTESK') {
    base.finish.wordmarkFont = wf;
  }
  if (params.get('rp') === '1') base.finish.risoPrint = true;
  if (params.get('jp') === '1') base.finish.japaneseText = true;
  const as = params.get('as');
  if (as === 'SQUARE' || as === 'POSTER' || as === 'WIDE' || as === 'AVATAR') {
    base.aspect = as;
  }
  const cw = params.get('cw');
  if (cw) base.typography.customWordmark = cw;

  const lk = params.get('lk');
  if (lk && lk.length === 4) {
    base.locks = {
      palette: lk[0] === '1',
      layout: lk[1] === '1',
      instrument: lk[2] === '1',
      name: lk[3] === '1',
    };
  }

  return base;
}

export function sanitizeSvgInnerContent(rawSvg: string): { viewBox: string; innerSvg: string } | null {
  const trimmed = rawSvg.trim();
  if (!trimmed) return null;

  // Strip script tags, event handlers, foreignObject, and javascript: URIs
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
    return {
      viewBox,
      innerSvg: svgMatch[2].trim(),
    };
  }

  // Allow bare SVG primitives (<path .../>, <circle .../>) wrapped in normalized 100x100
  if (/<(path|circle|rect|line|polygon|polyline|ellipse|g)\b/i.test(cleaned)) {
    return {
      viewBox: '0 0 100 100',
      innerSvg: cleaned,
    };
  }

  return null;
}

export function createDefaultStamp(asset: MicroSvgAsset): PlacedSvgStamp {
  return {
    id: `stamp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    assetId: asset.id,
    name: asset.name,
    x: 500,
    y: 440,
    scale: asset.defaultScale ?? 1.2,
    rotation: 0,
    opacity: 0.92,
    strokeWidth: 1.5,
    colorMode: 'accent',
    customColor: '#ff4d00',
    flipX: false,
    flipY: false,
  };
}
