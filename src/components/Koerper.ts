// The geometry of the Baukasten, pure and without a browser: whether a net of six squares folds to a cube, which
// face lies opposite which, and a cuboid that folds open and shut, seen from a turnable point of view. Used by
// KoerperBaukasten.vue and NetzFalten.vue and tested in Koerper.test.ts.

/** A square of a net: [column, row], rows count downwards as on the screen. */
export type Cell = readonly [number, number];
/** A net: six squares joined edge to edge. */
export type Net = readonly Cell[];

/** A small seeded random generator (mulberry32). */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The squares in reading order (row by row, left to right), the order of their numbers 1 to 6. */
export function sorted(net: Net): Cell[] {
  return [...net].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

/**
 * Rolls a cube over the net: it starts on the first square and rolls over every square that touches an edge of the one
 * before. The face that touches the paper on a square is the face that square becomes. Faces: 0 bottom, 1 top, 2 north,
 * 3 south, 4 east, 5 west; the opposite of a face is `face ^ 1`.
 */
export function fold(net: Net): { faces: number[]; ok: boolean; collision?: [number, number] } {
  const cells = sorted(net);
  const faces: number[] = Array.from({ length: cells.length }, () => -1);
  const key = (c: Cell) => `${c[0]},${c[1]}`;
  const index = new Map(cells.map((c, i) => [key(c), i]));
  // orientation of the cube: which face is at the bottom, top, north, south, east, west
  type Cube = { b: number; t: number; n: number; s: number; e: number; w: number };
  const roll = (c: Cube, dx: number, dy: number): Cube => {
    if (dx === 1) return { ...c, b: c.e, e: c.t, t: c.w, w: c.b };
    if (dx === -1) return { ...c, b: c.w, w: c.t, t: c.e, e: c.b };
    if (dy === -1) return { ...c, b: c.n, n: c.t, t: c.s, s: c.b };
    return { ...c, b: c.s, s: c.t, t: c.n, n: c.b };
  };
  const start: Cube = { b: 0, t: 1, n: 2, s: 3, e: 4, w: 5 };
  const queue: [number, Cube][] = [[0, start]];
  faces[0] = 0;
  while (queue.length > 0) {
    const [i, cube] = queue.shift() as [number, Cube];
    const [x, y] = cells[i] as Cell;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, -1],
      [0, 1],
    ] as const) {
      const j = index.get(key([x + dx, y + dy]));
      if (j === undefined || faces[j] !== -1) continue;
      const next = roll(cube, dx, dy);
      faces[j] = next.b;
      queue.push([j, next]);
    }
  }
  if (faces.includes(-1)) return { faces, ok: false };
  // a pair that shares an edge only collides because four squares meet at a corner: name a pair far apart first
  let found: [number, number] | undefined;
  for (let i = 0; i < faces.length; i++)
    for (let j = i + 1; j < faces.length; j++) {
      if (faces[i] !== faces[j]) continue;
      const [a, b] = [cells[i] as Cell, cells[j] as Cell];
      const apart = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) > 1;
      if (found === undefined || apart) found = [i, j];
      if (apart) return { faces, ok: false, collision: found };
    }
  if (found !== undefined) return { faces, ok: false, collision: found };
  return { faces, ok: true };
}

/** Whether the net folds to a cube. */
export const folds = (net: Net): boolean => fold(net).ok;

/** The index (0 to 5, in reading order) of the square that lies opposite the square `i` once the net is a cube. */
export function opposite(net: Net, i: number): number {
  const { faces } = fold(net);
  return faces.indexOf((faces[i] as number) ^ 1);
}

/** Rows of crosses as a net: "XX." / ".XXX" ... (a text for a test and a catalogue). */
export function parse(rows: readonly string[]): Net {
  const cells: Cell[] = [];
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === "X" && cells.push([x, y])));
  return cells;
}

/** Nets that fold to a cube: the eleven nets of a cube, one of them in a second position. */
export const FOLDABLE: readonly Net[] = [
  ["X...", "XXXX", "X..."],
  ["X...", "XXXX", ".X.."],
  ["X...", "XXXX", "..X."],
  ["X...", "XXXX", "...X"],
  [".X..", "XXXX", ".X.."],
  ["X..", "XX.", ".XX", "..X"],
  ["X..", "XX.", ".XX", ".X."],
  ["X..", "XX.", ".X.", ".XX"],
  ["X..", "XXX", ".X.", ".X."],
  ["X.", "X.", "XX", ".X", ".X"],
  [".X.", "XX.", ".XX", ".X."],
  [".X.", "XXX", ".X.", ".X."],
].map(parse);

/** Nets of six squares that do not fold to a cube (the 24 other hexominoes, a choice of them). */
export const NOT_FOLDABLE: readonly Net[] = [
  ["XX", "XX", "XX"],
  ["X..", "XXX", ".XX"],
  ["XX.", "XXX", ".X."],
  ["X..", "XXX", "XX."],
  ["X..", "XX.", "XXX"],
  ["XX.", ".XX", "XX."],
  ["X..", "XXX", "X.X"],
  ["X..", "X.X", "XXX"],
  ["XXXXX", "X...."],
  ["X..X", "XXXX"],
].map(parse);

