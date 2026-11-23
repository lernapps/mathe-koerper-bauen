// The logic of NetzFalten.vue: a net of six squares that the learner folds in the mind. In the mode "faltbar" the
// answer says whether it folds to a cube (1 yes, 0 no); in the mode "gegenueber" it is the number of the square that
// lies opposite a given square. Pure functions the build tests over fixed seeds (the exercise contract). The explainer
// checks an answer with check and gives the message of reason; describe, template, params, mistakes and show are for
// the page without scripts and for the tutor.
import {
  FOLDABLE,
  NOT_FOLDABLE,
  describeNet,
  fold,
  normalise,
  opposite,
  random,
  size,
  sorted,
  type Cell,
  type Net,
} from "./Koerper.ts";

/** The props the logic needs: the mode, the task text and the app's message for each typical mistake. */
export interface Props {
  mode: "faltbar" | "gegenueber";
  task: string;
  mistakes?: readonly string[];
}

export interface Task {
  /** The mode of the block the task is for. */
  mode: "faltbar" | "gegenueber";
  /** The net, its squares in reading order are the squares 1 to 6. */
  net: Cell[];
  /** The number (1 to 6) of the asked square (mode gegenueber), else 0. */
  asked: number;
}

/** The answer: 1 or 0 (faltbar) or the number of a square (gegenueber). */
export type Answer = number;

/** One of the eight ways to turn and mirror a net; none changes whether it folds. */
function transform(net: Net, way: number): Cell[] {
  return normalise(
    net.map(([x, y]) => {
      const [a, b] = way & 1 ? [y, x] : [x, y];
      return [way & 2 ? -a : a, way & 4 ? -b : b] as Cell;
    }),
  );
}

/** The task of `seed`: in the mode faltbar an odd seed gives a net that folds, an even one a net that does not. */
export function generate(seed: number, props?: Props): Task {
  const next = random(seed * 7919 + 13);
  const mode = props?.mode ?? "faltbar";
  const pool = mode === "gegenueber" || seed % 2 === 1 ? FOLDABLE : NOT_FOLDABLE;
  const net = transform(pool[Math.floor(next() * pool.length)] as Net, Math.floor(next() * 8));
  return { mode, net, asked: mode === "gegenueber" ? 1 + Math.floor(next() * 6) : 0 };
}

const folded = (task: Task) => fold(task.net).ok;

/** The squares that touch the asked square along an edge, as numbers. */
function neighbours(task: Task): number[] {
  const cells = sorted(task.net);
  const asked = cells[task.asked - 1] as Cell;
  return cells
    .map((c, i) => [c, i + 1] as const)
    .filter(([c]) => Math.abs(c[0] - asked[0]) + Math.abs(c[1] - asked[1]) === 1)
    .map(([, n]) => n);
}

/** The number of the square opposite the asked one. */
const oppositeNumber = (task: Task) => opposite(task.net, task.asked - 1) + 1;

/** Whether `answer` is right. */
export function check(task: Task, answer: Answer): boolean {
  return task.mode === "gegenueber" ? answer === oppositeNumber(task) : answer === (folded(task) ? 1 : 0);
}

/** The right answer. */
export function solution(task: Task): Answer {
  return task.mode === "gegenueber" ? oppositeNumber(task) : folded(task) ? 1 : 0;
}

/** A wrong answer. */
export function wrong(task: Task): Answer {
  return task.mode === "gegenueber" ? (neighbours(task)[0] ?? 0) : folded(task) ? 0 : 1;
}

/**
 * The answer of each typical mistake of about.mistakes: "ja" for a net that does not fold, "nein" for one that does,
 * and a square that touches the asked one.
 */
export function mistakes(task: Task, _props?: Props): (Answer | undefined)[] {
  if (task.mode === "gegenueber") return [undefined, undefined, neighbours(task)[0]];
  return [folded(task) ? undefined : 1, folded(task) ? 0 : undefined, undefined];
}

/** A text of the props with {a} and {b} (the squares that land on each other), {k} (the asked square), {n} filled in. */
export function fill(text: string, task: Task, n = 0): string {
  const collision = fold(task.net).collision ?? [0, 0];
  return text
    .replace(/\{a\}/g, String(collision[0] + 1))
    .replace(/\{b\}/g, String(collision[1] + 1))
    .replace(/\{k\}/g, String(task.asked))
    .replace(/\{n\}/g, String(n));
}

/** The app's message for a wrong answer, from the props: that of its typical mistake, or none. */
export function reason(task: Task, answer: Answer, props: Props, _lang?: string): string | undefined {
  // every square that touches the asked one in the net gets the message of the neighbour
  const neighbour = task.mode === "gegenueber" && neighbours(task).includes(answer);
  const index = neighbour ? 2 : mistakes(task, props).findIndex((mistaken) => mistaken === answer);
  // a wrong answer of no typical mistake in the mode gegenueber gets the general message, the fourth one
  const general = task.mode === "gegenueber" && !check(task, answer) && answer >= 1 && answer <= 6 ? 3 : -1;
  const message = props.mistakes?.[index < 0 ? general : index];
  return message === undefined ? undefined : fill(message, task, answer);
}

/** The net in words. */
export const netText = (task: Task) => describeNet(task.net, "Reihe {r}: Quadrat {list}");

/** The task as a learner sees it with the net in words, and its solution. */
export function describe(task: Task, props: Props, _lang: string): { task: string; solution: string } {
  const text = `${fill(props.task, task)} Das Netz in Worten, ${size(task.net).columns} Spalten: ${netText(task)}.`;
  return { task: text, solution: show(solution(task), task, props) };
}

/** The task as a learner reads it: the prop task. */
export function template(props: Props, _lang: string): string {
  return `${props.task} Das Netz: {Netz}`;
}

/** What sets a task: the net in words and the asked square. */
export function params(task: Task, _props: Props, _lang: string): Record<string, string | number> {
  return { Netz: netText(task), k: task.asked };
}

/** An answer as text. */
export function show(answer: Answer, task?: Task, _props?: Props, _lang?: string): string {
  if (task?.mode === "gegenueber") return `Fläche ${answer}`;
  return answer === 1 ? "ja, faltbar" : "nein, nicht faltbar";
}

/** What the exercise is, for a tutor. */
export const about = {
  task: "Ein Netz aus sechs Quadraten ist gezeichnet, die Quadrate sind von 1 bis 6 nummeriert. Im Modus „faltbar“ entscheidet das Kind, ob sich das Netz zu einem Würfel falten lässt (zwei Knöpfe „Ja“ und „Nein“); im Modus „gegenüber“ wählt es, welche Fläche im gefalteten Würfel gegenüber einer genannten Fläche liegt (Knöpfe 1 bis 6). Danach „Prüfen“.",
  answer: "Ja oder Nein, oder die Nummer der gegenüberliegenden Fläche.",
  correct:
    "Richtig, wenn jede Fläche beim Falten auf einer eigenen Würfelseite landet (faltbar) bzw. wenn die gewählte Fläche beim Falten gegenüber liegt.",
  mistakes: [
    "Sagt „ja“, obwohl zwei Flächen beim Falten übereinanderfallen.",
    "Sagt „nein“, obwohl sich das Netz zum Würfel falten lässt.",
    "Wählt eine Fläche, die im Netz an die genannte grenzt: Nachbarn im Netz sind im Würfel nie gegenüber.",
  ],
};
