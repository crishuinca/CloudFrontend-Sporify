export const PURPLE_BACKDROP =
  'radial-gradient(1200px 420px at 10% -10%, rgba(155, 125, 255, 0.55), transparent 58%), linear-gradient(180deg, #5b3aa8 0%, #2a1654 32%, #0d0d0d 68%, #000 100%)';

export function gradientFromRgb(r: number, g: number, b: number): string {
  const r1 = Math.round(r);
  const g1 = Math.round(g);
  const b1 = Math.round(b);
  const r2 = Math.round(r1 * 0.4);
  const g2 = Math.round(g1 * 0.4);
  const b2 = Math.round(b1 * 0.4);
  return `radial-gradient(1200px 420px at 12% -8%, rgba(${r1}, ${g1}, ${b1}, 0.72), transparent 56%), linear-gradient(180deg, rgb(${r1}, ${g1}, ${b1}) 0%, rgb(${r2}, ${g2}, ${b2}) 34%, #0d0d0d 70%, #000 100%)`;
}

export function extractAverageColor(src: string): Promise<{ r: number; g: number; b: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      image.crossOrigin = 'anonymous';
    }
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        let r = 0;
        let g = 0;
        let b = 0;
        let weight = 0;
        for (let i = 0; i < data.length; i += 4) {
          const pr = data[i];
          const pg = data[i + 1];
          const pb = data[i + 2];
          const pa = data[i + 3];
          if (pa < 40) {
            continue;
          }
          const lum = (pr + pg + pb) / 3;
          if (lum < 16 || lum > 248) {
            continue;
          }
          const max = Math.max(pr, pg, pb);
          const min = Math.min(pr, pg, pb);
          const sat = max === 0 ? 0 : (max - min) / max;
          const w = 0.55 + sat;
          r += pr * w;
          g += pg * w;
          b += pb * w;
          weight += w;
        }
        if (!weight) {
          resolve(null);
          return;
        }
        resolve(boostColor(r / weight, g / weight, b / weight));
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function boostColor(r: number, g: number, b: number): { r: number; g: number; b: number } {
  const max = Math.max(r, g, b);
  if (max < 90) {
    const k = 90 / (max || 1);
    r *= k;
    g *= k;
    b *= k;
  }
  const avg = (r + g + b) / 3;
  const sat = 1.4;
  return {
    r: clamp(avg + (r - avg) * sat),
    g: clamp(avg + (g - avg) * sat),
    b: clamp(avg + (b - avg) * sat),
  };
}

function clamp(value: number): number {
  return Math.min(255, Math.max(0, value));
}
