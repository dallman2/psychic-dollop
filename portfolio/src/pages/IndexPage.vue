<template>
  <q-page
    style="background-image: url('src/assets/heroMtn.png')"
    class="row justify-center items-start relative-position"
  >
    <ScrollFixer>
      <template #content>
        <div class="row justify-center">
          <q-list
            class="q-pb-xl q-my-md column fit"
            style="max-width: 900px"
            :bordered="false"
            :separator="false"
            :dark="false"
            :padding="false"
          >
            <q-item style="max-width: 850px">
              <q-item-section>
                <q-parallax>
                  <template v-slot:media>
                    <q-img src="src/assets/hero.png" />
                  </template>

                  <template v-slot:content="scope">
                    <div
                      class="absolute column items-center"
                      :style="{
                        opacity: 0.45 + (1 - scope.percentScrolled) * 0.55,
                        top: scope.percentScrolled * 60 + '%',
                        left: 0,
                        right: 0,
                      }"
                    >
                      <q-img
                        src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg"
                        style="width: 150px; height: 150px"
                      />
                      <div class="text-h3 text-white text-center">
                        Quasar Framework
                      </div>
                      <div class="text-h6 text-grey-3 text-center">
                        v{{ $q.version }}
                      </div>
                    </div>
                  </template>
                </q-parallax>
              </q-item-section>
            </q-item>
          </q-list>
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
