<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar class="row justify-between">
        <q-btn label="Daniel's Portfolio" to="/" />
        <q-btn label="Stereo vision" to="stereo" />
        <q-btn label="Machine learning" to="tfjs" />
        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',
});
</script>
