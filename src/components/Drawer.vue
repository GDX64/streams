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
import { fromEvent, merge, Subscription } from "rxjs";
import {
  concatMap,
  filter,
  map,
  mapTo,
  repeat,
  scan,
  switchMap,
  take,
  tap,
} from "rxjs/operators";
import { Polyline, SVG } from "@svgdotjs/svg.js";
import { HasEventTargetAddRemove } from "rxjs/internal/observable/fromEvent";

function makeDrawOnCanvas(canvas: HTMLElement) {
  const draw = SVG()
    .addTo(canvas)
    .addClass("canvas-svg");
  return {
    getLine({ color }: LineConfig) {
      return draw
        .polyline()
        .fill("#00000000")
        .stroke({ color });
    },
    draw,
  };
}

type PairNum = [number, number];
type PairNumArr = PairNum[];
type ObjDrawer = ReturnType<typeof makeDrawOnCanvas>;
interface LineConfig {
  color: string;
}

function mouseObservable(canvas: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent<MouseEvent>(canvas, "mousedown").pipe(
    filter((event) => event.button === 0),
    concatMap(() => fromEvent<MouseEvent>(canvas, "mousemove")),
    map(({ offsetX, offsetY }) => [offsetX, offsetY] as PairNum),
    scan((acc, pairXY) => [...acc, pairXY], [] as PairNumArr)
  );
}

function makeCanvasObservable(objDrawer: ObjDrawer, config: LineConfig) {
  const $canvas = objDrawer.draw.node;
  return mouseObservable($canvas).pipe(
    scan<PairNumArr, Polyline, null>((line, arrValues) => {
      const realLine = line ?? objDrawer.getLine(config);
      realLine.plot(arrValues);
      return realLine;
    }, null),
    switchMap((line) =>
      merge(
        fromEvent(document, "mouseup").pipe(mapTo(null)),
        fromEvent($canvas, "mousedown").pipe(mapTo(line))
      )
    ),
    take(1),
    tap((line) => line?.remove()),
    repeat()
  );
}

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
