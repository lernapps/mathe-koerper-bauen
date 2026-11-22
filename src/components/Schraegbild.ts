// The logic of Schraegbild.vue: a drawing on squared paper (Kästchenpapier) in Kavalierperspektive. Lengths along the
// width and height are drawn true, 1 cm is 2 squares (a square is 0,5 cm); a depth edge runs diagonally and is drawn
// half as long: as many squares as the edge has centimetres. The learner sets how far the back (or the tip, or the top
// circle) lies to the right of and above the front, in squares, and sees the body drawn from it. Pure functions the
// build tests over fixed seeds (the exercise contract).
import { random } from "./Koerper.ts";

export type Body = "quader" | "prisma" | "zylinder" | "pyramide" | "kegel";

/** The props the logic needs: the body, the task text and the app's message for each typical mistake. */
export interface Props {
  body: Body;
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  body: Body;
  /** Width (quader, prisma, pyramide) or radius (zylinder, kegel), height and depth, in cm. */
  w: number;
  h: number;
  d: number;
}

/** The answer: how many squares to the right of and above the point it starts from. */
export interface Answer {
  right: number;
  up: number;
}

/** The task of `seed`. The depth of a pyramid is even, so that its tip lies on a grid point. */
export function generate(seed: number, props?: Props): Task {
  const next = random(seed * 104729 + 7);
  const body = props?.body ?? "quader";
  const pick = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  if (body === "zylinder" || body === "kegel") return { body, w: pick(2, 4), h: pick(2, 4), d: 0 };
  return { body, w: pick(3, 6), h: pick(2, 4), d: body === "pyramide" ? 2 * pick(1, 2) : pick(2, 5) };
}

/** The right answer. */
export function expected(task: Task): Answer {
  switch (task.body) {
    case "quader":
    case "prisma":
      return { right: task.d, up: task.d };
    case "zylinder":
    case "kegel":
      return { right: 0, up: 2 * task.h };
    case "pyramide":
      return { right: task.w + task.d / 2, up: task.d / 2 + 2 * task.h };
  }
}

const same = (a: Answer, b: Answer) => a.right === b.right && a.up === b.up;

/** Whether `answer` is right. */
export function check(task: Task, answer: Answer): boolean {
  return same(answer, expected(task));
}

/** The right answer. */
export function solution(task: Task): Answer {
  return expected(task);
}

/** A wrong answer: the right one doubled (the edge drawn as long as it is). */
export function wrong(task: Task): Answer {
  const e = expected(task);
  return { right: 2 * e.right + 1, up: 2 * e.up + 1 };
}

/**
 * The answer of each typical mistake of about.mistakes: the way twice as long, only to the right, only upwards, only
 * half as long. A mistake that equals the right answer or is no whole number is none.
 */
export function mistakes(task: Task, _props?: Props): (Answer | undefined)[] {
  const e = expected(task);
  const candidates: Answer[] = [
    { right: 2 * e.right, up: 2 * e.up },
    { right: e.right, up: 0 },
    { right: 0, up: e.up },
    { right: e.right / 2, up: e.up / 2 },
  ];
  return candidates.map((c) =>
    Number.isInteger(c.right) && Number.isInteger(c.up) && !same(c, e) && (c.right !== 0 || c.up !== 0) ? c : undefined,
  );
}

/** A text of the props with {w}, {h}, {d} and the squares {W}, {H} filled in. */
export function fill(text: string, task: Task, answer?: Answer): string {
  return text
    .replace(/\{w\}/g, String(task.w))
    .replace(/\{h\}/g, String(task.h))
    .replace(/\{d\}/g, String(task.d))
    .replace(/\{W\}/g, String(2 * task.w))
    .replace(/\{H\}/g, String(2 * task.h))
    .replace(/\{r\}/g, String(answer?.right ?? 0))
    .replace(/\{u\}/g, String(answer?.up ?? 0));
}

/** The app's message for a wrong answer, from the props: that of its typical mistake, or none. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  const index = mistakes(task, props).findIndex((m) => m !== undefined && same(m, answer));
  const message = index < 0 ? undefined : props.mistakes?.[index];
  return message === undefined ? undefined : fill(message, task, answer);
}

/** A line of the drawing in squares: from (x1, y1) to (x2, y2), y upwards; `hidden` lines are dashed. */
export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  hidden: boolean;
}

/** An ellipse of the drawing: centre, half widths, and whether its back half is hidden. */
export interface Ellipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface Drawing {
  lines: Line[];
  ellipses: Ellipse[];
  /** The size of the paper in squares. */
  width: number;
  height: number;
}

const line = (x1: number, y1: number, x2: number, y2: number, hidden = false): Line => ({ x1, y1, x2, y2, hidden });

