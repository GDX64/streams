<template>
  <h3 class="">arr > {{ arrValues }}</h3>
  <h3 class="">sum {{ value }}</h3>
  <h3 class="">Head {{ head }}</h3>
  <h3 class="">tail {{ tail }}</h3>
  <h3 class="">max {{ max }}</h3>
  <h1 class="">Obj</h1>
  <textarea v-model="mapValues.text" />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import * as R from 'ramda';

const log = <F extends (...args: any[]) => any>(fnDo: F, log: string) => {
  return (...args: Parameters<F>): ReturnType<F> => {
    console.log(log);
    return fnDo(...args);
  };
};

const mapValues = ref({ text: 'hi' });
const arrValues = computed(() => mapValues.value.text.split(' ').map((str) => str.length));
const value = computed(log(() => arrValues.value.reduce((a, b) => a + b), 'sum'));

(window as any).arrValues = arrValues;
(window as any).value = value;
(window as any).mapValues = mapValues;
// setTimeout(() => (value.value = 20), 1000);

export default defineComponent({
  setup() {
    const max = computed(log(() => arrValues.value.reduce((a, b) => Math.max(a, b)), 'max'));
    const head = computed(log(() => R.head(arrValues.value), 'head'));
    const tail = computed(log(() => arrValues.value.slice(-1)[0], 'tail'));
    return { value, arrValues, max, head, tail, mapValues };
  },
});
</script>

<style></style>
