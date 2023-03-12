<template>
  <q-scroll-area
    :thumb-style="{
      right: '-1vw',
    }"
    :style="`height: ${$q.screen.height - 50}px; width: 99vw;`"
  >
    <slot name="content"></slot>
  </q-scroll-area>
</template>
