<template>
  <q-scroll-area :style="`height: ${$q.screen.height - 50}px; width: 100vw;`">
    <slot name="content"></slot>
  </q-scroll-area>
</template>
