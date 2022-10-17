<template>
  <q-scroll-area :style="`height: ${$q.screen.height - 50}px; width: 100vw;`">
    <div
      :style="
        restrictWidth && wide
          ? {
              position: 'absolute',
              left: `${$q.screen.width / 2 - 450}px`,
            }
          : ''
      "
    >
      <slot name="content"></slot>
    </div>
  </q-scroll-area>
</template>
<script>
export default {
  props: {
    restrictWidth: {
      type: Boolean,
      default: true,
    },
    wide: Boolean,
  },
};
</script>