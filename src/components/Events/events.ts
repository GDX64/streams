import { fromEvent, fromEventPattern, merge, Observable, of } from 'rxjs';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
import { concatMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

export function clickOutside($el: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent(document, 'mousedown').pipe(filter((event) => $el !== event.target));
}

export function keyDown($el: HasEventTargetAddRemove<KeyboardEvent>, key: string) {
  return fromEvent<KeyboardEvent>($el, 'keydown').pipe(
    filter((event) => event.key === key)
  );
}

function withStoppedEvent<T extends Event>(
  $el: HasEventTargetAddRemove<T>,
  strEvent: string
) {
  return fromEventPattern((handler) => {
    $el.addEventListener(strEvent, (event) => {
      event.stopPropagation();
      handler(event);
    });
  });
}

interface HasClassList {
  classList: DOMTokenList;
}

export function dragObservable<T extends Event>(
  $el: HasEventTargetAddRemove<T> & HasClassList
) {
  return withStoppedEvent($el, 'mousedown').pipe(
    tap(() => $el.classList.add('no-select')),
    switchMap(() =>
      fromEvent<MouseEvent>(document, 'mousemove').pipe(
        takeUntil(
          fromEvent(document, 'mouseup').pipe(
            tap(() => $el.classList.remove('no-select'))
          )
        )
      )
    )
  );
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

export interface StreamInputEvent {
  offsetX: number;
  offsetY: number;
  type: string;
}

export function observeClickAndMove(
  $el: HasEventTargetAddRemove<MouseEvent>
): Observable<StreamInputEvent> {
  return fromEvent<MouseEvent>($el, 'click').pipe(
    concatMap(({ offsetX, offsetY }) =>
      merge(of({ offsetX, offsetY, type: 'click' }), mouseMoveAndClick($el))
    ),
    takeUntil(fromEvent(document, 'contextmenu'))
  );
}
