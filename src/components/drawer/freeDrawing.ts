import { fromEvent, merge, Subscription } from 'rxjs';
import {
  concatMap,
  filter,
  map,
  mapTo,
  repeat,
  scan,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Polyline, SVG } from '@svgdotjs/svg.js';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';

export function makeDrawOnCanvas(canvas: HTMLElement) {
  const draw = SVG()
    .addTo(canvas)
    .addClass('canvas-svg');
  return {
    getLine({ color }: LineConfig) {
      return draw
        .polyline()
        .fill('#00000000')
        .stroke({ color });
    },
    draw,
  };
}

type PairNum = [number, number];
type PairNumArr = PairNum[];
export type ObjDrawer = ReturnType<typeof makeDrawOnCanvas>;
interface LineConfig {
  color: string;
}

function mouseObservable(canvas: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
    filter((event) => event.button === 0),
    concatMap(() => fromEvent<MouseEvent>(canvas, 'mousemove')),
    map(({ offsetX, offsetY }) => [offsetX, offsetY] as PairNum),
    scan((acc, pairXY) => [...acc, pairXY], [] as PairNumArr)
  );
}

export function makeCanvasObservable(objDrawer: ObjDrawer, config: LineConfig) {
  const $canvas = objDrawer.draw.node;
  return mouseObservable($canvas).pipe(
    scan<PairNumArr, Polyline, null>((line, arrValues) => {
      const realLine = line ?? objDrawer.getLine(config);
      realLine.plot(arrValues);
      return realLine;
    }, null),
    switchMap((line) =>
      merge(
        fromEvent(document, 'mouseup').pipe(mapTo(null)),
        fromEvent($canvas, 'mousedown').pipe(mapTo(line))
      )
    ),
    take(1),
    tap((line) => line?.remove()),
    repeat()
  );
}

function pointEmitter($canvas: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent($canvas, 'click').pipe(
    switchMap((event) => fromEvent($canvas, 'mousemove').pipe(startWith(event)))
  );
}
