import {
  DEFAULT_WATCH_FACE,
  getWatchFace,
  ROMAN_NUMERALS,
  type WatchFaceConfig,
  type WatchFaceId,
} from "../constants/watchFaces";

const CX = 100;
const CY = 100;
const R = 92;

export interface WatchFacePalette {
  fill: string;
  stroke: string;
  innerStroke: string;
  markerMajor: string;
  markerMinor: string;
  numeralFill: string;
  numeralFont: string;
  hourHand: string;
  minuteHand: string;
  hub: string;
  hubInner: string;
  annotateHour: string;
  annotateMinute: string;
}

export function getWatchFacePalette(faceId: WatchFaceId): WatchFacePalette {
  return paletteFor(getWatchFace(faceId));
}

function paletteFor(face: WatchFaceConfig): WatchFacePalette {
  const roman = face.numerals === "roman";
  return {
    fill: roman ? "#faf6ee" : "#fffefb",
    stroke: roman ? "#8b7355" : "#78716c",
    innerStroke: roman ? "#e8dfd0" : "#e7e5e4",
    markerMajor: roman ? "#8b7355" : "#57534e",
    markerMinor: roman ? "#d4c4b0" : "#d6d3d1",
    numeralFill: roman ? "#3d3229" : "#292524",
    numeralFont: roman
      ? "Georgia, 'Times New Roman', serif"
      : "Fredoka, Nunito, system-ui, sans-serif",
    hourHand: roman
      ? face.hands === "thin"
        ? "#8b6914"
        : face.hands === "classic"
          ? "#6b4423"
          : "#3d3229"
      : "#292524",
    minuteHand: roman
      ? face.hands === "thin"
        ? "#c9a227"
        : face.hands === "classic"
          ? "#6b4423"
          : "#3d3229"
      : "#ea580c",
    hub: "#292524",
    hubInner: "#fff",
    annotateHour: roman ? "#8b7355" : "#57534e",
    annotateMinute: "#ea580c",
  };
}

function renderMarkers(face: WatchFaceConfig, pal: WatchFacePalette): string {
  let svg = "";
  const { markers } = face;

  for (let i = 0; i < 60; i++) {
    const ang = ((i * 6 - 90) * Math.PI) / 180;
    const isHour = i % 5 === 0;
    const hourPos = i / 5;

    if (markers === "dots") {
      const dotR = isHour ? 3.2 : 1.4;
      const rr = R - (isHour ? 11 : 7);
      const x = CX + rr * Math.cos(ang);
      const y = CY + rr * Math.sin(ang);
      if (isHour) {
        svg += `<circle cx="${x}" cy="${y}" r="${dotR + 1.8}" fill="none" stroke="${pal.markerMajor}" stroke-width="1.2" opacity="0.35"/>`;
        svg += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="${pal.markerMajor}"/>`;
        svg += `<circle cx="${x - 0.6}" cy="${y - 0.6}" r="${dotR * 0.35}" fill="#fff" opacity="0.45"/>`;
      } else {
        svg += `<circle cx="${x}" cy="${y}" r="${dotR}" fill="${pal.markerMinor}"/>`;
      }
      continue;
    }

    if (markers === "pilot" && isHour && (hourPos === 0 || hourPos === 3 || hourPos === 6 || hourPos === 9)) {
      const tipR = R - 6;
      const baseR = R - 16;
      const spread = (8 * Math.PI) / 180;
      const tx = CX + tipR * Math.cos(ang);
      const ty = CY + tipR * Math.sin(ang);
      const bx1 = CX + baseR * Math.cos(ang - spread);
      const by1 = CY + baseR * Math.sin(ang - spread);
      const bx2 = CX + baseR * Math.cos(ang + spread);
      const by2 = CY + baseR * Math.sin(ang + spread);
      svg += `<polygon points="${tx},${ty} ${bx1},${by1} ${bx2},${by2}" fill="${pal.markerMajor}"/>`;
      continue;
    }

    if (markers === "arrow-dots") {
      if (isHour) {
        const tipR = R - 8;
        const baseR = R - 16;
        const spread = (6 * Math.PI) / 180;
        const tx = CX + tipR * Math.cos(ang);
        const ty = CY + tipR * Math.sin(ang);
        const bx1 = CX + baseR * Math.cos(ang - spread);
        const by1 = CY + baseR * Math.sin(ang - spread);
        const bx2 = CX + baseR * Math.cos(ang + spread);
        const by2 = CY + baseR * Math.sin(ang + spread);
        svg += `<polygon points="${tx},${ty} ${bx1},${by1} ${bx2},${by2}" fill="${pal.markerMajor}"/>`;
      } else {
        const rr = R - 7;
        const x = CX + rr * Math.cos(ang);
        const y = CY + rr * Math.sin(ang);
        svg += `<circle cx="${x}" cy="${y}" r="1" fill="${pal.markerMinor}"/>`;
      }
      continue;
    }

    if (markers === "bars") {
      const r1 = R - 5;
      const r2 = isHour ? R - 15 : R - 9;
      const x1 = CX + r1 * Math.cos(ang);
      const y1 = CY + r1 * Math.sin(ang);
      const x2 = CX + r2 * Math.cos(ang);
      const y2 = CY + r2 * Math.sin(ang);
      const w = isHour ? 2.5 : 1;
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isHour ? pal.markerMajor : pal.markerMinor}" stroke-width="${w}" stroke-linecap="round" opacity="${isHour ? 1 : 0.7}"/>`;
      continue;
    }

    // ticks (default)
    const r1 = R - 4;
    const r2 = isHour ? R - 12 : R - 8;
    const x1 = CX + r1 * Math.cos(ang);
    const y1 = CY + r1 * Math.sin(ang);
    const x2 = CX + r2 * Math.cos(ang);
    const y2 = CY + r2 * Math.sin(ang);
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isHour ? pal.markerMajor : pal.markerMinor}" stroke-width="${isHour ? 2.5 : 1.2}" stroke-linecap="round"/>`;
  }

  return svg;
}

