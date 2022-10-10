<template lang="">
  <q-page class="flex flex-center">
    <div class="" ref="threeContainer"></div>
  </q-page>
</template>
<script>
import useThree from 'src/composables/useThree';

export default {
  setup() {
    let three = useThree();
    return { three };
  },
  mounted() {
    this.three.attachAndRender(this.$refs['threeContainer']);
  },
};
</script>
<style lang=""></style>
