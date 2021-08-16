<template>
  <table class="drag-table">
    <thead>
      <tr>
        <th v-for="colConfig of tableData.colsConfig" :key="colConfig.header">
          {{ colConfig.header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row of rows" :key="row.key ?? 1" class="basic-row">
        <basic-row-vue :dataRow="row" :colsConfig="tableData.colsConfig" />
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import BasicRowVue from './BasicRow.vue';

export interface ColConfig {
  header: string;
  propName: string;
  compClass?(x: number): string;
}

export interface Row {
  key: any;
}

export interface TableData {
  colsConfig: ColConfig[];
  rows: Row[];
}

export default defineComponent({
  components: { BasicRowVue },
  props: {
    tableData: { type: Object as PropType<TableData> },
  },
  computed: {
    rows(): Row[] {
      return this.tableData?.rows ?? [{ key: 1 }];
    },
  },
});
</script>

<style lang="scss">
.drag-table {
  width: 100%;
}
.basic-row {
  font-size: 10px;
  cursor: default;
  position: relative;
  &:hover {
    background-color: turquoise;
  }
}
</style>