function renderNumerals(face: WatchFaceConfig, pal: WatchFacePalette): string {
  let svg = "";
  const bold = face.id === "arabic-bars" || face.id === "roman-classic";
  const thin = face.id === "arabic-minimal" || face.id === "roman-minimal";
  const fontSize = bold ? 20 : thin ? 15 : 18;
  const fontWeight = bold ? 600 : thin ? 500 : 600;

  for (let n = 1; n <= 12; n++) {
    const ang = ((n * 30 - 90) * Math.PI) / 180;
    const rr = R - 28;
    const x = CX + rr * Math.cos(ang);
    const y = CY + rr * Math.sin(ang);
    const label = face.numerals === "roman" ? ROMAN_NUMERALS[n - 1] : String(n);
    svg += `<text x="${x}" y="${y + 0.8}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="${fontWeight}" fill="${pal.numeralFill}" font-family="${pal.numeralFont}" opacity="0.12">${label}</text>`;
    svg += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}" font-weight="${fontWeight}" fill="${pal.numeralFill}" font-family="${pal.numeralFont}">${label}</text>`;
  }

  return svg;
}

function renderTaperedHand(
  cx: number,
  cy: number,
  angle: number,
  length: number,
  color: string,
  width: number,
): string {
  const tipX = cx + length * Math.cos(angle);
  const tipY = cy + length * Math.sin(angle);
  const perp = angle + Math.PI / 2;
  const halfW = width / 2;
  const baseLen = length * 0.18;
  const bx = cx + baseLen * Math.cos(angle);
  const by = cy + baseLen * Math.sin(angle);
  const x1 = bx + halfW * Math.cos(perp);
  const y1 = by + halfW * Math.sin(perp);
  const x2 = bx - halfW * Math.cos(perp);
  const y2 = by - halfW * Math.sin(perp);
  return `<polygon points="${tipX},${tipY} ${x1},${y1} ${x2},${y2}" fill="${color}"/>`;
}

