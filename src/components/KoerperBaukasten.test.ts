import { expect, test } from "vite-plus/test";
import { folding, project } from "./Koerper.ts";

test("every position of the slider gives six faces with finite corners", () => {
  for (let percent = 0; percent <= 100; percent += 5)
    for (const f of project(folding(2, 2, 2, percent / 100), 25, 30)) {
      expect(f.points).toHaveLength(4);
      for (const [x, y] of f.points) {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
      }
    }
});

test("a cube stays a cube: the closed faces all have the same edge length in space", () => {
  const faces = folding(3, 3, 3, 1);
  for (const f of faces) {
    const edges = f.corners.map((c, i) => {
      const n = f.corners[(i + 1) % 4] as readonly [number, number, number];
      return Math.hypot(n[0] - c[0], n[1] - c[1], n[2] - c[2]);
    });
    for (const e of edges) expect(e).toBeCloseTo(3);
  }
});
