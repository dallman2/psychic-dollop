<template>
  <q-item :class="wide ? 'row' : 'column'">
    <q-item-section
      v-if="!wide || left"
      :class="{
        'col-3': wide,
        'col-12 q-pb-sm q-pt-md': !wide,
        'flex-center': true,
      }"
    >
      <q-icon color="secondary" :size="iconSize" :name="icon" />
    </q-item-section>
    <q-item-section :class="wide ? 'col-9' : 'col-12 no-margin'">
      <q-item-label
        :class="{
          'text-h4': wide,
          'text-h5 text-center': !wide,
          'text-weight-light': true,
        }"
      >
        <slot name="label"></slot>
      </q-item-label>
      <q-item-label
        :class="{ 'text-justify': !wide, 'text-body1 text-weight-light': true }"
      >
        <slot name="content"></slot>
      </q-item-label>
    </q-item-section>
    <q-item-section v-if="wide && !left" class="col-3 flex-center">
      <q-icon color="secondary" :size="iconSize" :name="icon" />
    </q-item-section>
  </q-item>
</template>
<script>
export default {
  props: ['wide', 'icon', 'left'],
  computed: {
    iconSize() {
      return this.wide ? '9vw' : '15vw';
    },
  },
};
</script>
