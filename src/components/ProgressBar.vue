<template>
  <div class="progress-bar__container">
    <div class="progress-bar__bar" :style="{ width }"></div>
    <p class="progress-bar__text">{{ progressText }}</p>
  </div>
</template>

<script lang="ts">
import { Observable } from "rxjs";
import { animate, easeInOut } from "popmotion";
import { defineComponent, PropType } from "vue";
import { switchMap } from "rxjs/operators";

function createAnimationObservable(from: number, to: number) {
  return new Observable<number>((subscription) => {
    const animation = animate({
      from,
      to,
      duration: 500,
      ease: easeInOut,
      onUpdate: (latest) => {
        subscription.next(latest);
      },
      onComplete: () => subscription.complete(),
    });
    return () => {
      animation.stop();
    };
  });
}

export default defineComponent({
  props: {
    observable: {
      type: Object as PropType<Observable<number>>,
      required: true,
    },
  },
  data() {
    return {
      progress: 0,
    };
  },
  computed: {
    width(): string {
      return `${this.progress * 100}%`;
    },
    progressText(): string {
      return `${(this.progress * 100).toFixed(2)}%`;
    },
  },
  mounted() {
    this.observable
      .pipe(
        switchMap((nValue) => createAnimationObservable(this.progress, nValue))
      )
      .subscribe((nValue) => {
        this.progress = nValue;
      });
  },
});
</script>

<style lang="scss">
.progress-bar {
  &__container {
    width: fit-content;
    display: flex;
    flex-flow: column;
    width: 600px;
  }
  &__text {
    justify-self: center;
    font-weight: 900;
    margin-top: 6px;
  }
  &__bar {
    height: 10px;
    width: 0px;
    border: rgb(21, 32, 21) solid 2px;
    background-image: linear-gradient(
      to right,
      rgb(13, 121, 13),
      rgb(146, 250, 227)
    );
  }
}
</style>