/** The body drawn for the answer (right, up), the front's lower left corner (or the middle of the lower circle) at (ox, oy). */
export function drawing(task: Task, answer: Answer, ox = 1, oy = 1): Drawing {
  const W = 2 * task.w;
  const H = 2 * task.h;
  const { right, up } = answer;
  const lines: Line[] = [];
  const ellipses: Ellipse[] = [];
  const at = (x: number, y: number): [number, number] => [ox + x, oy + y];
  const seg = (a: [number, number], b: [number, number], hidden = false) =>
    lines.push(line(a[0], a[1], b[0], b[1], hidden));
  if (task.body === "quader") {
    const front = [at(0, 0), at(W, 0), at(W, H), at(0, H)] as const;
    const back = front.map(([x, y]) => [x + right, y + up] as [number, number]);
    for (let i = 0; i < 4; i++) {
      seg(front[i] as [number, number], front[(i + 1) % 4] as [number, number]);
      // the back lower left corner is hidden: its three edges are dashed
      seg(back[i] as [number, number], back[(i + 1) % 4] as [number, number], i === 0 || i === 3);
      seg(front[i] as [number, number], back[i] as [number, number], i === 0);
    }
  } else if (task.body === "prisma") {
    const front = [at(0, 0), at(W, 0), at(0, H)] as const;
    const back = front.map(([x, y]) => [x + right, y + up] as [number, number]);
    for (let i = 0; i < 3; i++) {
      seg(front[i] as [number, number], front[(i + 1) % 3] as [number, number]);
      seg(back[i] as [number, number], back[(i + 1) % 3] as [number, number], i === 0 || i === 2);
      seg(front[i] as [number, number], back[i] as [number, number], i === 0);
    }
  } else if (task.body === "pyramide") {
    const d = task.d;
    const base = [at(0, 0), at(W, 0), at(W + d, d), at(d, d)] as const;
    for (let i = 0; i < 4; i++)
      seg(base[i] as [number, number], base[(i + 1) % 4] as [number, number], i === 2 || i === 3);
    const tip = at(right, up);
    for (let i = 0; i < 4; i++) seg(base[i] as [number, number], tip, i === 3);
  } else {
    const r = 2 * task.w;
    ellipses.push({ cx: ox, cy: oy, rx: r, ry: r / 2 });
    const tip = at(right, up);
    if (task.body === "zylinder") {
      ellipses.push({ cx: tip[0], cy: tip[1], rx: r, ry: r / 2 });
      seg(at(-r, 0), [tip[0] - r, tip[1]]);
      seg(at(r, 0), [tip[0] + r, tip[1]]);
    } else {
      seg(at(-r, 0), tip);
      seg(at(r, 0), tip);
    }
  }
  const xs = [...lines.flatMap((l) => [l.x1, l.x2]), ...ellipses.flatMap((e) => [e.cx - e.rx, e.cx + e.rx])];
  const ys = [...lines.flatMap((l) => [l.y1, l.y2]), ...ellipses.flatMap((e) => [e.cy - e.ry, e.cy + e.ry])];
  return { lines, ellipses, width: Math.max(...xs) + 1, height: Math.max(...ys) + 1 };
}

/** The task as a learner sees it, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  return { task: fill(props.task, task), solution: show(expected(task), task, props) };
}

/** The task as a learner reads it: the prop task. */
export function template(props: Props, _lang: string): string {
  return props.task;
}

/** What sets a task: the measures in cm and in squares. */
export function params(task: Task, _props: Props, _lang: string): Record<string, number> {
  return { w: task.w, h: task.h, d: task.d, W: 2 * task.w, H: 2 * task.h };
}

/** An answer as text. */
export function show(answer: Answer, _task?: Task, _props?: Props, _lang?: string): string {
  return `${answer.right} Kästchen nach rechts, ${answer.up} Kästchen nach oben`;
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Auf Kästchenpapier (ein Kästchen ist 0,5 cm) ist ein Körper im Schrägbild zu zeichnen. Das Kind stellt mit zwei Zählern (Plus und Minus) ein, wie viele Kästchen nach rechts und nach oben die hintere Fläche, der Mittelpunkt der oberen Kreisfläche oder die Spitze liegt, und sieht den Körper danach gezeichnet. Danach „Prüfen“. Breite und Höhe werden in wahrer Länge gezeichnet, 1 cm sind 2 Kästchen. Eine Tiefenkante läuft schräg unter 45° und wird auf halbe Länge verkürzt: so viele Kästchen, wie sie cm lang ist.",
  answer: "Zwei Zahlen: Kästchen nach rechts und Kästchen nach oben.",
  correct:
    "Richtig, wenn die Verschiebung genau zum Körper passt (Quader und Prisma: so viele Kästchen nach rechts und oben wie die Tiefe in cm; Zylinder und Kegel: Höhe in cm mal 2 nach oben; Pyramide: Mitte der Grundfläche plus Höhe).",
  mistakes: [
    "Den Weg doppelt so weit gezeichnet: die Länge nicht halbiert.",
    "Nur nach rechts gegangen, nicht schräg.",
    "Nur nach oben gegangen, nicht schräg.",
    "Nur halb so weit gegangen (Quader: die Länge doppelt halbiert; Höhe: cm statt Kästchen).",
  ],
};
