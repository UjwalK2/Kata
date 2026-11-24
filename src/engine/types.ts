export type WordmarkFont = 'MONO' | 'CONDENSED' | 'GROTESK';
export type AspectRatioMode = 'SQUARE' | 'POSTER' | 'WIDE' | 'AVATAR';
export type BorderStyle = 'SINGLE' | 'DOUBLE' | 'DASHED' | 'NONE';
export type CornerMarkStyle = 'CROSSHAIR' | 'BRACKET' | 'DOT' | 'CIRCLE' | 'NONE';
export type GridOverlayStyle = 'NONE' | 'DOTS' | 'CROSSES' | 'LINES' | 'SUBDIVIDED';

export interface PaletteDef {
  id: string;
  name: string;
  bg: string;
  ink: string;
  accent: string;
  isCustom?: boolean;
}

export interface TraitLocks {
  palette: boolean;
  layout: boolean;
  instrument: boolean;
  name: boolean;
}

export interface FinishConfig {
  wordmarkFont: WordmarkFont;
  risoPrint: boolean;
  risoOffset: number;
  risoGrain: number;
  japaneseText: boolean;
}

export interface FrameConfig {
  borderStyle: BorderStyle;
  borderWidth: number;
  cornerMarks: CornerMarkStyle;
  gridOverlay: GridOverlayStyle;
  padding: number;
  showHeader: boolean;
  showFooter: boolean;
  showSwatch: boolean;
  showCorners: boolean;
}

export interface TypographyConfig {
  customWordmark: string;
  customSeries: string;
  customFigure: string;
  customSubtitle: string;
  customEdition: string;
  customPlateNumber: string;
  customMatrixLabel: string;
  customEyeLabel: string;
  customCoords: string;
  customRefTarget: string;
  customJpName: string;
  wordmarkSize: number;
  letterSpacing: number;
}

export interface ElementTransform {
  dx: number;
  dy: number;
  scale: number;
  rotation: number;
}

export type EditableTextField =
  | 'customPlateNumber'
  | 'customSeries'
  | 'customFigure'
  | 'customMatrixLabel'
  | 'customEyeLabel'
  | 'customCoords'
  | 'customRefTarget'
  | 'customWordmark'
  | 'customSubtitle'
  | 'customEdition'
  | 'customJpName';

export interface PlateElementBox {
  id: string;
  kind: 'instrument' | 'node' | 'stamp' | 'text';
  label: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  textValue?: string;
  textField?: EditableTextField;
  stampId?: string;
}

export interface InstrumentStyleConfig {
  strokeWidth: number;
  scale: number;
  rotation: number;
  offsetX: number;
  offsetY: number;
  secondaryInstrumentIndex: number | null;
  showTelemetryNodes: boolean;
  showConnectingVectors: boolean;
}

export type StampColorMode = 'ink' | 'accent' | 'custom';

export interface PlacedSvgStamp {
  id: string;
  assetId: string;
  name: string;
  x: number; // 0-1000 canvas coordinate
  y: number; // 0-1000 canvas coordinate
  scale: number; // 0.2 to 4.0
  rotation: number; // -180 to 180
  opacity: number; // 0.1 to 1.0
  strokeWidth: number; // 0.5 to 4.0
  colorMode: StampColorMode;
  customColor: string;
  flipX: boolean;
  flipY: boolean;
}

export interface PlateConfig {
  seed: number;
  paletteIndex: number;
  customPalette: PaletteDef | null;
  layoutIndex: number;
  instrumentIndex: number;
  nameIndex: number;
  locks: TraitLocks;
  complexity: number; // 1 to 12
  finish: FinishConfig;
  frame: FrameConfig;
  typography: TypographyConfig;
  instrumentStyle: InstrumentStyleConfig;
  elementTransforms?: Record<string, ElementTransform>;
  stamps: PlacedSvgStamp[];
  aspect: AspectRatioMode;
}

export type SvgAssetCategory =
  | 'RETICLES'
  | 'GEOMETRY'
  | 'TELEMETRY'
  | 'WAVES'
  | 'OPTICS'
  | 'MARKS'
  | 'CUSTOM';

export interface MicroSvgAsset {
  id: string;
  name: string;
  jpName: string;
  category: SvgAssetCategory;
  viewBox: string;
  innerSvg: string; // Primitives using currentColor / stroke="currentColor"
  defaultScale?: number;
  isCustom?: boolean;
}

export interface CollectionItem {
  id: string;
  editionNumber: number;
  title: string;
  seed: number;
  createdAt: string;
  config: PlateConfig;
  previewSvg?: string;
}

export interface RecentRoll {
  id: string;
  title: string;
  seed: number;
  rolledAt: string;
  config: PlateConfig;
}
