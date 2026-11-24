import type { MicroSvgAsset } from './types';

export const BUILTIN_SVG_ASSETS: MicroSvgAsset[] = [
  // RETICLES
  {
    id: 'reticle-crosshair',
    name: 'Precision Crosshair',
    jpName: '精密照準',
    category: 'RETICLES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
      <line x1="50" y1="6" x2="50" y2="30" stroke="currentColor" stroke-width="1.5"/>
      <line x1="50" y1="70" x2="50" y2="94" stroke="currentColor" stroke-width="1.5"/>
      <line x1="6" y1="50" x2="30" y2="50" stroke="currentColor" stroke-width="1.5"/>
      <line x1="70" y1="50" x2="94" y2="50" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="2.5" fill="currentColor"/>
    `,
  },
  {
    id: 'reticle-target-ring',
    name: 'Concentric Target',
    jpName: '同心円標的',
    category: 'RETICLES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="1.1" stroke-dasharray="4 4"/>
      <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="4" fill="currentColor"/>
      <line x1="50" y1="2" x2="50" y2="18" stroke="currentColor" stroke-width="1.4"/>
      <line x1="50" y1="82" x2="50" y2="98" stroke="currentColor" stroke-width="1.4"/>
      <line x1="2" y1="50" x2="18" y2="50" stroke="currentColor" stroke-width="1.4"/>
      <line x1="82" y1="50" x2="98" y2="50" stroke="currentColor" stroke-width="1.4"/>
    `,
  },
  {
    id: 'reticle-bracket-lock',
    name: 'Corner Lock Frame',
    jpName: '四隅枠',
    category: 'RETICLES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <path d="M12 30 L12 12 L30 12" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M70 12 L88 12 L88 30" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M88 70 L88 88 L70 88" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M30 88 L12 88 L12 70" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="42" y1="50" x2="58" y2="50" stroke="currentColor" stroke-width="1.5"/>
      <line x1="50" y1="42" x2="50" y2="58" stroke="currentColor" stroke-width="1.5"/>
    `,
  },
  {
    id: 'reticle-polar-compass',
    name: 'Polar Azimuth',
    jpName: '方位羅針',
    category: 'RETICLES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="1"/>
      <polygon points="50,12 55,46 50,50 45,46" fill="currentColor"/>
      <polygon points="50,88 55,54 50,50 45,54" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <line x1="12" y1="50" x2="22" y2="50" stroke="currentColor" stroke-width="1.5"/>
      <line x1="78" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="1.5"/>
    `,
  },
  {
    id: 'reticle-radial-ticks',
    name: 'Radial Starburst',
    jpName: '放射目盛',
    category: 'RETICLES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="3.5" fill="currentColor"/>
      <g stroke="currentColor" stroke-width="1.4">
        <line x1="50" y1="8" x2="50" y2="28"/>
        <line x1="50" y1="72" x2="50" y2="92"/>
        <line x1="8" y1="50" x2="28" y2="50"/>
        <line x1="72" y1="50" x2="92" y2="50"/>
        <line x1="20" y1="20" x2="34" y2="34"/>
        <line x1="66" y1="66" x2="80" y2="80"/>
        <line x1="80" y1="20" x2="66" y2="34"/>
        <line x1="34" y1="66" x2="20" y2="80"/>
        <line x1="34" y1="11" x2="41" y2="29"/>
        <line x1="59" y1="71" x2="66" y2="89"/>
        <line x1="66" y1="11" x2="59" y2="29"/>
        <line x1="41" y1="71" x2="34" y2="89"/>
        <line x1="11" y1="34" x2="29" y2="41"/>
        <line x1="71" y1="59" x2="89" y2="66"/>
        <line x1="11" y1="66" x2="29" y2="59"/>
        <line x1="71" y1="41" x2="89" y2="34"/>
      </g>
    `,
  },

  // GEOMETRY
  {
    id: 'geo-iso-cube',
    name: 'Isometric Cube',
    jpName: '等角立方体',
    category: 'GEOMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <polygon points="50,12 84,31 84,69 50,88 16,69 16,31" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <polyline points="16,31 50,50 84,31" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <line x1="50" y1="50" x2="50" y2="88" stroke="currentColor" stroke-width="1.6"/>
      <polyline points="16,69 50,50 84,69" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="50" y1="12" x2="50" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
    `,
  },
  {
    id: 'geo-hex-prism',
    name: 'Nested Hexagon',
    jpName: '六角多重',
    category: 'GEOMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <polygon points="50,24 73,37 73,63 50,76 27,63 27,37" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <polygon points="50,38 61,44 61,56 50,62 39,56 39,44" fill="currentColor"/>
    `,
  },
  {
    id: 'geo-nodal-triangle',
    name: 'Triangulated Mesh',
    jpName: '三角網',
    category: 'GEOMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <polygon points="50,14 86,78 14,78" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <polygon points="50,78 68,46 32,46" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="50" cy="14" r="3" fill="currentColor"/>
      <circle cx="86" cy="78" r="3" fill="currentColor"/>
      <circle cx="14" cy="78" r="3" fill="currentColor"/>
      <circle cx="50" cy="56" r="2.5" fill="currentColor"/>
    `,
  },
  {
    id: 'geo-fibonacci-arc',
    name: 'Golden Ratio Spiral',
    jpName: '黄金螺旋',
    category: 'GEOMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <rect x="14" y="24" width="72" height="45" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <line x1="59" y1="24" x2="59" y2="69" stroke="currentColor" stroke-width="1.1"/>
      <line x1="59" y1="51" x2="86" y2="51" stroke="currentColor" stroke-width="1.1"/>
      <path d="M14 69 A45 45 0 0 1 59 24 A27 27 0 0 1 86 51 A18 18 0 0 1 68 69 A9 9 0 0 1 59 60" fill="none" stroke="currentColor" stroke-width="1.8"/>
    `,
  },
  {
    id: 'geo-diagonal-hatch',
    name: 'Architectural Hatch',
    jpName: '斜線断面',
    category: 'GEOMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <rect x="16" y="16" width="68" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <line x1="16" y1="36" x2="36" y2="16" stroke="currentColor" stroke-width="1.3"/>
      <line x1="16" y1="56" x2="56" y2="16" stroke="currentColor" stroke-width="1.3"/>
      <line x1="16" y1="76" x2="76" y2="16" stroke="currentColor" stroke-width="1.3"/>
      <line x1="28" y1="84" x2="84" y2="28" stroke="currentColor" stroke-width="1.3"/>
      <line x1="48" y1="84" x2="84" y2="48" stroke="currentColor" stroke-width="1.3"/>
      <line x1="68" y1="84" x2="84" y2="68" stroke="currentColor" stroke-width="1.3"/>
    `,
  },
  {
    id: 'geo-checkered-glyph',
    name: 'Bauhaus Grid Block',
    jpName: '構成格子',
    category: 'GEOMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <rect x="18" y="18" width="20" height="20" fill="currentColor"/>
      <rect x="58" y="18" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="38" y="38" width="20" height="20" fill="currentColor"/>
      <rect x="18" y="58" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="58" y="58" width="20" height="20" fill="currentColor"/>
      <circle cx="68" cy="28" r="4" fill="currentColor"/>
      <circle cx="28" cy="68" r="4" fill="currentColor"/>
    `,
  },

  // TELEMETRY
  {
    id: 'tel-dot-matrix',
    name: 'Dot Matrix 5x4',
    jpName: '点配列',
    category: 'TELEMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <g fill="currentColor">
        <circle cx="22" cy="26" r="2.8"/><circle cx="36" cy="26" r="2.8"/><circle cx="50" cy="26" r="2.8"/><circle cx="64" cy="26" r="2.8"/><circle cx="78" cy="26" r="2.8"/>
        <circle cx="22" cy="42" r="2.8"/><circle cx="36" cy="42" r="2.8"/><circle cx="50" cy="42" r="1.2"/><circle cx="64" cy="42" r="2.8"/><circle cx="78" cy="42" r="2.8"/>
        <circle cx="22" cy="58" r="2.8"/><circle cx="36" cy="58" r="1.2"/><circle cx="50" cy="58" r="2.8"/><circle cx="64" cy="58" r="2.8"/><circle cx="78" cy="58" r="1.2"/>
        <circle cx="22" cy="74" r="2.8"/><circle cx="36" cy="74" r="2.8"/><circle cx="50" cy="74" r="2.8"/><circle cx="64" cy="74" r="1.2"/><circle cx="78" cy="74" r="2.8"/>
      </g>
    `,
  },
  {
    id: 'tel-vernier-scale',
    name: 'Vernier Caliper Scale',
    jpName: '副尺目盛',
    category: 'TELEMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" stroke-width="1.6"/>
      <g stroke="currentColor" stroke-width="1.4">
        <line x1="14" y1="32" x2="14" y2="50"/><line x1="22" y1="40" x2="22" y2="50"/><line x1="30" y1="36" x2="30" y2="50"/>
        <line x1="38" y1="40" x2="38" y2="50"/><line x1="46" y1="32" x2="46" y2="50"/><line x1="54" y1="40" x2="54" y2="50"/>
        <line x1="62" y1="36" x2="62" y2="50"/><line x1="70" y1="40" x2="70" y2="50"/><line x1="78" y1="32" x2="78" y2="50"/>
        <line x1="86" y1="40" x2="86" y2="50"/>
        <line x1="20" y1="50" x2="20" y2="66"/><line x1="29" y1="50" x2="29" y2="61"/><line x1="38" y1="50" x2="38" y2="66"/>
        <line x1="47" y1="50" x2="47" y2="61"/><line x1="56" y1="50" x2="56" y2="66"/><line x1="65" y1="50" x2="65" y2="61"/>
        <line x1="74" y1="50" x2="74" y2="66"/>
      </g>
      <polygon points="46,24 50,30 42,30" fill="currentColor"/>
    `,
  },
  {
    id: 'tel-barcode-block',
    name: 'Specimen Barcode',
    jpName: '識別符号',
    category: 'TELEMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <g fill="currentColor">
        <rect x="14" y="28" width="4" height="44"/>
        <rect x="21" y="28" width="2" height="44"/>
        <rect x="27" y="28" width="6" height="44"/>
        <rect x="37" y="28" width="2" height="36"/>
        <rect x="42" y="28" width="5" height="44"/>
        <rect x="51" y="28" width="2" height="44"/>
        <rect x="56" y="28" width="8" height="36"/>
        <rect x="67" y="28" width="3" height="44"/>
        <rect x="74" y="28" width="2" height="44"/>
        <rect x="79" y="28" width="6" height="44"/>
      </g>
    `,
  },
  {
    id: 'tel-attitude-horizon',
    name: 'Attitude Horizon',
    jpName: '水平儀',
    category: 'TELEMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <line x1="16" y1="50" x2="38" y2="50" stroke="currentColor" stroke-width="1.8"/>
      <line x1="62" y1="50" x2="84" y2="50" stroke="currentColor" stroke-width="1.8"/>
      <path d="M38 50 L44 56 L50 50 L56 56 L62 50" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <line x1="34" y1="34" x2="66" y2="34" stroke="currentColor" stroke-width="1.2"/>
      <line x1="40" y1="24" x2="60" y2="24" stroke="currentColor" stroke-width="1.1"/>
      <line x1="36" y1="68" x2="64" y2="68" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 3"/>
    `,
  },
  {
    id: 'tel-freq-bars',
    name: 'Spectrum Analyzer',
    jpName: '周波数帯',
    category: 'TELEMETRY',
    viewBox: '0 0 100 100',
    innerSvg: `
      <line x1="12" y1="78" x2="88" y2="78" stroke="currentColor" stroke-width="1.5"/>
      <g fill="currentColor">
        <rect x="16" y="54" width="6" height="20"/>
        <rect x="26" y="38" width="6" height="36"/>
        <rect x="36" y="22" width="6" height="52"/>
        <rect x="46" y="44" width="6" height="30"/>
        <rect x="56" y="30" width="6" height="44"/>
        <rect x="66" y="50" width="6" height="24"/>
        <rect x="76" y="60" width="6" height="14"/>
      </g>
    `,
  },

  // WAVES
  {
    id: 'wave-sine-harmonic',
    name: 'Harmonic Sine',
    jpName: '正弦波',
    category: 'WAVES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <line x1="8" y1="50" x2="92" y2="50" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/>
      <path d="M8 50 C18 16, 30 16, 40 50 C50 84, 62 84, 72 50 C80 24, 86 24, 92 50" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M8 50 C20 32, 32 32, 44 50 C56 68, 68 68, 80 50" fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.7"/>
      <circle cx="40" cy="50" r="3" fill="currentColor"/>
      <circle cx="72" cy="50" r="3" fill="currentColor"/>
    `,
  },
  {
    id: 'wave-pulse-train',
    name: 'Digital Pulse Train',
    jpName: '矩形波列',
    category: 'WAVES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <polyline points="8,66 20,66 20,30 34,30 34,66 44,66 44,30 52,30 52,66 68,66 68,30 82,30 82,66 92,66" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <line x1="8" y1="76" x2="92" y2="76" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/>
    `,
  },
  {
    id: 'wave-topo-contour',
    name: 'Topographic Contour',
    jpName: '等高線',
    category: 'WAVES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <path d="M18,52 C16,28 36,16 58,20 C78,24 86,44 82,62 C78,80 56,86 38,80 C24,75 19,65 18,52 Z" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <path d="M28,52 C27,36 42,27 57,30 C71,33 75,46 72,58 C69,70 53,75 41,70 C32,66 29,59 28,52 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <path d="M40,51 C40,42 48,38 56,40 C63,42 65,49 62,56 C59,62 50,64 44,60 C41,58 40,55 40,51 Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
      <circle cx="52" cy="50" r="2.5" fill="currentColor"/>
    `,
  },
  {
    id: 'wave-lissajous',
    name: 'Lissajous Phase',
    jpName: 'リサージュ図形',
    category: 'WAVES',
    viewBox: '0 0 100 100',
    innerSvg: `
      <path d="M50,16 C78,16 86,34 68,50 C50,66 22,84 50,84 C78,84 50,66 32,50 C14,34 22,16 50,16 Z" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="50" cy="50" r="3" fill="currentColor"/>
    `,
  },

  // OPTICS
  {
    id: 'opt-orbital-rings',
    name: 'Orbital Ellipses',
    jpName: '衛星軌道',
    category: 'OPTICS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(-30 50 50)" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(30 50 50)" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="6" fill="currentColor"/>
      <circle cx="77" cy="34" r="3" fill="currentColor"/>
    `,
  },
  {
    id: 'opt-lunar-phases',
    name: 'Phase Array',
    jpName: '月相配列',
    category: 'OPTICS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="20" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <path d="M50,41 A9,9 0 0,1 50,59 Z" fill="currentColor"/>
      <circle cx="50" cy="50" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="80" cy="50" r="9" fill="currentColor"/>
      <line x1="10" y1="68" x2="90" y2="68" stroke="currentColor" stroke-width="1.1"/>
    `,
  },
  {
    id: 'opt-aperture',
    name: 'Iris Aperture',
    jpName: '絞り機構',
    category: 'OPTICS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <polygon points="50,30 67,40 67,60 50,70 33,60 33,40" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <line x1="50" y1="30" x2="72" y2="19" stroke="currentColor" stroke-width="1.3"/>
      <line x1="67" y1="40" x2="87" y2="48" stroke="currentColor" stroke-width="1.3"/>
      <line x1="67" y1="60" x2="74" y2="79" stroke="currentColor" stroke-width="1.3"/>
      <line x1="50" y1="70" x2="28" y2="81" stroke="currentColor" stroke-width="1.3"/>
      <line x1="33" y1="60" x2="13" y2="52" stroke="currentColor" stroke-width="1.3"/>
      <line x1="33" y1="40" x2="26" y2="21" stroke="currentColor" stroke-width="1.3"/>
    `,
  },
  {
    id: 'opt-radar-sweep',
    name: 'Radar Sector',
    jpName: '走査扇形',
    category: 'OPTICS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="M50,50 L50,12 A38,38 0 0,1 85,65 Z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="1.4"/>
      <circle cx="66" cy="36" r="3" fill="currentColor"/>
      <circle cx="50" cy="50" r="2.5" fill="currentColor"/>
    `,
  },
  {
    id: 'opt-prism-ray',
    name: 'Prism Dispersion',
    jpName: '分光プリズム',
    category: 'OPTICS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <polygon points="50,20 78,74 22,74" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <line x1="6" y1="54" x2="36" y2="47" stroke="currentColor" stroke-width="1.8"/>
      <line x1="61" y1="42" x2="94" y2="34" stroke="currentColor" stroke-width="1.4"/>
      <line x1="64" y1="48" x2="94" y2="48" stroke="currentColor" stroke-width="1.4"/>
      <line x1="67" y1="54" x2="94" y2="62" stroke="currentColor" stroke-width="1.4"/>
    `,
  },

  // MARKS
  {
    id: 'mark-hanko-seal',
    name: 'Hanko Stamp Seal',
    jpName: '検印枠',
    category: 'MARKS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <rect x="20" y="20" width="60" height="60" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/>
      <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" stroke-width="1.8"/>
      <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="35" cy="35" r="4" fill="currentColor"/>
      <rect x="60" y="60" width="9" height="9" fill="currentColor"/>
    `,
  },
  {
    id: 'mark-signal-arrow',
    name: 'Technical Vector Arrow',
    jpName: '指向矢印',
    category: 'MARKS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <line x1="12" y1="88" x2="84" y2="16" stroke="currentColor" stroke-width="2"/>
      <polyline points="56,16 84,16 84,44" fill="none" stroke="currentColor" stroke-width="2"/>
      <circle cx="12" cy="88" r="4" fill="currentColor"/>
    `,
  },
  {
    id: 'mark-circuit-node',
    name: 'Circuit Trace',
    jpName: '回路配線',
    category: 'MARKS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <polyline points="14,72 38,72 52,50 84,50" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <polyline points="14,30 42,30 56,50" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="14" cy="72" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="14" cy="30" r="4" fill="currentColor"/>
      <circle cx="84" cy="50" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="84" cy="50" r="1.8" fill="currentColor"/>
    `,
  },
  {
    id: 'mark-pendulum-arc',
    name: 'Pendulum Arc',
    jpName: '振子軌跡',
    category: 'MARKS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <path d="M18,52 A38,38 0 0,0 82,52" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="4 3"/>
      <line x1="50" y1="16" x2="28" y2="74" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="50" cy="16" r="3" fill="currentColor"/>
      <circle cx="28" cy="74" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <circle cx="28" cy="74" r="2" fill="currentColor"/>
    `,
  },
  {
    id: 'mark-registration-target',
    name: 'Print Registration Mark',
    jpName: 'トンボ標',
    category: 'MARKS',
    viewBox: '0 0 100 100',
    innerSvg: `
      <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <line x1="12" y1="50" x2="88" y2="50" stroke="currentColor" stroke-width="1.5"/>
      <line x1="50" y1="12" x2="50" y2="88" stroke="currentColor" stroke-width="1.5"/>
      <path d="M50,26 A24,24 0 0,1 74,50 L50,50 Z" fill="currentColor"/>
      <path d="M50,74 A24,24 0 0,1 26,50 L50,50 Z" fill="currentColor"/>
    `,
  },
];
