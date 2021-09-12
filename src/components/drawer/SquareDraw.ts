import { Shape, SVG, Svg } from '@svgdotjs/svg.js';
import { from, fromEvent, merge, of } from 'rxjs';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
import { concatMap, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { reactive, watch, watchEffect, ref, Ref } from 'vue';

interface Point {
  x: number;
  y: number;
}

function mouseMoveAndClick($el: HasEventTargetAddRemove<MouseEvent>) {
  return merge(
    fromEvent<MouseEvent>($el, 'click').pipe(
      map(({ offsetX, offsetY }) => ({ offsetX, offsetY, type: 'click' }))
    ),
    fromEvent<MouseEvent>($el, 'mousemove').pipe(
      map(({ offsetX, offsetY }) => ({ offsetX, offsetY, type: 'move' }))
    )
  );
}

function observeClickAndMove($el: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent<MouseEvent>($el, 'click').pipe(
    concatMap(({ offsetX, offsetY }) =>
      merge(of({ offsetX, offsetY, type: 'click' }), mouseMoveAndClick($el))
    ),
    takeUntil(fromEvent(document, 'contextmenu'))
  );
}

export default class SquareDraw {
  private points: Point[];
  private virtualPoint: Ref<Point>;
  private circles: Shape[] = [];
  private lines: Shape[] = [];
  constructor(private $canvas: Svg) {
    this.points = reactive([] as Point[]);
    this.virtualPoint = ref({ x: 0, y: 0 });
    watchEffect(() => this.draw([...this.points, this.virtualPoint.value]));
  }
  start() {
    observeClickAndMove(this.$canvas.node).subscribe((event) => {
      const point = { x: event.offsetX, y: event.offsetY };
      event.type === 'click' ? this.pushPoint(point) : this.updatePoint(point);
    });
  }

  private pushPoint(point: Point) {
    this.points.push(point);
  }

  private updatePoint(point: Point) {
    this.virtualPoint.value = point;
  }

  draw(points: Point[]) {
    if (!points.length) return;
    this.erease();
    this.circles = this.drawCircles(points);
    this.lines = this.drawLines(points);
  }

  private drawCircles(points: Point[]) {
    return points.map((point) => this.$canvas.circle(5).center(point.x, point.y));
  }

  private drawLines(points: Point[]) {
    return points.slice(1).reduce(
      ({ lines, lastPoint }, point) => {
        const line = this.$canvas.line(lastPoint.x, lastPoint.y, point.x, point.y).stroke('black');
        lines.push(line);
        return { lines, lastPoint: point };
      },
      { lines: [] as Shape[], lastPoint: this.points[0] }
    ).lines;
  }

  erease() {
    [this.circles, this.lines].flat().forEach((shape) => shape.remove());
  }
}
