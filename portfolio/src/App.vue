<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { init, getAPI } from 'src/js/gfxState';

export default defineComponent({
  name: 'App',
  setup() {
    init();
  },
});
</script>
