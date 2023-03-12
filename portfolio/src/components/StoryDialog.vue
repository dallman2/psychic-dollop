<template>
  <q-dialog v-model="info">
    <q-card style="max-width: 900px" class="row justify-center">
      <q-scroll-area
        :visible="false"
        style="min-height: 75vh; width: 70vw"
        :thumb-style="{
          right: '1px',
          borderRadius: '4px',
          width: '4px',
          opacity: '0.5',
        }"
      >
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
