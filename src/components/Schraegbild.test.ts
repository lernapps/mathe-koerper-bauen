import { expect, test } from "vite-plus/test";
import {
  check,
  drawing,
  expected,
  generate,
  mistakes,
  reason,
  solution,
  wrong,
  type Body,
  type Props,
} from "./Schraegbild.ts";

const bodies: Body[] = ["quader", "prisma", "zylinder", "pyramide", "kegel"];
const props = (body: Body): Props => ({ body, task: "{w} {h} {d}", mistakes: ["doppelt", "rechts", "oben", "halb"] });

test("the right answer passes, a wrong one and each typical mistake fail", () => {
  for (const body of bodies)
    for (let seed = 1; seed <= 50; seed++) {
      const task = generate(seed, props(body));
      expect(check(task, solution(task))).toBe(true);
      expect(check(task, wrong(task))).toBe(false);
      for (const m of mistakes(task, props(body))) if (m) expect(check(task, m)).toBe(false);
      expect(Number.isInteger(expected(task).right)).toBe(true);
      expect(Number.isInteger(expected(task).up)).toBe(true);
      if (body === "pyramide") expect(task.d % 2).toBe(0);
    }
});

test("a mistake gets its message", () => {
  const task = generate(1, props("quader"));
  const e = expected(task);
  expect(reason(task, { right: 2 * e.right, up: 2 * e.up }, props("quader"))).toBe("doppelt");
  expect(reason(task, { right: e.right, up: 0 }, props("quader"))).toBe("rechts");
});

test("a quader is drawn with twelve edges, three of them dashed", () => {
  const task = { body: "quader" as const, w: 3, h: 2, d: 4 };
  const d = drawing(task, expected(task));
  expect(d.lines).toHaveLength(12);
  expect(d.lines.filter((l) => l.hidden)).toHaveLength(3);
  // the front is true size: 3 cm = 6 squares wide
  const bottom = d.lines[0];
  expect(Math.abs((bottom?.x2 ?? 0) - (bottom?.x1 ?? 0))).toBe(6);
});

test("every body is drawn inside its paper", () => {
  for (const body of bodies) {
    const task = generate(3, props(body));
    const d = drawing(task, expected(task));
    for (const l of d.lines) for (const v of [l.x1, l.x2]) expect(v).toBeLessThanOrEqual(d.width);
    for (const l of d.lines) for (const v of [l.y1, l.y2]) expect(v).toBeLessThanOrEqual(d.height);
  }
});
