<template>
  <div class="ball" draggable="false" @keydown="keyDown" tabindex="-1">
    <slot></slot>
    <div class="resize-square" ref="resize"></div>
    <div class="close-dragball" @click="$emit('close-me', id)">x</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { from, fromEvent, fromEventPattern } from "rxjs";
import {
  takeUntil,
  switchMap,
  tap,
  map,
  scan,
  filter,
  reduce,
} from "rxjs/operators";

type TopLeft = { top: number; left: number };

const mDragBalls = new Set<HTMLElement>();

function withStoppedEvent($el: HTMLElement, strEvent: string) {
  return fromEventPattern((handler) => {
    $el.addEventListener(strEvent, (event) => {
      event.stopPropagation();
      handler(event);
    });
  });
}

function dragObservable($el: HTMLElement) {
  return withStoppedEvent($el, "mousedown").pipe(
    tap(() => $el.classList.add("no-select")),
    switchMap(() =>
      fromEvent<MouseEvent>(document, "mousemove").pipe(
        takeUntil(
          fromEvent(document, "mouseup").pipe(
            tap(() => $el.classList.remove("no-select"))
          )
        )
      )
    )
  );
}

function accPos($el: HTMLElement) {
  return scan(
    ({ top, left }: TopLeft, { movementX = 0, movementY = 0 }: MouseEvent) => {
      return { top: top + movementY, left: left + movementX };
    },
    {
      top: $el.offsetTop,
      left: $el.offsetLeft,
    }
  );
}

function snap(value: number, reference: number, tolerance = 10) {
  return Math.abs(value - reference) < tolerance ? reference : null;
}

const maybeOp = <T, K>(value: T | null, fn: (x: T) => K) =>
  value == null ? null : fn(value);

function getSnappedPos({ top, left }: TopLeft, $element: HTMLElement) {
  return from(mDragBalls).pipe(
    filter(($referenceEl) => $referenceEl !== $element),
    map(($referenceEl) => {
      const { width, height } = $element.getBoundingClientRect();
      const {
        right: nRefRight,
        left: nRefLeft,
        top: nRefTop,
        bottom: nRefBottom,
      } = $referenceEl.getBoundingClientRect();

      const [bottom, right] = [top + height, left + width];
      return {
        left:
          snap(left, nRefLeft) ??
          snap(left, nRefRight) ??
          maybeOp(snap(right, nRefRight), (x) => x - width) ??
          maybeOp(snap(right, nRefLeft), (x) => x - width),
        top:
          snap(top, nRefTop) ??
          snap(top, nRefBottom) ??
          maybeOp(snap(bottom, nRefTop), (x) => x - height) ??
          maybeOp(snap(bottom, nRefBottom), (x) => x - height),
      };
    }),
    reduce(
      (acc, value) => ({
        top: value.top ?? acc.top,
        left: value.left ?? acc.left,
      }),
      { top, left }
    )
  );
}

function updatePos($el: HTMLElement) {
  return ({ left = 0, top = 0 }) => {
    $el.style.top = `${top}px`;
    $el.style.left = `${left}px`;
  };
}

function makeResizable($el: HTMLElement) {
  return ({ movementX = 0, movementY = 0 }) => {
    const { clientHeight, clientWidth } = $el;
    $el.style.height = clientHeight + movementY + "px";
    $el.style.width = clientWidth + movementX + "px";
  };
}

export default defineComponent({
  props: { id: { type: Number } },
  data() {
    return {};
  },
  methods: {
    keyDown(event: KeyboardEvent) {
      event.key === "Delete" && this.$emit("close-me", this.id);
    },
  },
  mounted() {
    mDragBalls.add(this.$el);
    dragObservable(this.$el)
      .pipe(
        accPos(this.$el),
        switchMap((objPos) => getSnappedPos(objPos, this.$el))
      )
      .subscribe(updatePos(this.$el));
    dragObservable(this.$refs.resize as HTMLElement).subscribe(
      makeResizable(this.$el)
    );
  },
  beforeUnmount() {
    mDragBalls.delete(this.$el);
  },
});
</script>

<style lang="scss">
.ball {
  background-color: rgba(252, 178, 178, 0.349);
  min-height: 100px;
  min-width: 100px;
  height: 200px;
  width: 200px;
  position: absolute;
  overflow: hidden;
  &:focus-within,
  &:focus,
  &:active {
    border: hotpink solid 1px;
  }
  border: rgb(117, 117, 117) solid 1px;
  border-radius: 5px;
}
.resize-square {
  background-color: royalblue;
  width: 5px;
  height: 5px;
  position: absolute;
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

.close-dragball {
  background-color: rgba(253, 21, 21, 0.562);
  top: 0;
  right: 0;
  position: absolute;
  cursor: pointer;
  height: 16px;
  width: 16px;
  color: rgb(207, 203, 203);
  border-radius: 3px;
  font-family: sans-serif;
}

.no-select {
  user-select: none;
}
</style>
