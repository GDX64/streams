import { fromEvent } from 'rxjs';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
import { filter } from 'rxjs/operators';

export function clickOutside($el: HasEventTargetAddRemove<MouseEvent>) {
  return fromEvent(document, 'mousedown').pipe(filter((event) => $el !== event.target));
}

export function keyDown($el: HasEventTargetAddRemove<KeyboardEvent>, key: string) {
  return fromEvent<KeyboardEvent>($el, 'keydown').pipe(filter((event) => event.key === key));
}
