import { asyncScheduler, from, generate, scheduled } from "rxjs";

function fibo(n: bigint): bigint {
  if (n === 0n) return 1n;
  if (n === 1n) return 1n;
  return fibo(n - 1n) + fibo(n - 2n);
}

export function infinityTest() {
  generate({
    initialState: BigInt(0),
    condition(value) {
      return value < 1e15;
    },
    iterate(value) {
      return value + 1n;
    },
    scheduler: asyncScheduler,
  }).subscribe((value) => {
    console.log(fibo(25n));
  });
  console.log("started");
}
