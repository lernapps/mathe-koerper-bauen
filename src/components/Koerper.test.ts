import { expect, test } from "vite-plus/test";
import { FOLDABLE, NOT_FOLDABLE, folding, fold, folds, opposite, parse, project } from "./Koerper.ts";

test("the eleven nets of a cube fold, the others do not", () => {
  for (const net of FOLDABLE) expect(folds(net)).toBe(true);
  for (const net of NOT_FOLDABLE) expect(folds(net)).toBe(false);
  expect(NOT_FOLDABLE.every((net) => fold(net).collision !== undefined || !fold(net).ok)).toBe(true);
});

test("in a row of four, squares two apart are opposite", () => {
  const net = parse(["X...", "XXXX", "X..."]);
  // reading order: 0 above the row, then the row 1..4, then 5 below
  expect(opposite(net, 1)).toBe(3);
  expect(opposite(net, 2)).toBe(4);
  for (let i = 0; i < 6; i++) expect(opposite(net, opposite(net, i))).toBe(i);
});

test("a cuboid is flat at t = 0 and closed at t = 1", () => {
  const flat = folding(2, 3, 1, 0);
  for (const f of flat) for (const c of f.corners) expect(Math.abs(c[2])).toBeLessThan(1e-9);
  const closed = folding(2, 3, 1, 1);
  const zs = closed.flatMap((f) => f.corners.map((c) => c[2]));
  expect(Math.max(...zs)).toBeCloseTo(1);
  expect(Math.min(...zs)).toBeCloseTo(0);
  const xs = closed.flatMap((f) => f.corners.map((c) => c[0]));
  const ys = closed.flatMap((f) => f.corners.map((c) => c[1]));
  expect(Math.max(...xs)).toBeCloseTo(2);
  expect(Math.min(...xs)).toBeCloseTo(0);
  expect(Math.max(...ys)).toBeCloseTo(3);
  expect(Math.min(...ys)).toBeCloseTo(0);
});

test("a projection keeps every face and orders them far to near", () => {
  const p = project(folding(1, 1, 1, 0.5), 30, 35);
  expect(p.map((f) => f.number).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  for (let i = 1; i < p.length; i++)
    expect((p[i] as { depth: number }).depth).toBeGreaterThanOrEqual((p[i - 1] as { depth: number }).depth);
});
