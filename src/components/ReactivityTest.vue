<template>
  <h1 class="">Hello {{ value }}</h1>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';

const arrValues = ref([1, 2, 3, 4]);
const value = computed(() => (console.log('I ran'), arrValues.value.reduce((a, b) => a + b)));

(window as any).arrValues = arrValues;
(window as any).value = value;
// setTimeout(() => (value.value = 20), 1000);

export default defineComponent({
  setup() {
    return { value };
  },
});
</script>

<style></style>
