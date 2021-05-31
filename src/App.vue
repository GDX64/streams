<template>
  <worker-ex />
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
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DragBallVue from "./components/DragBall.vue";
import WorkerEx from "./workers/WorkerEx.vue";

export default defineComponent({
  name: "App",
  components: { WorkerEx, DragBallVue },
  data() {
    return {
      arrDragBalls: [] as number[],
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
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.nicolas-cage {
  width: 100%;
  height: 100%;
}
</style>
