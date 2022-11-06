<template>
  <div class="q-pb-xl q-my-md" style="max-width: 900px">
    <div class="text-h4">The tf model and stuff</div>
  </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
export default {
  setup() {
    console.log('setup tfcont');
    console.log(tf);

    let loaded = () => {
      console.log('loaded');
    };
    let errHandle = () => {
      console.log('failed to load model');
    };

    tf.loadLayersModel('src/assets/').then(loaded, errHandle);
  },
};
</script>

<style></style>
