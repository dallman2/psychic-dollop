<template lang="">
  <q-page class="column justify-start align-center">
    <ScrollFixer>
      <template #content>
        <div v-show="showThree">
          <div class="row justify-center align-center">
            <q-btn
              label="Toggle Chessboard/ Normal mode"
              @click="calibMode = toggleCalibrationMode()"
            />
            <q-btn
              label="Capture calibration pair"
              @click="capturedPairs = captureCalibrationPair()"
              v-if="calibMode"
            />
            <q-btn
              label="Calibrate Cameras"
              @click="doStereoCalibration"
              v-if="calibMode"
            />
            <q-chip
              v-if="calibMode"
              square
              :label="`Pairs captured: ${capturedPairs}`"
            />
          </div>
          <div class="row justify-center align-center">The single cam view</div>
          <div
            class="row justify-center align-center"
            ref="threeContainer"
          ></div>
          <div class="row justify-center align-center">The stereo cam view</div>
          <div
            class="row justify-center align-center"
            ref="threeStereoContainer"
          ></div>
          <div class="row justify-around align-center">
            <div>Undistorted Left Eye View</div>
            <div>Undistorted Right Eye View</div>
          </div>
          <div class="row justify-center align-center q-pb-sm">
            <canvas
              style="border: solid 1px black"
              width="640"
              height="360"
              ref="leftEye"
            />
            <canvas
              style="border: solid 1px black"
              width="640"
              height="360"
              ref="rightEye"
            />
          </div>
          <div class="row justify-around align-center">
            <div>Disparity Map</div>
          </div>
          <div class="row justify-center align-center q-pb-sm">
            <canvas
              style="border: solid 1px black"
              width="640"
              height="360"
              ref="dispMap"
            />
          </div>
        </div>
        <q-inner-loading :showing="!showThree">
          <h4>Loading OpenCV...</h4>
          <q-spinner-gears size="100px" color="secondary"></q-spinner-gears>
        </q-inner-loading>
      </template>
    </ScrollFixer>
  </q-page>
</template>
<script>
import ScrollFixer from 'components/ScrollFixer.vue';
import useThree from 'src/composables/useThree';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

export default {
  setup() {
    let $q = useQuasar(),
      {
        attachAndRender,
        toggleCalibrationMode,
        captureCalibrationPair,
        doStereoCalibration,
      } = useThree();
    const showThree = ref(false),
      calibMode = ref(false),
      capturedPairs = ref(0),
      cvReady = () => (showThree.value = true);
    return {
      $q,
      attachAndRender,
      cvReady,
      toggleCalibrationMode,
      captureCalibrationPair,
      doStereoCalibration,
      showThree,
      calibMode,
      capturedPairs,
    };
  },
  components: {
    ScrollFixer,
  },
  computed: {
    wide() {
      return this.$q.screen.width > 900;
    },
  },
  mounted() {
    this.attachAndRender(
      this.$refs['threeContainer'],
      this.$refs['threeStereoContainer'],
      this.$refs['leftEye'],
      this.$refs['rightEye'],
      this.$refs['dispMap'],
      this.cvReady
    );
  },
};
</script>
