<template>
  <q-dialog v-model="info">
    <q-card style="max-width: 900px" class="row justify-center">
      <q-scroll-area style="min-height: 75vh; width: 70vw">
        <slot name="board"></slot>
      </q-scroll-area>
    </q-card>
  </q-dialog>
</template>

<script>
import { ref } from 'vue';
export default {
  setup() {
    let info = ref(true);
    return { info };
  },
};
</script>

<style></style>
