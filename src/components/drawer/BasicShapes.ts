import { Circle, G, Line, Svg } from '@svgdotjs/svg.js';
import { dragObservable } from '../Events/events';
import { ReactiveEffect, reactive, computed, ComputedRef } from 'vue';
import { LineConfig } from './freeDrawing';

const POINT_WIDTH_MULTIPLIER = 3;

export class Point {
  private circle: Circle;
  private refPoint: { x: number; y: number };
  private computedDraw: ComputedRef<Circle>;
  constructor({ x = 0, y = 0 }, private $canvas: G, private lineConfig: LineConfig) {
    this.refPoint = reactive({ x, y });
    this.circle = this.$canvas.circle(POINT_WIDTH_MULTIPLIER * this.lineConfig.width);
    dragObservable(this.circle.node).subscribe((event) => {
      this.x += event.movementX;
      this.y += event.movementY;
    });
    this.computedDraw = computed(() =>
      this.circle
        .center(this.x, this.y)
        .fill(this.lineConfig.color)
        .radius(POINT_WIDTH_MULTIPLIER * this.lineConfig.width)
    );
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

  addClass(className: string) {
    this.circle.addClass(className);
    return this;
  }
}

export class ReactiveLine {
  line: Line;
  constructor(
    private start: Point,
    private finish: Point,
    private $canvas: G,
    lineConfig: LineConfig
  ) {
    this.line = this.$canvas
      .line(this.start.x, this.start.y, this.finish.x, this.finish.y)
      .stroke({ color: lineConfig.color, width: lineConfig.width })
      .plot(this.start.x, this.start.y, this.finish.x, this.finish.y);
  }

  erease() {
    this.line.remove();
  }
}
