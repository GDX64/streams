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
import { bufferTime, concatMap, map, switchMap } from 'rxjs/operators';
import { defineComponent } from 'vue';
import DragBallVue from './DragBall.vue';
import DragPlotVue from './DragPlot.vue';
import DragTableVue, { TableData } from './DragTable.vue';
import * as R from 'ramda';

function dataMoker(nCols: number) {
  return interval(100).pipe(
    concatMap(() => from(R.range(0, 10).map(() => [...Array(nCols)].map(Math.random))))
  );
}

const chooseFrom = (init: number, finish: number) => Math.round(Math.random() * (finish - init));

export default defineComponent({
  name: 'App',
  components: { DragBallVue, DragTableVue, DragPlotVue },
  data() {
    return {
      arrDragBalls: [] as number[],
      tableData: {
        headers: ['hello', 'there', 'the', 'angel', 'from'],
        body: [[]],
      } as TableData<string>,
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
    dataMoker(30)
      .pipe(
        map((arr) => arr.map((n) => n.toFixed(4))),
        bufferTime(500),
        switchMap((arrArrValues) => from(arrArrValues))
      )
      .subscribe((arrValues) => {
        const body = this.tableData.body;
        body[chooseFrom(0, Math.min(50, body.length + 1))] = arrValues;
      });
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
