<template>
  <div class="plot">
    <div class="options-box">
      <label for="">Frequência (Hz)</label>
      <input type="number" v-model="nFreq" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SVG } from "@svgdotjs/svg.js";
import ScaleGrid, { scaleCreator } from "../popUtils/Scalegrid";
import { Observable, of, Subject, Subscription } from "rxjs";
import {
  filter,
  map,
  sampleTime,
  scan,
  share,
  switchMap,
} from "rxjs/operators";
import * as R from "ramda";
import { websocketCon } from "@/Connection/socketCon";

const N = 100;

interface WaveData {
  nSample: number;
  nID: number;
}

function squareWindow(n: number) {
  return scan(
    (acc: number[], value: number) => [
      ...acc.slice(Math.max(0, acc.length - n + 1)),
      value,
    ],
    []
  );
}

function _makeWaveObservable(nFreq: number): Observable<number[]> {
  return new Observable<WaveData>((subscribe) => {
    websocketCon.emit("subscribeOnWave", { nFreq });
    websocketCon.on("waveSample", ({ nSample, nID }: WaveData) =>
      subscribe.next({ nSample, nID })
    );
  }).pipe(
    filter(({ nID }) => nID === nFreq),
    map(({ nSample }) => nSample),
    squareWindow(N),
    sampleTime(1000 / 60),
    share({
      resetOnRefCountZero: () => {
        websocketCon.emit("unsubscribeOnWave", { nID: nFreq });
        return of(1);
      },
    })
  );
}

const makeWaveObservable = R.memoizeWith((nFreq) => nFreq, _makeWaveObservable);

export default defineComponent({
  data() {
    const frequencyEmitter = new Subject<number>();
    return {
      sg: (null as any) as ScaleGrid,
      subscription: null as null | Subscription,
      nFreq: 1,
      frequencyEmitter,
    };
  },
  mounted() {
    const draw = SVG()
      .addTo(this.$el as HTMLElement)
      .size(300, 300)
      .viewbox("0 0 300 300");

    const sg = new ScaleGrid(draw, {});
    sg.plot([1, 2, 3, 4], [1, 2, 3, 4]);

    const scaleX = scaleCreator([0, N], [-5, 5]);
    this.subscription = this.frequencyEmitter
      .pipe(switchMap((nFreq) => makeWaveObservable(nFreq)))
      .subscribe((arrWave) => {
        this.sg.plot(R.range(0, arrWave.length).map(scaleX), arrWave);
      });

    draw.size("100%", "100%").attr("preserveAspectRatio", "none");
    this.sg = sg;
  },
  unmounted() {
    this.subscription?.unsubscribe();
  },
  watch: {
    nFreq() {
      this.frequencyEmitter.next(this.nFreq);
    },
  },
});
</script>

<style lang="scss">
.plot {
  height: 100%;
  width: 100%;
}
</style>
