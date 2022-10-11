<template lang="">
  <q-page class="column justify-start align-center">
    <div class="row justify-center align-center">The single cam view</div>
    <div class="row justify-center align-center" ref="threeContainer"></div>
    <div class="row justify-center align-center">The stereo cam view</div>
    <div class="row justify-center align-center" ref="threeStereoContainer"></div>
    <div class="row justify-center align-center">The stereo cam buffer view</div>
    <div class="row justify-center align-center" >
      <canvas width="1280" height="360" ref="threeStereoBufferContainer"/>
    </div>
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
    this.three.attachAndRender(
      this.$refs['threeContainer'],
      this.$refs['threeStereoContainer'],
      this.$refs['threeStereoBufferContainer']
    );
  },
};
</script>
<style lang=""></style>
