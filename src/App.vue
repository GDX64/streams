<template>
  <worker-ex />
  <drag-test-vue />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DragTestVue from "./components/DragTest.vue";
import WorkerEx from "./workers/WorkerEx.vue";
import "./Connection/socketCon";

export default defineComponent({
  name: "App",
  components: { WorkerEx, DragTestVue },
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
