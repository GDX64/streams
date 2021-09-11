import { fromEvent, merge, of } from 'rxjs';
import {
  concatMap,
  concatWith,
  filter,
  map,
  mapTo,
  mergeWith,
  repeat,
  scan,
  switchMap,
  take,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { Polyline, SVG } from '@svgdotjs/svg.js';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
import { clickOutside, keyDown } from '../Events/events';
import { DrawActions } from './Enums';

const { DELETE, DESELECT, SELECT, FINISH } = DrawActions;

export function makeDrawOnCanvas(canvas: HTMLElement) {
  const draw = SVG()
    .addTo(canvas)
    .addClass('canvas-svg');
  return {
    getLine({ color, width, fill }: LineConfig) {
      return draw
        .polyline()
        .fill(fill ? color : 'none')
        .stroke({ color, width });
    },
    draw,
  };
}

type PairNum = [number, number];
type PairNumArr = PairNum[];
export type ObjDrawer = ReturnType<typeof makeDrawOnCanvas>;
interface LineConfig {
  color: string;
  width: number;
  fill: boolean;
}

function mouseObservable(canvas: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent<MouseEvent>(canvas, 'mousedown').pipe(
    filter((event) => event.button === 0),
    concatMap(() => fromEvent<MouseEvent>(canvas, 'mousemove')),
    map(({ offsetX, offsetY }) => [offsetX, offsetY] as PairNum),
    scan((acc, pairXY) => [...acc, pairXY], [] as PairNumArr)
  );
}

export function makeFreeDrawingObservable(objDrawer: ObjDrawer, config: LineConfig) {
  const $canvas = objDrawer.draw.node;
  return mouseObservable($canvas).pipe(
    scan<PairNumArr, Polyline, null>((line, arrValues) => {
      const realLine = line ?? objDrawer.getLine(config);
      realLine.plot(arrValues);
      return realLine;
    }, null),
    switchMap((line) =>
      merge(
        fromEvent(document, 'mouseup').pipe(mapTo(line)),
        fromEvent($canvas, 'mousedown').pipe(
          tap(() => line?.remove()),
          mapTo(null)
        )
      )
    ),
    take(1),
    repeat()
  );
}

type HasMouseAndKeyBoard = HasEventTargetAddRemove<MouseEvent & KeyboardEvent>;

const pressDelete = () => keyDown(document, 'Delete').pipe(mapTo(DELETE));
const deselect = ($el: HasMouseAndKeyBoard) =>
  clickOutside($el).pipe(switchMap(() => of(DESELECT, FINISH)));

export function selected($el: HasMouseAndKeyBoard) {
  return fromEvent($el, 'click').pipe(
    switchMap(() => {
      return of(SELECT).pipe(concatWith(pressDelete()), mergeWith(deselect($el)));
    }),
    takeWhile((value) => value !== FINISH),
    repeat()
  );
}

// function pointEmitter($canvas: HasEventTargetAddRemove<MouseEvent>) {
//   return fromEvent($canvas, 'click').pipe(
//     switchMap((event) => fromEvent($canvas, 'mousemove').pipe(startWith(event)))
//   );
// }
