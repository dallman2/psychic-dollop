<template lang="">
  <q-page class="row justify-center items-start">
    <ScrollFixer>
      <template #content>
        <StoryDialog>
          <template #board>
            <StoryBoard :wide="wide" />
          </template>
        </StoryDialog>
        <div class="row justify-center">
          <TFCont />
        </div>
      </template>
    </ScrollFixer>
  </q-page>
</template>
<script>
import StoryBoard from 'components/StoryBoardTF.vue';
import ScrollFixer from 'components/ScrollFixer.vue';
import StoryDialog from 'src/components/StoryDialog.vue';
import TFCont from 'src/components/TFCont.vue';
import { useQuasar } from 'quasar';
export default {
  setup() {
    let q = useQuasar();
    return { q };
  },
  components: {
    StoryDialog,
    StoryBoard,
    ScrollFixer,
    TFCont,
  },
  computed: {
    wide() {
      return this.q.screen.width > 900;
    },
  },
};
</script>
<style lang=""></style>
