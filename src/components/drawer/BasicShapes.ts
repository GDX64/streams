import { Circle, Svg } from '@svgdotjs/svg.js';
import { dragObservable } from '../Events/events';
import { ReactiveEffect, reactive, computed, ComputedRef } from 'vue';
export class Point {
  private circle: Circle;
  private refPoint: { x: number; y: number };
  private computedDraw: ComputedRef<Circle>;
  constructor({ x = 0, y = 0 }, private $canvas: Svg) {
    this.refPoint = reactive({ x, y });
    this.circle = this.$canvas.circle(8);
    dragObservable(this.circle.node).subscribe((event) => {
      this.x += event.movementX;
      this.y += event.movementY;
    });
    this.computedDraw = computed(() => this.circle.center(this.x, this.y));
  }

  get x() {
    return this.refPoint.x;
  }
  set x(value: number) {
    this.refPoint.x = value;
  }

  get y() {
    return this.refPoint.y;
  }
  set y(value: number) {
    this.refPoint.y = value;
  }

  draw() {
    return this.computedDraw.value;
  }

  erease() {
    this.circle.remove();
    return this;
  }

  update({ x = 0, y = 0 }) {
    this.x = x;
    this.y = y;
    return this;
  }
}
