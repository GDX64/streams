<template>
  <div class="plot"></div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SVG } from "@svgdotjs/svg.js";
import ScaleGrid from "../popUtils/Scalegrid";
import * as R from "ramda";
import { testPID } from "../utils/PIDController";

export default defineComponent({
  data() {
    return {};
  },
  mounted() {
    const draw = SVG()
      .addTo(this.$el as HTMLElement)
      .size(600, 600)
      .viewbox("0 0 600 600");

    const sg = new ScaleGrid(draw, {
      scaleX: [-1, 200],
      scaleY: [-1, 13],
    })
      .drawTicks({ nTicksDensityX: 0.05, nTicksDensityY: 1 })
      .drawTicksText();
    draw.size("100%", "100%").attr("preserveAspectRatio", "none");

    const result = testPID();
    const arrValues = R.pluck("value", result);
    sg.plotSimple(arrValues);
  },
});
</script>

<style lang="scss">
.plot {
  height: 100%;
  width: 100%;
}
</style>
