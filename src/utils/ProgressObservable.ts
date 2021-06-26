import { interval, of, timer } from "rxjs";
import { concatMap, map, repeat, scan, take } from "rxjs/operators";

function randomTimeObservable(fnRamdom: () => number) {
  return of(1).pipe(
    concatMap(() => timer(fnRamdom())),
    repeat()
  );
}

export function makeProgressObservable() {
  return randomTimeObservable(() => Math.random() * 1000).pipe(
    take(20),
    scan((acc, _) => acc + 1, 0),
    map((n) => n / 20)
  );
}
