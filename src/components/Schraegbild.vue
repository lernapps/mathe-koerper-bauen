<script setup lang="ts">
// A body in the oblique drawing on squared paper, for the task of the number seed. Its logic is in Schraegbild.ts.
// The learner sets with two counters (buttons and fields) how many squares the back, the top or the tip lies to the
// right of and above the front, and the body is drawn from it, so that they see what their numbers make. It emits the
// pair with answer; the explainer draws "Prüfen", checks, gives the feedback, the task number and "Neue Aufgabe".
import { computed, ref } from "vue";
import { drawing, fill, generate } from "./Schraegbild.ts";

const props = defineProps<{
  /** The body: quader, prisma, zylinder, pyramide or kegel. */
  body: "quader" | "prisma" | "zylinder" | "pyramide" | "kegel";
  /** The task, with {w}, {h}, {d} (cm) and {W}, {H} (squares). */
  task: string;
  /** The text for a screen reader before the description of the drawing. */
  alt: string;
  /** The names of the two counters. */
  right: string;
  up: string;
  /** The word for the buttons: "mehr", "weniger". */
  more: string;
  less: string;
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [{ right: number; up: number }] }>();

const current = computed(() => generate(props.seed, props));
const dx = ref(0);
const dy = ref(0);
const cell = 20;
const picture = computed(() => drawing(current.value, { right: dx.value, up: dy.value }));
const px = (x: number) => x * cell;
const py = (y: number) => (picture.value.height - y) * cell;

function set(which: "right" | "up", value: number): void {
  const v = Math.max(0, Math.min(30, Math.round(Number.isFinite(value) ? value : 0)));
  if (which === "right") dx.value = v;
  else dy.value = v;
  emit("answer", { right: dx.value, up: dy.value });
}
const counters = computed(() => [
  { key: "right" as const, label: props.right, value: dx.value },
  { key: "up" as const, label: props.up, value: dy.value },
]);
const description = computed(
  () => `${props.alt} ${dx.value} Kästchen nach rechts und ${dy.value} Kästchen nach oben eingestellt.`,
);
</script>

<template>
  <div class="schraegbild">
    <p>{{ fill(task, current) }}</p>
    <svg
      class="schraegbild-paper"
      role="img"
      :aria-label="description"
      :viewBox="`0 0 ${px(picture.width)} ${px(picture.height)}`"
      :width="px(picture.width)"
    >
      <g class="schraegbild-grid">
        <line
          v-for="x in picture.width + 1"
          :key="`x${x}`"
          :x1="px(x - 1)"
          :y1="0"
          :x2="px(x - 1)"
          :y2="px(picture.height)"
        />
        <line
          v-for="y in picture.height + 1"
          :key="`y${y}`"
          :x1="0"
          :y1="px(y - 1)"
          :x2="px(picture.width)"
          :y2="px(y - 1)"
        />
      </g>
      <template v-for="(e, i) in picture.ellipses" :key="`e${i}`">
        <path
          :d="`M${px(e.cx - e.rx)},${py(e.cy)} A${px(e.rx)},${px(e.ry)} 0 0 0 ${px(e.cx + e.rx)},${py(e.cy)}`"
          class="schraegbild-edge"
        />
        <path
          :d="`M${px(e.cx - e.rx)},${py(e.cy)} A${px(e.rx)},${px(e.ry)} 0 0 1 ${px(e.cx + e.rx)},${py(e.cy)}`"
          :class="['schraegbild-edge', { 'schraegbild-hidden': e.dashedBack }]"
        />
      </template>
      <line
        v-for="(l, i) in picture.lines"
        :key="`l${i}`"
        :x1="px(l.x1)"
        :y1="py(l.y1)"
        :x2="px(l.x2)"
        :y2="py(l.y2)"
        :class="['schraegbild-edge', { 'schraegbild-hidden': l.hidden }]"
      />
    </svg>
    <div class="schraegbild-counters">
      <div v-for="c in counters" :key="c.key" class="schraegbild-counter">
        <span>{{ c.label }}</span>
        <button
          type="button"
          class="schraegbild-button"
          :aria-label="`${c.label}: ${less}`"
          :disabled="c.value <= 0"
          @click="set(c.key, c.value - 1)"
        >
          −
        </button>
        <input
          type="number"
          min="0"
          max="30"
          :aria-label="c.label"
          :value="c.value"
          @change="set(c.key, Number(($event.target as HTMLInputElement).value))"
        />
        <button
          type="button"
          class="schraegbild-button"
          :aria-label="`${c.label}: ${more}`"
          :disabled="c.value >= 30"
          @click="set(c.key, c.value + 1)"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schraegbild-paper {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.5rem 0;
  background: var(--page-surface);
}

.schraegbild-grid line {
  stroke: var(--page-border);
  stroke-width: 1;
}

.schraegbild-edge {
  fill: none;
  stroke: var(--page-text);
  stroke-width: 2.5;
  stroke-linecap: round;
}

.schraegbild-hidden {
  stroke-dasharray: 6 5;
  stroke-width: 2;
}

.schraegbild-counters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.schraegbild-counter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.schraegbild-button {
  font: inherit;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0.375rem 0.875rem;
  border: 2px solid var(--page-accent);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-accent);
  cursor: pointer;
}

.schraegbild-button:disabled {
  cursor: default;
  opacity: 0.5;
}

.schraegbild-button:focus-visible {
  outline: 3px solid var(--page-text);
  outline-offset: 2px;
}

.schraegbild-counter input {
  font: inherit;
  border: 2px solid var(--page-border);
  border-radius: 0.375rem;
  background: var(--page-background);
  color: var(--page-text);
  width: 4rem;
  min-height: 44px;
  text-align: center;
}
</style>
