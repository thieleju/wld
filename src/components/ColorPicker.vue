<template>
  <!-- color picker -->
  <div class="d-flex justify-space-around">
    <v-card class="d-flex flex-column">
      <v-color-picker
        v-model="color_current"
        v-model:mode="mode"
        :modes="modes"
      ></v-color-picker>
      <v-btn block color="primary" @click="$emit('save', color_current)"
        >Save</v-btn
      >
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  color: {
    type: String,
    default: "#000000",
  },
});

const color_current = ref(props.color);
const mode = ref("hexa");
const modes = ref(["hsla", "rgba", "hexa"]);
</script>
