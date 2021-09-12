import { Shape, SVG, Svg } from '@svgdotjs/svg.js';
import { from, fromEvent, merge, of } from 'rxjs';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
import { concatMap, map, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { reactive, watch, watchEffect, ref, Ref } from 'vue';
import { Point, ReactiveLine } from './BasicShapes';

interface ProtoPoint {
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
  private virtualPoint: Ref<Point | null>;
  private lines: ReactiveLine[] = [];
  constructor(private $canvas: Svg) {
    this.points = reactive([]);
    this.virtualPoint = ref(null) as Ref<Point | null>;
    watchEffect(() => this.draw([this.points, this.virtualPoint.value ?? []].flat()));
  }

  start() {
    observeClickAndMove(this.$canvas.node).subscribe({
      next: (event) => {
        const protoPoint = { x: event.offsetX, y: event.offsetY };
        event.type === 'click'
          ? this.pushPoint(protoPoint)
          : this.updatePoint(protoPoint);
      },
      complete: () => {
        this.virtualPoint.value?.erease();
        this.virtualPoint.value = null;
      },
    });
  }

  private pushPoint(protoPoint: ProtoPoint) {
    this.points.push(new Point(protoPoint, this.$canvas));
  }

  private updatePoint(protoPoint: ProtoPoint) {
    if (!this.virtualPoint.value) {
      this.virtualPoint.value = new Point(protoPoint, this.$canvas);
      return;
    }
    this.virtualPoint.value.update(protoPoint).draw();
  }

  draw(points: Point[]) {
    if (!points.length) return;
    this.erease();
    this.drawCircles(points);
    this.lines = this.drawLines(points);
  }

  private drawCircles(points: Point[]) {
    points.forEach((point) => point.draw());
  }

  private drawLines(points: Point[]) {
    return points.slice(1).reduce(
      ({ lines, lastPoint }, point) => {
        const line = new ReactiveLine(lastPoint, point, this.$canvas);
        return { lines: [...lines, line], lastPoint: point };
      },
      { lines: [] as ReactiveLine[], lastPoint: this.points[0] }
    ).lines;
  }

  erease() {
    this.lines.flat().forEach((line) => line.destroy());
  }
}
