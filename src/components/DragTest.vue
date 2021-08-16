<template>
  <drag-ball-vue
    v-for="dragBall of arrDragBalls"
    :key="dragBall"
    :id="dragBall"
    @close-me="closeDragBall"
  >
    <drag-plot-vue />
  </drag-ball-vue>
  <!-- <button class="add-drag-ball" @click="addDragBall">
    add dragball
  </button> -->
  <drag-ball-vue>
    <div class="table-container">
      <drag-table-vue :tableData="tableData" />
    </div>
  </drag-ball-vue>
  <!-- <drag-ball-vue>
    <p-i-d-test-vue />
  </drag-ball-vue> -->
</template>

<script lang="ts">
import { from, interval } from 'rxjs';
import { concatMap, map, mergeWith } from 'rxjs/operators';
import { defineComponent } from 'vue';
import DragBallVue from './DragBall.vue';
import DragPlotVue from './DragPlot.vue';
import DragTableVue, { Row } from './Table/DragTable.vue';
import * as R from 'ramda';

function dataMoker(nCols: number) {
  const generateArray = (size: number) =>
    R.range(0, size).map(() => [...Array(nCols)].map(Math.random));
  return interval(30).pipe(
    mergeWith(from(generateArray(1_000))),
    concatMap(() => from(generateArray(3)))
  );
}

function updater(getSize: () => [number, number]) {
  return interval(1000).pipe(map(() => [chooseFrom(0, getSize()[0]), chooseFrom(0, getSize()[1])]));
}

const chooseFrom = (init: number, finish: number) => Math.round(Math.random() * (finish - init));

export default defineComponent({
  name: 'App',
  components: { DragBallVue, DragTableVue, DragPlotVue },
  data() {
    return {
      arrDragBalls: [] as number[],
      tableData: {
        colsConfig: R.range(0, 5).map((index) => {
          return {
            header: `p${index + 1}`,
            propName: `p${index + 1}`,
            compClass: (value: number) => (value > 0 ? 'red' : 'green'),
          };
        }),
        rows: [{ key: 1 }],
      },
    };
  },
  methods: {
    addDragBall() {
      this.arrDragBalls.push(Math.random());
    },
    closeDragBall(id: number) {
      this.arrDragBalls = this.arrDragBalls.filter((value) => value !== id);
    },
  },
  mounted() {
    dataMoker(5)
      .pipe(map((arr) => arr.map((n) => (n - 0.5).toFixed(4))))
      .subscribe(([p1, p2, p3, p4, p5]) => {
        const rows = this.tableData.rows;
        const rowIndex = chooseFrom(0, Math.min(15, rows.length));
        rows[rowIndex] = { key: rowIndex, p1, p2, p3, p4, p5 } as Row;
      });
    updater(() => [this.tableData.rows.length - 1, this.tableData.colsConfig.length - 1]).subscribe(
      ([rowIndex, colIndex]) => {
        const row = this.tableData.rows[rowIndex] as any;
        row[`p${colIndex + 1}`] = (Math.random() - 0.5).toFixed(4);
      }
    );
  },
});
</script>

<style lang="scss">
.nicolas-cage {
  width: 100%;
  height: 100%;
}
.table-container {
  max-height: 100%;
  overflow: auto;
}
</style>
