import { Container, G } from '@svgdotjs/svg.js';
import { Observable } from 'rxjs';
import { reactive, watchEffect, ref, Ref } from 'vue';
import { observeClickAndMove, StreamInputEvent } from '../Events/events';
import { Point, ReactiveLine } from './BasicShapes';
import { LineConfig } from './freeDrawing';
import './point.scss';

interface ProtoPoint {
  x: number;
  y: number;
}

export default class Multiline {
  private points: Point[];
  // private $group: G;
  private $circlesGroup: G;
  private $linesGroup: G;
  private virtualPoint: Ref<Point | null>;
  private lines: ReactiveLine[] = [];
  constructor($container: Container, private lineConfig: LineConfig) {
    this.$linesGroup = $container.group();
    this.$circlesGroup = $container.group();
    this.points = reactive([]);
    this.virtualPoint = ref(null) as Ref<Point | null>;
    watchEffect(() => this.draw([this.points, this.virtualPoint.value ?? []].flat()));
  }

  static async fromContainer($container: Container, lineConfig: LineConfig) {
    const sqDraw = new Multiline($container, lineConfig);
    await new Promise<void>((resolve) => {
      sqDraw.start(observeClickAndMove($container.node), resolve);
    });
    return sqDraw;
  }

  start(stream: Observable<StreamInputEvent>, onComplete?: () => void) {
    stream.subscribe({
      next: (event) => {
        const protoPoint = { x: event.offsetX, y: event.offsetY };
        event.type === 'click'
          ? this.pushPoint(protoPoint)
          : this.updatePoint(protoPoint);
      },
      complete: () => {
        this.virtualPoint.value?.erease();
        this.virtualPoint.value = null;
        onComplete?.();
      },
    });
  }

  private pushPoint(protoPoint: ProtoPoint) {
    this.points.push(
      new Point(protoPoint, this.$circlesGroup, this.lineConfig).addClass(
        'dragabble-point'
      )
    );
  }

  private updatePoint(protoPoint: ProtoPoint) {
    if (!this.virtualPoint.value) {
      this.virtualPoint.value = new Point(
        protoPoint,
        this.$circlesGroup,
        this.lineConfig
      );
      return;
    }
    this.virtualPoint.value.update(protoPoint).draw();
  }

  draw(points: Point[]) {
    if (!points.length) return;
    this.erease();
    this.lines = this.drawLines(points);
    this.drawCircles(points);
  }

  private drawCircles(points: Point[]) {
    points.forEach((point) => point.draw());
  }

  private drawLines(points: Point[]) {
    return points.slice(1).reduce(
      ({ lines, lastPoint }, point) => {
        const line = new ReactiveLine(
          lastPoint,
          point,
          this.$linesGroup,
          this.lineConfig
        );
        return { lines: [...lines, line], lastPoint: point };
      },
      { lines: [] as ReactiveLine[], lastPoint: this.points[0] }
    ).lines;
  }

  erease() {
    this.lines.flat().forEach((line) => line.erease());
  }
}
