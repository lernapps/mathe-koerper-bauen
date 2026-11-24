import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, reason, solution, wrong, type Props } from "./NetzFalten.ts";

const faltbar: Props = {
  mode: "faltbar",
  task: "Faltet sich das Netz zu einem Würfel?",
  mistakes: ["ja: {a} und {b} fallen aufeinander.", "nein: es faltet sich.", "Nachbar {n} von {k}."],
};
const gegenueber: Props = { ...faltbar, mode: "gegenueber", task: "Welche Fläche liegt gegenüber von Fläche {k}?" };

test("faltbar: right answer passes, the other fails, mistakes are wrong and typed", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, faltbar);
    expect(task.net).toHaveLength(6);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    expect(solution(task)).toBe(seed % 2);
    for (const a of mistakes(task, faltbar)) if (a !== undefined) expect(check(task, a)).toBe(false);
    expect(reason(task, wrong(task), faltbar)).toBeTypeOf("string");
  }
});

test("gegenueber: the opposite square is right, a neighbour is wrong with its message", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, gegenueber);
    expect(task.asked).toBeGreaterThanOrEqual(1);
    expect(task.asked).toBeLessThanOrEqual(6);
    const right = solution(task);
    expect(right).not.toBe(task.asked);
    expect(check(task, right)).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    expect(reason(task, wrong(task), gegenueber)).toContain("Nachbar");
  }
});

test("describe names the net in words and the solution", () => {
  const task = generate(1, faltbar);
  const d = describe(task, faltbar, "de");
  expect(d.task).toContain("Reihe 1");
  expect(d.solution).toBe("ja, faltbar");
});
