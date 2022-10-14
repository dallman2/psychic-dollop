<template lang="">
  <q-page class="column justify-start align-center">
    <div v-show="showThree">
      <div class="row justify-center align-center">The single cam view</div>
      <div class="row justify-center align-center" ref="threeContainer"></div>
      <div class="row justify-center align-center">The stereo cam view</div>
      <div class="row justify-center align-center" ref="threeStereoContainer"></div>
      <div class="row justify-around align-center">
        <div>Left Eye View</div>
        <div>Right Eye View</div>
      </div>
      <div class="row justify-center align-center q-pb-sm" >
        <canvas style="border: solid 1px black" width="640" height="360" ref="leftEye"/>
        <canvas style="border: solid 1px black" width="640" height="360" ref="rightEye"/>
      </div>
    </div>
    <q-inner-loading :showing="!(showThree)">
      <h4>Loading OpenCV...</h4>
      <q-spinner-gears size="100px" color="secondary"></q-spinner-gears>
    </q-inner-loading>
  </q-page>
</template>
<script>
import useThree from 'src/composables/useThree';
import { ref } from 'vue';

export default {
  setup() {
    let three = useThree();
    const showThree = ref(false),
      cvReady = () => (showThree.value = true);
    return { three, cvReady, showThree };
  },
  mounted() {
    this.three.attachAndRender(
      this.$refs['threeContainer'],
      this.$refs['threeStereoContainer'],
      this.$refs['leftEye'],
      this.$refs['rightEye'],
      this.cvReady
    );
  },
};
</script>
<style lang=""></style>