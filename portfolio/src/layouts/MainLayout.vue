<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="row no-margin no-padding fit">
        <q-tabs align="justify" stretch inline-label class="col-9">
          <q-route-tab
            :label="wide ? 'Daniel\'s Portfolio' : ''"
            icon="home"
            to="/"
            exact
          />
          <q-route-tab
            :label="wide ? 'Stereo vision' : ''"
            icon="camera"
            to="/stereo"
            exact
          />
          <q-route-tab
            :label="wide ? 'Machine learning' : ''"
            icon="poll"
            to="/tfjs"
            exact
          />
        </q-tabs>
        <q-btn
          flat
          stretch
          class="col-3"
          icon="integration_instructions"
          :label="wide ? 'My Github' : ''"
          href="https://github.com/dallman2/psychic-dollop"
          target="_blank"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar';
export default {
  name: 'MainLayout',
  setup() {
    let $q = useQuasar();
    return { $q };
  },
  computed: {
    wide() {
      return this.$q.screen.width > 900;
    },
  },
};
</script>
