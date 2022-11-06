<template lang="">
  <q-page class="row justify-center items-start">
    <ScrollFixer>
      <template #content>
        <q-dialog v-model="info">
          <q-card
            style="max-height: 75vh; min-width: 70vw"
            class="row justify-center"
          >
            <StoryBoard :wide="wide" />
          </q-card>
        </q-dialog>
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
import TFCont from 'src/components/TFCont.vue';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
export default {
  setup() {
    let q = useQuasar();
    let info = ref(true);
    return { q, info };
  },
  components: {
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
