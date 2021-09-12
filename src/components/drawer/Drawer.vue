<template>
  <div class="canvas-container" ref="canvas" @contextmenu.prevent>
    <div class="tools-bar">
      <input type="color" v-model="lineConfig.color" />
      <div class="labeled-container">
        <label>width</label>
        <input type="range" step="1" min="1" max="5" v-model="lineConfig.width" />
      </div>
      <div class="labeled-container">
        <label>fill</label>
        <input type="checkbox" v-model="lineConfig.fill" />
      </div>
      <button
        :class="{ 'selected-tool': selectedTool === ToolsEnum.FREE_DRAW }"
        class="draw-tool"
        @click="startFreeDraw"
      >
        Free
      </button>
      <button
        :class="{ 'selected-tool': selectedTool === ToolsEnum.SQUARE }"
        class="draw-tool"
        @click="startSquareDraw"
      >
        Square
      </button>
      <button
        :class="{ 'selected-tool': selectedTool === ToolsEnum.NONE }"
        class="draw-tool"
        @click="noneSelected"
      >
        None
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue';
import { Subscription } from 'rxjs';
import { makeDrawOnCanvas, makeFreeDrawingObservable, ObjDrawer, selected } from './freeDrawing';
import { Shape } from '@svgdotjs/svg.js';
import { DrawActions, ToolsEnum } from './Enums';
import SquareDraw from './SquareDraw';
const { DELETE, DESELECT, SELECT } = DrawActions;

export default defineComponent({
  setup() {
    const canvas = ref<HTMLElement | null>(null);
    const subscription = ref<Subscription | null>(null);
    const objDrawer = computed<ObjDrawer>(() => {
      if (!canvas.value) throw Error('Canvas not present');
      return makeDrawOnCanvas(canvas.value);
    });
    const lineConfig = reactive({ color: '#ff0000', width: 2, fill: false });
    const drawSet = new Set<Shape>();
    const selectedTool = ref(ToolsEnum.NONE);
    lineConfig.color;
    return { canvas, lineConfig, subscription, objDrawer, drawSet, selectedTool, ToolsEnum };
  },

  methods: {
    startFreeDraw() {
      this.subscription?.unsubscribe();
      this.selectedTool = ToolsEnum.FREE_DRAW;
      this.subscription = makeFreeDrawingObservable(this.objDrawer, this.lineConfig).subscribe(
        this.addToDrawSet
      );
    },
    startSquareDraw() {
      console.log('starting saquare');
      this.selectedTool = ToolsEnum.SQUARE;
      new SquareDraw(this.objDrawer.draw).start();
    },
    noneSelected() {
      this.selectedTool = ToolsEnum.NONE;
      this.subscription?.unsubscribe();
    },
    addToDrawSet(draw: Shape | null) {
      if (!draw) return;
      draw.addClass('canvas-draw');
      selected(draw.node).subscribe((event) => {
        event === DELETE && draw.remove();
        event === SELECT && draw.addClass('canvas-draw__selected');
        event === DESELECT && draw.removeClass('canvas-draw__selected');
      });
      this.drawSet.add(draw);
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
.canvas-draw {
  transition: stroke, fill, 0.2s;
  &__selected,
  &:hover {
    stroke: white;
  }
}
.selected-tool {
  border-color: violet !important;
  filter: brightness(1.1);
}
.tools-bar {
  display: flex;
  justify-content: center;
  align-items: center;
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
.labeled-container {
  display: flex;
  flex-flow: column;
}
</style>
