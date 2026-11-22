<script setup lang="ts">
// The Baukasten: a cuboid (a cube if w, d and h are equal) that the learner turns and folds open and shut. A slider
// folds it from flat (the net) to closed, four buttons and the arrow keys turn it, "Zurücksetzen" brings it back. Not an
// exercise: it shows and answers nothing. The faces carry numbers, so that colour is never the only mark. The geometry
// is in Koerper.ts.
import { computed, ref } from "vue";
import { folding, project } from "./Koerper.ts";

const props = defineProps<{
  /** Width, depth and height of the cuboid, in squares. */
  w: number;
  d: number;
  h: number;
  /** The text for a screen reader: what the figure shows, with {p} for how far it is folded in percent. */
  alt: string;
  /** The label of the slider. */
  slider: string;
  /** The buttons that turn the cuboid, and the one that brings it back. */
  left: string;
  right: string;
  up: string;
  down: string;
  reset: string;
  /** How far it is folded when it appears, in percent. */
  start: number;
}>();

const percent = ref(props.start);
const azimuth = ref(25);
const elevation = ref(30);
const unit = 36;

const shapes = computed(() =>
  project(folding(props.w, props.d, props.h, percent.value / 100), azimuth.value, elevation.value),
);
const bounds = computed(() => {
  // the frame for every fold: the flat net is the widest picture, so the frame stays the same while the slider moves
  const all = project(folding(props.w, props.d, props.h, 0), 0, 90).concat(
    project(folding(props.w, props.d, props.h, 1), azimuth.value, elevation.value),
    shapes.value,
  );
  const xs = all.flatMap((f) => f.points.map((p) => p[0]));
  const ys = all.flatMap((f) => f.points.map((p) => p[1]));
  const pad = 0.4;
  return {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + 2 * pad,
    h: Math.max(...ys) - Math.min(...ys) + 2 * pad,
  };
});

function turn(da: number, de: number): void {
  azimuth.value = (azimuth.value + da + 360) % 360;
  elevation.value = Math.min(80, Math.max(5, elevation.value + de));
}
function back(): void {
  percent.value = props.start;
  azimuth.value = 25;
  elevation.value = 30;
}
function key(e: KeyboardEvent): void {
  const moves: Record<string, [number, number]> = {
    ArrowLeft: [-15, 0],
    ArrowRight: [15, 0],
    ArrowUp: [0, 10],
    ArrowDown: [0, -10],
  };
  const m = moves[e.key];
  if (m === undefined || e.target instanceof HTMLInputElement) return;
  e.preventDefault();
  turn(m[0], m[1]);
}
const polygon = (points: [number, number][]) => points.map((p) => p.join(",")).join(" ");
</script>

<template>
  <div class="koerper-baukasten" tabindex="0" @keydown="key">
    <svg
      role="img"
      :aria-label="alt.replace('{p}', String(percent))"
      :viewBox="`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`"
      :style="{ width: `${Math.min(100, bounds.w * unit)}%`, maxWidth: `${bounds.w * unit * 1.4}px` }"
    >
      <g v-for="f in shapes" :key="f.number">
        <polygon :points="polygon(f.points)" :class="`koerper-baukasten-face koerper-baukasten-face-${f.number % 2}`" />
        <text :x="f.middle[0]" :y="f.middle[1] + 0.12" text-anchor="middle" class="koerper-baukasten-number">
          {{ f.number }}
        </text>
      </g>
    </svg>
    <div class="koerper-baukasten-controls">
      <label class="koerper-baukasten-slider">
        <span>{{ slider }}: {{ percent }} %</span>
        <input v-model.number="percent" type="range" min="0" max="100" step="1" :aria-valuetext="`${percent} %`" />
      </label>
      <div class="koerper-baukasten-buttons">
        <button type="button" @click="turn(-15, 0)">{{ left }}</button>
        <button type="button" @click="turn(15, 0)">{{ right }}</button>
        <button type="button" @click="turn(0, 10)">{{ up }}</button>
        <button type="button" @click="turn(0, -10)">{{ down }}</button>
        <button type="button" @click="back">{{ reset }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.koerper-baukasten {
  margin: 0.5rem 0;
}

.koerper-baukasten svg {
  display: block;
  height: auto;
}

.koerper-baukasten-face {
  stroke: var(--page-text);
  stroke-width: 0.04;
  stroke-linejoin: round;
}

.koerper-baukasten-face-0 {
  fill: var(--page-surface);
}

.koerper-baukasten-face-1 {
  fill: var(--page-background);
}

.koerper-baukasten-number {
  fill: var(--page-text);
  font-size: 0.5px;
  font-weight: 700;
}

.koerper-baukasten-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.koerper-baukasten-slider {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.koerper-baukasten-slider input {
  width: 100%;
  min-height: 44px;
}

.koerper-baukasten-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.koerper-baukasten-buttons button {
  min-height: 44px;
  min-width: 44px;
  padding: 0 0.75rem;
}
</style>
