import JSZip from 'jszip';
import {
  getAspectDimensions,
  getPlateMetadata,
  renderContactSheetSvg,
  renderPlateSvgString,
} from '../engine/generator';
import type { MicroSvgAsset, PlateConfig } from '../engine/types';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSvgFile(svgString: string, filename: string): void {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename.endsWith('.svg') ? filename : `${filename}.svg`);
}

export async function downloadPngFile(
  svgString: string,
  width: number,
  height: number,
  scale: number,
  filename: string
): Promise<void> {
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Failed to rasterize SVG to PNG'));
      image.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('PNG encoding failed'));
      }, 'image/png');
    });

    triggerDownload(pngBlob, filename.endsWith('.png') ? filename : `${filename}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  return ok;
}

export async function downloadBatchZipFile(
  items: PlateConfig[],
  customAssets: MicroSvgAsset[]
): Promise<void> {
  const zip = new JSZip();
  const manifest: Array<{ index: number; title: string; seed: number; aspect: string }> = [];

  items.forEach((cfg, index) => {
    const meta = getPlateMetadata(cfg);
    const svg = renderPlateSvgString(cfg, customAssets);
    const slug = `${String(index + 1).padStart(2, '0')}_${meta.shortTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${cfg.seed}.svg`;
    zip.file(slug, svg);
    manifest.push({
      index: index + 1,
      title: meta.shortTitle,
      seed: cfg.seed,
      aspect: cfg.aspect,
    });
  });

  const sheetSvg = renderContactSheetSvg(items, customAssets, items.length <= 6 ? 3 : 4);
  zip.file('contact_sheet.svg', sheetSvg);
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, `kata-batch-${items.length}-plates.zip`);
}

export function downloadCurrentPlateSvg(config: PlateConfig, customAssets: MicroSvgAsset[]): void {
  const meta = getPlateMetadata(config);
  const svg = renderPlateSvgString(config, customAssets);
  downloadSvgFile(svg, `${meta.shortTitle.toLowerCase()}-${config.seed}.svg`);
}

export async function downloadCurrentPlatePng(
  config: PlateConfig,
  customAssets: MicroSvgAsset[],
  scale: number
): Promise<void> {
  const meta = getPlateMetadata(config);
  const { width, height } = getAspectDimensions(config.aspect);
  const svg = renderPlateSvgString(config, customAssets);
  await downloadPngFile(svg, width, height, scale, `${meta.shortTitle.toLowerCase()}-${config.seed}@${scale}x.png`);
}