/** Normalises a net so that its top left corner is [0, 0]. */
export function normalise(net: Net): Cell[] {
  const minX = Math.min(...net.map((c) => c[0]));
  const minY = Math.min(...net.map((c) => c[1]));
  return net.map((c) => [c[0] - minX, c[1] - minY] as Cell);
}

/** The width and height of a net in squares. */
export function size(net: Net): { columns: number; rows: number } {
  const n = normalise(net);
  return { columns: Math.max(...n.map((c) => c[0])) + 1, rows: Math.max(...n.map((c) => c[1])) + 1 };
}

/** The net in words, for a screen reader and for readers without scripts: row by row, with the numbers of its squares. */
export function describeNet(net: Net, row = "Reihe {r}: Quadrat {list}", gap = "Lücke"): string {
  const cells = sorted(normalise(net));
  const rows = size(net).rows;
  const lines: string[] = [];
  for (let r = 0; r < rows; r++) {
    const inRow = cells.map((c, i) => [c, i + 1] as const).filter(([c]) => c[1] === r);
    const parts = inRow.map(([c, n]) => `${n} (Spalte ${c[0] + 1})`);
    lines.push(row.replace("{r}", String(r + 1)).replace("{list}", parts.join(", ") || gap));
  }
  return lines.join("; ");
}

// ---- the cuboid that folds open and shut ----

export type Vec3 = readonly [number, number, number];

/** A face of the folding cuboid: its number (1 bottom, 2 front, 3 right, 4 back, 5 left, 6 top) and its corners. */
export interface Face {
  number: number;
  corners: Vec3[];
}

/**
 * The cuboid of width `w`, depth `d` and height `h` as a cross net (bottom in the middle, the top attached to the back
 * face) folded by `t` (0 flat, 1 closed). The bottom lies in the plane z = 0 and does not move.
 */
export function folding(w: number, d: number, h: number, t: number): Face[] {
  const a = (Math.PI / 2) * Math.min(1, Math.max(0, t));
  const c = Math.cos(a);
  const s = Math.sin(a);
  const c2 = Math.cos(2 * a);
  const s2 = Math.sin(2 * a);
  const front = (x: number, y: number): Vec3 => [x, y * c, -y * s];
  const back = (x: number, y: number): Vec3 => [x, d + (y - d) * c, (y - d) * s];
  const left = (x: number, y: number): Vec3 => [x * c, y, -x * s];
  const right = (x: number, y: number): Vec3 => [w + (x - w) * c, y, (x - w) * s];
  const top = (x: number, y: number): Vec3 => {
    const v = y - (d + h);
    return [x, d + h * c + v * c2, h * s + v * s2];
  };
  return [
    {
      number: 1,
      corners: [
        [0, 0, 0],
        [w, 0, 0],
        [w, d, 0],
        [0, d, 0],
      ],
    },
    { number: 2, corners: [front(0, 0), front(w, 0), front(w, -h), front(0, -h)] },
    { number: 3, corners: [right(w, 0), right(w + h, 0), right(w + h, d), right(w, d)] },
    { number: 4, corners: [back(0, d), back(w, d), back(w, d + h), back(0, d + h)] },
    { number: 5, corners: [left(0, 0), left(-h, 0), left(-h, d), left(0, d)] },
    { number: 6, corners: [top(0, d + h), top(w, d + h), top(w, d + h + d), top(0, d + h + d)] },
  ];
}

/** A projected face: screen corners (x right, y down), the depth of its middle and the middle for its label. */
export interface Projected {
  number: number;
  points: [number, number][];
  depth: number;
  middle: [number, number];
}

/**
 * Turns the cuboid by `azimuth` around the vertical axis and tilts the view by `elevation` (both in degrees) and projects
 * it parallel onto the screen. The faces come back from far to near, so that drawing them in order hides the right ones.
 */
export function project(faces: Face[], azimuth: number, elevation: number): Projected[] {
  const az = (azimuth * Math.PI) / 180;
  const el = (elevation * Math.PI) / 180;
  const view = ([x, y, z]: Vec3) => {
    const x1 = x * Math.cos(az) - y * Math.sin(az);
    const y1 = x * Math.sin(az) + y * Math.cos(az);
    return { sx: x1, sy: -(y1 * Math.sin(el) + z * Math.cos(el)), depth: -y1 * Math.cos(el) + z * Math.sin(el) };
  };
  return faces
    .map((f) => {
      const v = f.corners.map(view);
      const n = v.length;
      return {
        number: f.number,
        points: v.map((p) => [p.sx, p.sy] as [number, number]),
        depth: v.reduce((sum, p) => sum + p.depth, 0) / n,
        middle: [v.reduce((sum, p) => sum + p.sx, 0) / n, v.reduce((sum, p) => sum + p.sy, 0) / n] as [number, number],
      };
    })
    .sort((p, q) => p.depth - q.depth);
}
