import { interval, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { Socket } from "socket.io";

interface WaverData {
  nFreq: number;
}

function waver(freq: number) {
  return interval(10).pipe(
    map((n) => Math.sin((n * 2 * Math.PI * freq) / 100) * 4)
  );
}

export function setupWaveSubscription(socket: Socket) {
  const mSubscriptions = new Map<number, Subscription>();
  socket.on("subscribeOnWave", ({ nFreq }: WaverData) => {
    console.log("wave request, frequency:", nFreq);
    const subscription = waver(nFreq).subscribe((nSample) => {
      socket.emit("waveSample", { nSample, nID: nFreq });
    });
    mSubscriptions.set(nFreq, subscription);
  });
  socket.on("unsubscribeOnWave", ({ nID }: { nID: number }) => {
    console.log("wave unsubscribe");
    mSubscriptions.get(nID)?.unsubscribe();
  });
}
