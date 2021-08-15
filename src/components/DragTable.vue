<template>
  <table class="drag-table">
    <thead>
      <tr>
        <th v-for="header of tableData.headers" :key="header">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row of tableData.body" :key="row">
        <td v-for="field of row" :key="field" :class="txtColor(field)">
          {{ field }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export interface TableData<T extends number | string> {
  headers: string[];
  body: T[][];
}

export default defineComponent({
  props: {
    tableData: { type: Object as PropType<TableData<number | string>> },
  },
  methods: {
    txtColor(txt: number | string) {
      return Number(txt) > 0.5 ? 'cell--green' : 'cell--red';
    },
  },
});
</script>

<style lang="scss">
.drag-table {
  width: 100%;
}

.cell {
  &--green {
    color: green;
  }
  &--red {
    color: red;
  }
}
</style>
