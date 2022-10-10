<template>
  <div>
    <p>{{ title }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, toRef, Ref } from 'vue';
import { Todo, Meta } from './models';
import * as tf from '@tensorflow/tfjs';

function useTF() {
  let t = tf.tensor([1, 2, 3, 4]);
  console.log(t);
}

export default defineComponent({
  name: 'ExampleComponent',
  props: {
    title: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
    },
  },
  setup() {
    useTF();
  },
});
</script>