function renderBarHand(
  cx: number,
  cy: number,
  angle: number,
  length: number,
  color: string,
  width: number,
): string {
  const x2 = cx + length * Math.cos(angle);
  const y2 = cy + length * Math.sin(angle);
  return `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function renderHands(
  face: WatchFaceConfig,
  pal: WatchFacePalette,
  h: number,
  m: number,
  baseId: string,
): string {
  const ha = (((h % 12) * 30 + m * 0.5 - 90) * Math.PI) / 180;
  const ma = ((m * 6 - 90) * Math.PI) / 180;
  const hr = 50;
  const mr = 74;
  const shadowFilter = `url(#hand-shadow-${baseId})`;
  let hands = "";

  switch (face.hands) {
    case "bars":
      hands += renderBarHand(CX, CY, ha, hr, pal.hourHand, 6.5);
      hands += renderBarHand(CX, CY, ma, mr, pal.minuteHand, 4.5);
      break;
    case "thin":
      hands += `<line x1="${CX}" y1="${CY}" x2="${CX + hr * Math.cos(ha)}" y2="${CY + hr * Math.sin(ha)}" stroke="${pal.hourHand}" stroke-width="3" stroke-linecap="round"/>`;
      hands += `<line x1="${CX}" y1="${CY}" x2="${CX + mr * Math.cos(ma)}" y2="${CY + mr * Math.sin(ma)}" stroke="${pal.minuteHand}" stroke-width="2" stroke-linecap="round"/>`;
      break;
    case "classic":
      hands += renderTaperedHand(CX, CY, ha, hr, pal.hourHand, 7);
      hands += renderTaperedHand(CX, CY, ma, mr, pal.minuteHand, 5);
      break;
    case "tapered":
    default:
      hands += renderTaperedHand(CX, CY, ha, hr, pal.hourHand, 6.5);
      hands += renderTaperedHand(CX, CY, ma, mr, pal.minuteHand, 5);
      break;
  }

  let svg = `<g filter="${shadowFilter}">${hands}</g>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="9" fill="${pal.hub}" opacity="0.15"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="7.5" fill="${pal.hub}"/>`;
  svg += `<circle cx="${CX - 1.2}" cy="${CY - 1.2}" r="3.5" fill="${pal.hourHand}" opacity="0.5"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="2.2" fill="${pal.hubInner}"/>`;
  return svg;
}

function clockBaseId(face: WatchFaceConfig, instanceId?: string): string {
  return instanceId ? `${face.id}-${instanceId}` : face.id;
}

function buildClockDefs(face: WatchFaceConfig, pal: WatchFacePalette, baseId: string): string {
  const roman = face.numerals === "roman";
  const faceGrad = `face-${baseId}`;
  const bezelGrad = `bezel-${baseId}`;
  const highlightGrad = `highlight-${baseId}`;
  const vignetteGrad = `vignette-${baseId}`;
  const handShadow = `hand-shadow-${baseId}`;

  return `<defs>
    <radialGradient id="${faceGrad}" cx="36%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${roman ? "#fffef9" : "#ffffff"}"/>
      <stop offset="58%" stop-color="${pal.fill}"/>
      <stop offset="100%" stop-color="${roman ? "#e8dcc8" : "#dbeafe"}"/>
    </radialGradient>
    <linearGradient id="${bezelGrad}" x1="12%" y1="8%" x2="88%" y2="92%">
      <stop offset="0%" stop-color="${roman ? "#d4b896" : "#a5b4fc"}"/>
      <stop offset="45%" stop-color="${pal.stroke}"/>
      <stop offset="100%" stop-color="${roman ? "#5c4a3a" : "#312e81"}"/>
    </linearGradient>
    <radialGradient id="${highlightGrad}" cx="34%" cy="26%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.62"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${vignetteGrad}" cx="50%" cy="52%" r="52%">
      <stop offset="68%" stop-color="transparent"/>
      <stop offset="100%" stop-color="${roman ? "#3d3229" : "#1e1b4b"}" stop-opacity="0.07"/>
    </radialGradient>
    <filter id="${handShadow}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.8" stdDeviation="1.4" flood-color="#1e1b4b" flood-opacity="0.28"/>
    </filter>
  </defs>`;
}

function buildClockFace(face: WatchFaceConfig, instanceId?: string): string {
  const pal = paletteFor(face);
  const roman = face.numerals === "roman";
  const baseId = clockBaseId(face, instanceId);
  const faceGrad = `face-${baseId}`;
  const bezelGrad = `bezel-${baseId}`;
  const highlightGrad = `highlight-${baseId}`;
  const vignetteGrad = `vignette-${baseId}`;

  let svg = buildClockDefs(face, pal, baseId);
  svg += `<circle cx="${CX}" cy="${CY + 2}" r="${R + 5}" fill="${roman ? "#3d3229" : "#1e1b4b"}" opacity="0.08"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R + 5}" fill="url(#${bezelGrad})"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R + 2.5}" fill="none" stroke="${roman ? "#fffef9" : "#ffffff"}" stroke-width="1.2" opacity="${roman ? 0.35 : 0.5}"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#${faceGrad})" stroke="${pal.stroke}" stroke-width="2"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R - 9}" fill="none" stroke="${pal.innerStroke}" stroke-width="1" opacity="0.45"/>`;
  svg += renderMarkers(face, pal);
  svg += renderNumerals(face, pal);
  svg += `<circle cx="${CX}" cy="${CY}" r="${R - 1}" fill="url(#${highlightGrad})"/>`;
  svg += `<circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#${vignetteGrad})"/>`;
  return svg;
}

function renderAnnotations(h: number, m: number, pal: WatchFacePalette): string {
  let svg = "";
  const hourN = ((h + 11) % 12) + 1;
  const hAng = ((hourN * 30 - 90) * Math.PI) / 180;
  const rr = 66;
  const hnx = CX + rr * Math.cos(hAng);
  const hny = CY + rr * Math.sin(hAng);
  svg += `<circle cx="${hnx}" cy="${hny}" r="15" fill="none" stroke="${pal.annotateHour}" stroke-width="2.5" stroke-dasharray="4 3"/>`;

  const mtAng = ((m * 6 - 90) * Math.PI) / 180;
  const mtr = 88;
  const mtx = CX + mtr * Math.cos(mtAng);
  const mty = CY + mtr * Math.sin(mtAng);
  svg += `<circle cx="${mtx}" cy="${mty}" r="6.5" fill="${pal.annotateMinute}" opacity="0.85"/>`;
  return svg;
}

export function buildClockSVG(
  h: number,
  m: number,
  annotate = false,
  faceId: WatchFaceId = DEFAULT_WATCH_FACE,
  instanceId?: string,
): string {
  const face = getWatchFace(faceId);
  const pal = paletteFor(face);
  let svg = buildClockFace(face, instanceId);

  if (annotate) {
    svg += renderAnnotations(h, m, pal);
  }

  svg += renderHands(face, pal, h, m, clockBaseId(face, instanceId));
  return svg;
}
