<template>
  <q-page class="row justify-center items-start relative-position">
    <ScrollFixer>
      <template #content>
        <div class="row justify-center">
          <h1>Boopus Header 🍆</h1>
        </div>
      </template>
    </ScrollFixer>
  </q-page>
</template>

<script>
import ScrollFixer from 'components/ScrollFixer.vue';
import { useQuasar } from 'quasar';
export default {
  setup() {
    let $q = useQuasar();
    return { $q };
  },
  components: {
    ScrollFixer,
  },
  computed: {
    wide() {
      return this.$q.screen.width > 900;
    },
  },
};
</script>
