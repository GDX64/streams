<template>
  <input type="text" v-model="strMessage" @keydown.enter="sendMessage" />
  <div>{{ answer }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Worker from "worker-loader!./Worker";
import { WorkerData, isType } from "./Worker";

const worker = new Worker();

worker.postMessage({ a: 1 });

export default defineComponent({
  name: "App",
  data() {
    return {
      strMessage: "",
      answer: {},
    };
  },
  methods: {
    sendMessage() {
      const [type, msg, ...args] = this.strMessage.split(" ");
      const fnType = msg;
      if (!isType(type)) {
        return;
      }
      const data: WorkerData = {
        type,
        fnType,
        msg,
        args,
      };
      worker.postMessage(data);
    },
  },
  mounted() {
    worker.onmessage = ({ data }: any) => {
      this.answer = data.result;
    };
  },
});
</script>

<style lang="scss"></style>
