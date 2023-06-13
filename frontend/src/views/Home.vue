<template>
  <v-row class="d-flex justify-center align-center">
    <v-col cols="12">
      <div
        class="pa-10"
        :style="{
          backgroundColor: background_color,
          color: font_color,
          fontFamily: selectedFont,
          fontSize: selectedSize + 'px',
          textAlign: 'center',
        }"
      >
        {{ wld.wins }}/{{ wld.loses }}/{{ wld.draws }}
      </div>
    </v-col>

    <v-col lg="5" md="8" sm="12" xs="12">
      <v-card class="mx-3">
        <!-- <v-progress-linear
          v-if="api.loading"
          color="primary"
          indeterminate
        ></v-progress-linear> -->
        <!-- set background color to primary color -->
        <!-- <v-card-title class="primary background">Settings</v-card-title> -->
        <!-- <v-divider></v-divider> -->
        <v-card-text>
          <v-row>
            <!-- USERNAME -->
            <v-col cols="8">
              <v-text-field
                v-model="username"
                label="Username"
                persistent-hint
                prepend-icon="mdi-account"
                :hint="api.hint"
                :loading="api.loading"
                @input="update_data"
              ></v-text-field>
            </v-col>
            <!-- PLATFORM V SWITCH -->
            <v-col cols="4">
              <v-switch
                color="primary"
                v-model="platform.chess_com"
                :label="platform.label"
                :items="platform.items"
              ></v-switch>
            </v-col>
            <!-- GAME SETTINGS -->
            <v-col cols="12">
              <v-autocomplete
                v-model="game_settings.mode"
                label="Game Mode(s)"
                multiple
                prepend-icon="mdi-lightning-bolt"
                :items="game_settings.modes"
                @update:modelValue="update_data"
              ></v-autocomplete>
            </v-col>
            <!-- FONT -->
            <v-col cols="6">
              <v-select
                v-model="selectedFont"
                :items="fontOptions"
                label="Font"
                prepend-icon="mdi-format-font"
              ></v-select>
            </v-col>
            <!-- FONT SIZE -->
            <v-col cols="6">
              <v-text-field
                v-model.number="selectedSize"
                label="Font size"
                type="number"
                prepend-icon="mdi-format-size"
              ></v-text-field>
            </v-col>
            <!-- COLOR BACKGROUND -->
            <v-col cols="6">
              <v-text-field
                v-model="background_color"
                label="Background Color"
                type="color"
                mode="hexa"
                hide-details
                prepend-icon="mdi-format-color-fill"
              >
              </v-text-field>
            </v-col>
            <!-- COLOR FONT -->
            <v-col cols="6">
              <v-text-field
                v-model="font_color"
                label="Font Color"
                type="color"
                mode="hexa"
                hide-details
                prepend-icon="mdi-format-color-text"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="my-2">
          <v-btn color="primary" @click="reset">
            <v-icon class="px-3">mdi-restore </v-icon>
            reset</v-btn
          >
          <v-btn color="primary" @click="pop_out">
            <v-icon class="px-3">mdi-open-in-new </v-icon>
            pop out</v-btn
          >
          <v-btn color="primary" @click="save_settings">
            <v-icon class="px-3">mdi-content-save-outline</v-icon>
            Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <!-- color picker -->
  <!-- <ColorPicker color="#ffffff" @save="save_color"></ColorPicker> -->
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
// import ColorPicker from "@/components/ColorPicker.vue";

const default_settings = {
  font: "Arial",
  size: 72,
  background_color: "#121212",
  font_color: "#FFFFFF",
  platform_chess_com: true,
  platform: {
    chess_com: true,
    items: ["chess.com", "lichess.org"],
    label: "chess.com",
  },
  game_settings: {
    modes: ["blitz", "rapid", "bullet", "daily"],
    mode: "rapid",
  },
  api: {
    loading: false,
    hint: "Enter the username of a player",
  },
  username: "",
  wld: {
    wins: 0,
    loses: 0,
    draws: 0,
  },
};

const selectedFont = ref(default_settings.font);
const selectedSize = ref(default_settings.size);
const background_color = ref(default_settings.background_color);
const font_color = ref(default_settings.font_color);
const username = ref(default_settings.username);
const platform = ref(default_settings.platform);
const api = ref(default_settings.api);
const wld = ref(default_settings.wld);
const game_settings = ref(default_settings.game_settings);

