<template>
  <drag-ball-vue
    v-for="dragBall of arrDragBalls"
    :key="dragBall"
    :id="dragBall"
    @close-me="closeDragBall"
  >
    <img
      src="https://poltronanerd.com.br/wp-content/uploads/2019/11/poltrona-con-air-cage-1140x570.jpg"
      alt=""
      class="nicolas-cage"
      draggable="false"
    />
  </drag-ball-vue>
  <button class="add-drag-ball" @click="addDragBall">
    add dragball
  </button>
  <drag-ball-vue>
    <div class="table-container">
      <drag-table-vue :tableData="tableData" />
    </div>
  </drag-ball-vue>
</template>

<script lang="ts">
import { from, interval, Observable } from "rxjs";
import {
  bufferCount,
  bufferTime,
  filter,
  map,
  switchMap,
} from "rxjs/operators";
import { defineComponent } from "vue";
import DragBallVue from "./DragBall.vue";
import DragTableVue, { TableData } from "./DragTable.vue";

function dataMoker(nCols: number) {
  return interval(1).pipe(map(() => [...Array(nCols)].map(Math.random)));
}

const chooseFrom = (init: number, finish: number) =>
  Math.round(Math.random() * (finish - init));

export default defineComponent({
  name: "App",
  components: { DragBallVue, DragTableVue },
  data() {
    return {
      arrDragBalls: [] as number[],
      tableData: {
        headers: ["hello", "there", "the", "angel", "from"],
        body: [
          [1, 2],
          [3, 4],
        ],
      } as TableData<number | string>,
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
      .pipe(
        filter((arr) => arr[0] > 0.5),
        map((arr) => arr.map((n) => n.toFixed(4))),
        bufferTime(200),
        switchMap((arrArrValues) => from(arrArrValues))
      )
      .subscribe((arrValues) => {
        const body = this.tableData.body;
        body[chooseFrom(0, body.length + 1)] = arrValues;
        this.tableData = { ...this.tableData, body };
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
