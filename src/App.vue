<template>
  <drawer-vue />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DrawerVue from "./components/Drawer.vue";
// import ProgressBarVue from "./components/ProgressBar.vue";
// import DragTestVue from "./components/DragTest.vue";
// import WorkerEx from "./workers/WorkerEx.vue";
// import { makeProgressObservable } from "./utils/ProgressObservable";
export default defineComponent({
  name: "App",
  components: { DrawerVue },
  data() {
    return {};
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