const fontOptions = [
  "Arial",
  "Verdana",
  "Times New Roman",
  "Courier New",
  "Comic Sans MS",
  "Impact",
  "Lucida Sans Unicode",
  "Tahoma",
  "Trebuchet MS",
  "Arial Black",
  "Georgia",
  "Lucida Console",
  "Palatino Linotype",
];

onMounted(() => {
  read_settings();
  update_data();

  // set update interval to 10 seconds
  setInterval(() => {
    update_data();
  }, 10000);
});

watch(
  () => platform.value.chess_com,
  (val) => {
    if (val) platform.value.label = platform.value.items[0];
    else platform.value.label = platform.value.items[1];
  }
);

async function update_data() {
  api.value.loading = true;
  try {
    await get_data(username.value);
    api.value.hint = `Showing WLD for ${username.value}`;
  } catch (error) {
    // console.log(error);
    api.value.hint = `Failed to fetch WLD`;
  } finally {
    api.value.loading = false;
  }
}

async function get_data(un) {
  if (platform.value.chess_com) return get_chess_com_data(un);
  else return get_lichess_data(un);
}

async function get_chess_com_data(un) {
  // current year and month
  const date = new Date();
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  // add 0 to month if less than 10
  if (month < 10) month = `0${month}`;

  const res = await axios.get(
    `https://api.chess.com/pub/player/${un}/games/${year}/${month}`
  );

  // filter games depending on date and mode
  const current_date = Math.floor(Date.now() / 1000);
  const games = res.data.games.filter(
    (game) =>
      // filter game mode
      (Array.isArray(game_settings.value.mode)
        ? game_settings.value.mode.includes(game.time_class)
        : game.time_class == game_settings.value.mode) &&
      // filter games that are not finished
      game.end_time < current_date &&
      // filter games that are not in the last 12 hours
      game.end_time > current_date - 43200 // 12 hours in seconds
  );
  let stats = {
    wins: 0,
    loses: 0,
    draws: 0,
  };
  games.forEach((game) => {
    // get which side the player is playing on
    let color = "";
    if (game.white.username.toLowerCase() === un.toLowerCase()) color = "white";
    else color = "black";
    // get the result
    const result = transform_result(game[color].result);
    switch (result) {
      case "win":
        stats.wins++;
        break;
      case "lose":
        stats.loses++;
        break;
      case "draw":
        stats.draws++;
        break;
      default:
        console.log(`Unknown result: ${game[color].result}`);
    }
  });
  // update wld if it changed
  // if (wld.value.wins != stats.wins)
  wld.value = stats;
}

function transform_result(result) {
  let r = "";
  switch (result) {
    case "win":
      r = "win";
      break;
    case "lose":
    case "checkmated":
    case "resigned":
    case "timeout":
    case "abandoned":
    case "bughousepartnerlose":
      r = "lose";
      break;
    case "agreed":
    case "timevsinsufficient":
    case "repetition":
    case "stalemate":
    case "insufficient":
    case "50move":
      r = "draw";
      break;
    default:
      console.log(`Cannot transform unknown result: ${result}`);
  }
  return r;
}

async function get_lichess_data(un) {
  const res = await axios.get(`https://lichess.org/api/user/${un}`);
  console.log(res.data);
  return res.data;
}

function read_settings() {
  // read settings from local storage
  const settings = JSON.parse(localStorage.getItem("settings"));
  if (settings) {
    console.log("⚡ Read settings from local storage", settings);
    selectedFont.value = settings.font;
    selectedSize.value = settings.size;
    background_color.value = settings.background_color;
    font_color.value = settings.font_color;
    username.value = settings.username;
    platform.value = settings.platform;
    wld.value = settings.wld;
    game_settings.value = settings.game_settings;
  }
}

function save_settings() {
  // save settings to local storage
  const settings = {
    font: selectedFont.value,
    size: selectedSize.value,
    background_color: background_color.value,
    font_color: font_color.value,
    platform: platform.value,
    username: username.value,
    wld: wld.value,
    game_settings: game_settings.value,
  };
  console.log("⚡ Saved settings to local storage", settings);
  localStorage.setItem("settings", JSON.stringify(settings));
}

function reset() {
  selectedFont.value = default_settings.font;
  selectedSize.value = default_settings.size;
  background_color.value = default_settings.background_color;
  font_color.value = default_settings.font_color;
  username.value = default_settings.username;
  platform.value = default_settings.platform;
  api.value = default_settings.api;
  api.value.hint = "Enter the username of a player";
  wld.value = default_settings.wld;
}

function save_color(color) {
  console.log(color);
}

function pop_out() {
  window.open(window.location.href, "_blank", "width=800,height=600");
}
</script>

<style scoped></style>
