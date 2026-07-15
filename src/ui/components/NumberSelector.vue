<template>
  <div class="number-selector">
    <button class="selector-btn left-btn" @click="decrement">-</button>
    <span class="selector-value">{{ modelValue }}{{ suffix }}</span>
    <button class="selector-btn right-btn" @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
  (e: "change"): void;
}>();

function decrement(): void {
  let newValue = props.modelValue - (props.step ?? 1);
  if (props.min !== undefined && newValue < props.min) {
    newValue = props.min;
  }
  emit("update:modelValue", newValue);
  emit("change");
}

function increment(): void {
  let newValue = props.modelValue + (props.step ?? 1);
  if (props.max !== undefined && newValue > props.max) {
    newValue = props.max;
  }
  emit("update:modelValue", newValue);
  emit("change");
}
</script>

<style scoped>
.number-selector {
  display: inline-block;
  align-items: center;
  vertical-align: middle;
  height: 34px;
  box-sizing: border-box;
  border: solid 1px #aaa;
  margin-left: -1px;
}

.selector-btn,
.selector-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  box-sizing: border-box;
  background: #ddd;
  border: solid 1px #ccc;
  font-size: 0.8em;
  padding: 0 12px;
  margin: 0;
  line-height: 1;
}

.selector-btn {
  cursor: pointer;
  user-select: none;
}

.selector-btn:hover {
  background: #ccc;
}

.left-btn {
  border-right: none;
}

.right-btn {
  border-left: none;
}

.selector-value {
  background: #ddd;
  cursor: default;
  min-width: 60px;
  white-space: nowrap;
}
</style>
