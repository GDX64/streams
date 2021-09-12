import { Shape, SVG, Svg } from '@svgdotjs/svg.js';
import { from, fromEvent, merge, of } from 'rxjs';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
import { concatMap, map, mergeMap, takeUntil, tap } from 'rxjs/operators';

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
  private points: Point[] = [];
  private virtualPoint: Point = { x: 0, y: 0 };
  private circles: Shape[] = [];
  private lines: Shape[] = [];
  constructor(private $canvas: Svg) {}
  start() {
    observeClickAndMove(this.$canvas.node).subscribe((event) => {
      const point = { x: event.offsetX, y: event.offsetY };
      event.type === 'click' ? this.pushPoint(point) : this.updatePoint(point);
    });
  }

  private pushPoint(point: Point) {
    this.points.push(point);
    if (this.points.length === 1) this.draw();
  }

  private updatePoint(point: Point) {
    this.virtualPoint = point;
    this.draw();
  }

  draw() {
    if (!this.points.length) return;
    this.erease();
    this.circles = this.drawCircles([...this.points, this.virtualPoint]);
    this.lines = this.drawLines([...this.points, this.virtualPoint]);
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
