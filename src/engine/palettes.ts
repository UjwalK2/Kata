import type { PaletteDef } from './types';

export const BUILTIN_PALETTES: PaletteDef[] = [
  { id: 'black-blu', name: 'BLACK/BLU', bg: '#101010', ink: '#efebe0', accent: '#1e4bff' },
  { id: 'obsidian-vermilion', name: 'OBSIDIAN/RED', bg: '#101010', ink: '#efebe0', accent: '#ff4d00' },
  { id: 'paper-sumi', name: 'PAPER/SUMI', bg: '#f2eee4', ink: '#141414', accent: '#d9381e' },
  { id: 'riso-cobalt', name: 'RISO/COBALT', bg: '#f5f2eb', ink: '#19223c', accent: '#0057ff' },
  { id: 'ochre-ink', name: 'OCHRE/INK', bg: '#e6dcc5', ink: '#1d1b18', accent: '#c84b18' },
  { id: 'signal-slate', name: 'SIGNAL/SLATE', bg: '#161a1d', ink: '#e5e9ec', accent: '#00c48c' },
  { id: 'forest-cream', name: 'FOREST/CREAM', bg: '#12221b', ink: '#ede8d8', accent: '#ff7a33' },
  { id: 'klein-chalk', name: 'KLEIN/CHALK', bg: '#0c237d', ink: '#f4f2ec', accent: '#ffbe0b' },
  { id: 'coral-graphite', name: 'CORAL/GRAPHITE', bg: '#1d1d1f', ink: '#f2efea', accent: '#ff5c5c' },
  { id: 'mint-carbon', name: 'MINT/CARBON', bg: '#111413', ink: '#dff4ea', accent: '#2ee59d' },
  { id: 'sepia-crimson', name: 'SEPIA/CRIMSON', bg: '#ebe3d3', ink: '#29211d', accent: '#b81d24' },
  { id: 'amber-void', name: 'AMBER/VOID', bg: '#09090b', ink: '#ece8df', accent: '#ffb703' },
  { id: 'sand-navy', name: 'SAND/NAVY', bg: '#eae4d7', ink: '#162447', accent: '#e43f5a' },
  { id: 'bone-rust', name: 'BONE/RUST', bg: '#1a1715', ink: '#eae3d5', accent: '#d95d39' },
];

export const LAYOUT_NAMES = [
  'OFFSET',
  'CENTERED',
  'SPLIT',
  'QUADRANT',
  'DIAGONAL',
  'ORBITAL',
  'MODULAR',
  'CASCADE',
] as const;

export const INSTRUMENT_NAMES = [
  'BURST',
  'RETICLE',
  'WAVEFORM',
  'MATRIX',
  'ORBIT',
  'VERNIER',
  'CONTOUR',
  'PRISM',
  'RADAR',
  'SPECTRUM',
  'ISOMETRIC',
  'ASTROLABE',
] as const;

export const PIECE_NAMES = [
  'STRATA',
  'KOJIMA',
  'KINETIC',
  'VECTOR',
  'DATUM',
  'MERIDIAN',
  'AXIAL',
  'PHASE',
  'HELIX',
  'APEX',
  'CALIBRE',
  'MODULUS',
  'CHRONO',
  'ZENITH',
  'SECTOR',
  'MONOLITH',
] as const;

export const PIECE_NAMES_JP: Record<string, string> = {
  STRATA: '地層標本',
  KOJIMA: '小島図版',
  KINETIC: '運動計測',
  VECTOR: '空間座標',
  DATUM: '基準点',
  MERIDIAN: '子午線',
  AXIAL: '軸線構造',
  PHASE: '位相解析',
  HELIX: '螺旋軌道',
  APEX: '頂点方位',
  CALIBRE: '精密口径',
  MODULUS: '係数配列',
  CHRONO: '時系列図',
  ZENITH: '天頂観測',
  SECTOR: '区画走査',
  MONOLITH: '単石構造',
};

export const SERIES_NAMES = ['A', 'B', 'C', 'D', 'E', 'K', 'X'] as const;
