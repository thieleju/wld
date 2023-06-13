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
                v-model="platform.chess_com"
                color="primary"
                readonly
                :label="platform.label"
                :items="platform_items"
              ></v-switch>
            </v-col>
            <!-- GAME SETTINGS -->
            <v-col cols="6">
              <v-autocomplete
                v-model="game_settings.mode"
                label="Game Modes"
                multiple
                prepend-icon="mdi-lightning-bolt"
                :items="game_settings_items"
                @update:modelValue="update_data"
              ></v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-autocomplete
                v-model="game_settings.time_interval"
                label="WLD Interval"
                prepend-icon="mdi-clock-outline"
                :items="game_settings_time_intervals"
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
          <v-btn color="primary" @click="open_github">
            <v-icon class="px-3">mdi-github </v-icon>
            GitHub</v-btn
          >
          <v-spacer></v-spacer>
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

  <!-- SNACKBAR -->
  <v-snackbar
    v-model="snackbar"
    :timeout="1500"
    variant="outlined"
    color="primary"
  >
    <v-icon left>mdi-check-circle-outline</v-icon>
    {{ snackbar_text }}
  </v-snackbar>

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
    label: "chess.com",
  },
  game_settings: {
    mode: ["rapid", "blitz"],
    time_interval: "last 24 hours",
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

const platform_items = ref(["chess.com", "lichess.org"]);
const game_settings_items = ref(["blitz", "rapid", "bullet", "daily"]);
const game_settings_time_intervals = ref([
  "last 1 hour",
  "last 6 hours",
  "last 12 hours",
  "last 24 hours",
  "today",
  "this month",
]);

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

const update_interval = ref(10000);
const snackbar = ref(false);
const snackbar_text = ref("");

onMounted(() => {
  read_settings();
  update_data();

  // set update interval to 10 seconds
  setInterval(() => {
    update_data();
  }, update_interval.value);
});

watch(
  () => platform.value.chess_com,
  (val) => {
    if (val) platform.value.label = platform_items.value[0];
    else platform.value.label = platform_items.value[1];
    update_data();
  }
);

async function update_data() {
  if (!username.value) return;

  api.value.loading = true;
  try {
    await get_data(username.value);
    api.value.hint = `Showing WLD for ${username.value}`;
  } catch (error) {
    console.log(error);
    api.value.hint = `Failed to fetch WLD`;
  } finally {
    api.value.loading = false;
    // update page title
    document.title = `${wld.value.wins}/${wld.value.loses}/${wld.value.draws} - WLD`;
  }
}

async function get_data(un) {
  if (!un) return;
  let stats = {};
  if (platform.value.chess_com) stats = await get_chess_com_data(un);
  else return (stats = await get_lichess_data(un));

  // update wld
  wld.value = stats;
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
  const games = res.data.games.filter((game) => {
    // filter game mode and time interval
    if (
      Array.isArray(game_settings.value.mode) &&
      game_settings.value.mode.includes(game.time_class) &&
      check_time_interval(game.end_time)
    )
      return true;

    if (
      game.time_class == game_settings.value.mode &&
      check_time_interval(game.end_time)
    )
      return true;
    else return false;
  });
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
  return stats;
}

function check_time_interval(end_time) {
  const current_date = Math.floor(Date.now() / 1000);
  // filter games that are not finished
  if (end_time > current_date) return false;
  // filter games depending on time interval
  switch (game_settings.value.time_interval) {
    case "last 1 hour":
      if (end_time > current_date - 3600) return true;
      else return false;
      break;
    case "last 6 hours":
      if (end_time > current_date - 21600) return true;
      else return false;
      break;
    case "last 12 hours":
      if (end_time > current_date - 43200) return true;
      else return false;
      break;
    case "last 24 hours":
      if (end_time > current_date - 86400) return true;
      else return false;
      break;
    case "today":
      // get current amount of seconds of current day
      const current_day = new Date();
      const current_day_seconds =
        current_day.getHours() * 3600 +
        current_day.getMinutes() * 60 +
        current_day.getSeconds();
      if (end_time > current_date - current_day_seconds) return true;
      else return false;
    case "this month":
      return true;
    default:
      return false;
  }
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
  const since = 1356998400070;
  const res = await axios.get(
    `https://lichess.org/api/games/user/${un}?since=${since}&max=10&moves=false`,
    {
      headers: {
        Accept: "application/x-ndjson",
      },
    }
  );

  // parse input
  const parsed = parseInput(res.data);

  console.log(parsed);

  let stats = {
    wins: 0,
    loses: 0,
    draws: 0,
  };

  return stats;
}

function parseInput(input) {
  const lines = input.trim().split("\n");
  const result = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      result.push(obj);
    } catch (error) {
      console.error(`Error parsing line: ${line}`);
    }
  }
  return result;
}

function get_time_interval_lichess() {
  switch (game_settings.value.time_interval) {
    case "last 1 hour":
      break;
    case "last 6 hours":
      break;
    case "last 12 hours":
      break;
    case "last 24 hours":
      break;
    case "today":
    // get current amount of seconds of current day

    case "this month":

    default:
      return false;
  }
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

    // show snackbar
    snackbar.value = true;
    snackbar_text.value = "Settings loaded";
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

  // show snackbar
  snackbar.value = true;
  snackbar_text.value = "Settings saved";
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
  game_settings.value.time_interval =
    default_settings.game_settings.time_interval;
  game_settings.value.mode = default_settings.game_settings.mode;

  // show snackbar
  snackbar.value = true;
  snackbar_text.value = "Reset settings";
}

function pop_out() {
  window.open(window.location.href, "_blank", "width=600,height=750");
}

function open_github() {
  window.open("https://github.com/thieleju/wld", "_blank");
}
</script>

<style scoped></style>
