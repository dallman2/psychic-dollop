<template lang="">
  <q-page class="row justify-center items-start relative-position">
    <ScrollFixer :wide="wide">
      <template #content>
        <StoryBoard :wide="wide"/>
      </template>
    </ScrollFixer>
  </q-page>
</template>
<script>
import StoryBoard from 'components/StoryBoard.vue';
import ScrollFixer from 'components/ScrollFixer.vue';
import { useQuasar } from 'quasar';
export default {
  setup() {
    let $q = useQuasar();
    return { $q };
  },
  components: {
    StoryBoard,
    ScrollFixer,
  },
  computed: {
    wide() {
      return this.$q.screen.width > 900;
    },
  },
};
</script>
<style lang="">
</style>
