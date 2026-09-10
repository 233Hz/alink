/**
 * Programmatic Identicon Matrix Generator for ALink
 * Generates 5x5 symmetric pictorial pixel matrix icons with vibrant dynamic colors,
 * 100% offline, zero external dependencies, no third-party services.
 */

/**
 * Generates 16 pseudo-random deterministic bytes from an input string using multi-hash rounds.
 */
export function hashStringToBytes(str: string): number[] {
  let h1 = 0x811c9dc5;
  let h2 = 0x27d4eb2f;
  let h3 = 0x5bfb4d37;
  let h4 = 0x3c6ef372;

  const clean = (str || 'alink').trim().toLowerCase();

  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ (c << 3), 0x5bd1e995);
    h3 = Math.imul(h3 ^ (c << 7), 0x27d4eb2d);
    h4 = Math.imul(h4 ^ (c >> 2), 0x165667b1);
  }

  const bytes: number[] = [];
  for (const h of [h1, h2, h3, h4]) {
    bytes.push((h >>> 24) & 0xff);
    bytes.push((h >>> 16) & 0xff);
    bytes.push((h >>> 8) & 0xff);
    bytes.push(h & 0xff);
  }
  return bytes;
}

export function hashString(str: string): number {
  const bytes = hashStringToBytes(str);
  return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
}

/**
 * Generates a 5x5 symmetric pictorial matrix Identicon SVG string.
 * - 5x5 grid with horizontal bilateral symmetry across the vertical center axis.
 * - 7x7 viewBox providing a 1-unit quiet border.
 * - Sharp pixel rendering via shape-rendering="crispEdges".
 * - High-contrast vibrant color derived from seed hash.
 */
export function generateIdenticonSvg(seed: string): string {
  const bytes = hashStringToBytes(seed || 'alink');

  // Vibrant, high-contrast HSL color (saturation 80~95%, lightness 46~54%)
  const hue = Math.floor((bytes[15] / 255) * 360);
  const saturation = 80 + (bytes[14] % 16);
  const lightness = 46 + (bytes[13] % 9);
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const cells: string[] = [];
  let filledCount = 0;

  // 5 rows (r: 0..4), 3 columns (c: 0..2)
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      const byteIdx = r * 3 + c;
      const isFilled = (bytes[byteIdx] & 1) === 1;

      if (isFilled) {
        filledCount++;
        const y = r + 1; // 1-unit top margin

        // Left / Center cell
        const x1 = c + 1;
        cells.push(`<rect x="${x1}" y="${y}" width="1" height="1" fill="${color}"/>`);

        // Symmetrically mirror column to the right side (c=0 -> 5, c=1 -> 4)
        if (c < 2) {
          const x2 = 5 - c;
          cells.push(`<rect x="${x2}" y="${y}" width="1" height="1" fill="${color}"/>`);
        }
      }
    }
  }

  // Safety fallback: ensure at least 4 cells are filled to prevent empty/sparse icons
  if (filledCount < 3) {
    cells.push(
      `<rect x="3" y="1" width="1" height="1" fill="${color}"/>`,
      `<rect x="2" y="2" width="1" height="1" fill="${color}"/>`,
      `<rect x="3" y="2" width="1" height="1" fill="${color}"/>`,
      `<rect x="4" y="2" width="1" height="1" fill="${color}"/>`,
      `<rect x="3" y="3" width="1" height="1" fill="${color}"/>`,
      `<rect x="2" y="4" width="1" height="1" fill="${color}"/>`,
      `<rect x="4" y="4" width="1" height="1" fill="${color}"/>`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7 7" width="100%" height="100%" shape-rendering="crispEdges"><rect width="7" height="7" fill="#ffffff"/>${cells.join('')}</svg>`;
}

/**
 * Alias for generateIdenticonSvg to maintain backwards compatibility.
 */
export function getGeneratedIconSvg(seed: string): string {
  return generateIdenticonSvg(seed);
}

/**
 * Returns an SVG Data URL suitable for img :src or custom icon URL.
 */
export function getGeneratedIconDataUrl(seed?: string): string {
  const actualSeed = seed && seed.trim()
    ? seed.trim()
    : `alink-${Math.random().toString(36).substring(2, 9)}`;
  const svg = generateIdenticonSvg(actualSeed);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates a completely randomized Identicon SVG Data URL.
 */
export function getRandomGeneratedIconDataUrl(): string {
  const randSeed = `rand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return getGeneratedIconDataUrl(randSeed);
}
