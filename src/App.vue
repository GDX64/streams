<template>
  <progress-bar-vue :observable="observable" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ProgressBarVue from "./components/ProgressBar.vue";
// import DragTestVue from "./components/DragTest.vue";
// import WorkerEx from "./workers/WorkerEx.vue";
import "./Connection/socketCon";
import { makeProgressObservable } from "./utils/ProgressObservable";
export default defineComponent({
  name: "App",
  components: { ProgressBarVue },
  data() {
    return {
      observable: makeProgressObservable(),
    };
  },
  methods: {},
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
