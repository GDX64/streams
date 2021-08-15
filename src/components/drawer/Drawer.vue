<template>
  <div class="canvas-container" ref="canvas" @contextmenu.prevent>
    <div class="tools-bar">
      <input type="color" v-model="lineConfig.color" />
      <button class="draw-tool" @click="startFreeDraw">Free</button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import { Subscription } from "rxjs";
import {
  makeDrawOnCanvas,
  makeCanvasObservable,
  ObjDrawer,
} from "./freeDrawing";

export default defineComponent({
  setup() {
    const canvas = ref<HTMLElement | null>(null);
    const subscription = ref<Subscription | null>(null);
    const objDrawer = computed<ObjDrawer>(() => {
      if (!canvas.value) throw Error("Canvas not present");
      return makeDrawOnCanvas(canvas.value);
    });
    const lineConfig = reactive({ color: "#ff0000" });
    lineConfig.color;
    return { canvas, lineConfig, subscription, objDrawer };
  },

  methods: {
    startFreeDraw() {
      this.subscription?.unsubscribe();
      if (!this.canvas) throw Error("Canvas not present");
      this.subscription = makeCanvasObservable(
        this.objDrawer,
        this.lineConfig
      ).subscribe(console.log);
    },
  },
});
</script>

<style lang="scss">
.canvas-container {
  background-color: blanchedalmond;
  height: 600px;
  width: 600px;
  display: flex;
  flex-flow: column;
}
.canvas-svg {
  flex-grow: 1;
}
.tools-bar {
  display: flex;
  justify-content: center;
}
.draw-tool {
  height: 27px;
  background-color: burlywood;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
  border: 1px solid rgb(131, 97, 2);
  color: rgb(51, 50, 50);
  transition: 0.2s all;
  &:active {
    background-color: white;
  }
}
</style>
