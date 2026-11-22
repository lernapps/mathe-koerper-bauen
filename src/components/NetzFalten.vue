<script setup lang="ts">
// A net of six squares that the learner folds in the mind, for the task of the number seed. Its logic is in
// NetzFalten.ts. It is the input of the task: it emits 1 or 0 (does the net fold to a cube?) or the number of a square
// (which square lies opposite?) with answer, and the explainer draws "Prüfen", checks, gives the feedback, the task
// number and "Neue Aufgabe". Every control is a radio button: Tab and the arrow keys work, each is 44 px high.
import { computed, ref } from "vue";
import { fill, generate, netText } from "./NetzFalten.ts";
import { normalise, size, sorted } from "./Koerper.ts";

const props = defineProps<{
  /** "faltbar": does it fold to a cube? "gegenueber": which square lies opposite square {k}? */
  mode: "faltbar" | "gegenueber";
  /** The question, with {k} for the asked square. */
  task: string;
  /** The words before the net in words for a screen reader. */
  alt: string;
  /** The answers of the mode faltbar. */
  yes: string;
  no: string;
  /** The name of a square, with {n} for its number. */
  face: string;
  /** The name of the group of answers. */
  group: string;
  /** The app's message for each typical mistake, in the order of about.mistakes. */
  mistakes: string[];
  /** The task number, which the explainer gives. */
  seed: number;
  /** Whether the explainer checked the answer now. */
  checked: boolean;
}>();
const emit = defineEmits<{ answer: [number] }>();

const current = computed(() => generate(props.seed, props));
const cells = computed(() => sorted(normalise(current.value.net)));
const box = computed(() => size(current.value.net));
const cell = 44;
const chosen = ref<number | undefined>(undefined);
const options = computed(() =>
  props.mode === "faltbar"
    ? [
        { value: 1, text: props.yes },
        { value: 0, text: props.no },
      ]
    : [1, 2, 3, 4, 5, 6]
        .filter((n) => n !== current.value.asked)
        .map((n) => ({ value: n, text: fill(props.face, current.value, n).replace("{n}", String(n)) })),
);

function choose(value: number): void {
  chosen.value = value;
  emit("answer", value);
}
</script>

<template>
  <div class="netz-falten">
    <p>{{ fill(task, current) }}</p>
    <svg
      class="netz-falten-net"
      role="img"
      :aria-label="`${alt} ${netText(current)}`"
      :viewBox="`0 0 ${box.columns * cell + 4} ${box.rows * cell + 4}`"
      :width="box.columns * cell + 4"
    >
      <g v-for="(c, i) in cells" :key="i">
        <rect
          :x="c[0] * cell + 2"
          :y="c[1] * cell + 2"
          :width="cell"
          :height="cell"
          :class="{ 'netz-falten-asked': mode === 'gegenueber' && i + 1 === current.asked }"
        />
        <text :x="c[0] * cell + 2 + cell / 2" :y="c[1] * cell + 2 + cell / 2 + 6" text-anchor="middle">
          {{ i + 1 }}
        </text>
      </g>
    </svg>
    <fieldset class="netz-falten-group">
      <legend>{{ group }}</legend>
      <label v-for="o in options" :key="o.value" :class="{ 'netz-falten-on': chosen === o.value }">
        <input
          type="radio"
          name="netz-falten"
          :value="o.value"
          :checked="chosen === o.value"
          @change="choose(o.value)"
        />
        <span>{{ o.text }}</span>
      </label>
    </fieldset>
  </div>
</template>

<style scoped>
.netz-falten-net {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0.5rem 0;
}

.netz-falten-net rect {
  fill: var(--page-surface);
  stroke: var(--page-text);
  stroke-width: 2;
}

.netz-falten-net rect.netz-falten-asked {
  fill: var(--page-accent);
}

.netz-falten-net text {
  fill: var(--page-text);
  font-size: 1.1rem;
  font-weight: 600;
}

.netz-falten-net rect.netz-falten-asked + text {
  fill: var(--page-on-accent);
}

.netz-falten-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  border: none;
  margin: 0;
  padding: 0;
}

.netz-falten-group legend {
  margin-bottom: 0.5rem;
  padding: 0;
}

.netz-falten-group label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.75rem;
  border: 2px solid var(--page-border);
  border-radius: 0.5rem;
  background: var(--page-surface);
  cursor: pointer;
}

.netz-falten-group label.netz-falten-on {
  border-color: var(--page-accent);
}

.netz-falten-group input {
  width: 1.25rem;
  height: 1.25rem;
}
</style>
