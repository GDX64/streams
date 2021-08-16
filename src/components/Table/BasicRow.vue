<template>
  <td
    v-for="colConfig of colsConfig"
    :key="colConfig.propName"
    :class="colConfig?.compClass?.(dataRow[colConfig.propName])"
  >
    {{ dataRow[colConfig.propName] }}
  </td>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import type { ColConfig } from './DragTable.vue';

export interface TableData<T extends { [key: string]: any }> {
  colsConfig: ColConfig[];
  rows: T[];
}

export default defineComponent({
  props: {
    colsConfig: { type: Object as PropType<ColConfig[]> },
    dataRow: { type: Object as PropType<{[key: string]: number}> },
  },
});
</script>

<style lang="scss">
.red {
  color: red;
  font-weight: bold;
  // animation: redFlag 0.2s;
}
.green {
  color: green;
  font-weight: bold;
  // animation: greenFlag 0.2s;
}

@keyframes redFlag {
  0% {
    background-color: red;
    color: white;
  }
  100% {
    background-color: transparent;
    color: red;
  }
}

@keyframes greenFlag {
  0% {
    background-color: green;
    color: white;
  }
  100% {
    background-color: transparent;
    color: green;
  }
}
</style>
