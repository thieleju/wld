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
        <v-tabs v-model="tabs" color="primary" align-tabs="center" grow>
          <v-tab value="0">user</v-tab>
          <v-tab value="1">opponent</v-tab>
        </v-tabs>
        <v-divider></v-divider>
        <v-card-text>
          <v-window v-model="tabs">
            <v-window-item value="0">
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
                    @input="get_data"
                  ></v-text-field>
                </v-col>
                <!-- PLATFORM V SWITCH -->
                <v-col cols="4">
                  <v-switch
                    v-model="platform.chess_com"
                    color="primary"
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
                    @update:modelValue="get_data"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="6">
                  <v-autocomplete
                    v-model="game_settings.time_interval"
                    label="WLD Interval"
                    prepend-icon="mdi-clock-outline"
                    :items="game_settings_time_intervals"
                    @update:modelValue="get_data"
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
            </v-window-item>
            <v-window-item value="1">
              <p class="text-h3 text-center">Coming soon</p>
              <v-col cols="12">
                <v-text-field
                  v-model="opponent_username"
                  label="Username"
                  persistent-hint
                  prepend-icon="mdi-account"
                  @input="update_data_opponent"
                ></v-text-field>
              </v-col>
            </v-window-item>
          </v-window>
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
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "../plugins/axios";

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

const tabs = ref(null);

const opponent_username = ref("");

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
  get_data();

  // set update interval to 10 seconds
  setInterval(() => {
    get_data();
  }, update_interval.value);
});

watch(
  () => platform.value.chess_com,
  (val) => {
    if (val) platform.value.label = platform_items.value[0];
    else {
      platform.value.label = platform_items.value[1];

      //show snackbar info
      snackbar.value = true;
      snackbar_text.value = "Lichess is username case sensitive!";
    }
    get_data();
  }
);

watch(
  () => username.value,
  (val) => {
    if (val.length == 0) {
      wld.value = default_settings.wld;
      api.value.hint = "Enter the username of a player";
    }
  }
);

async function update_data_opponent() {
  // get current live game of opponent_username
  if (!opponent_username.value) return;
}

async function get_data() {
  if (username.value.length == 0) return;

  api.value.loading = true;
  api.value.hint = `Fetching WLD...`;

  let res = {};
  try {
    if (platform.value.chess_com) {
      // get wld from chess.com
      res = await axios.post("/wld_chess_com", {
        username: username.value,
        game_mode: game_settings.value.mode,
        time_interval: game_settings.value.time_interval,
      });
    } else {
      // get wld from lichess
      res = await axios.post("/wld_lichess", {
        username: username.value,
        game_mode: game_settings.value.mode,
        time_interval: game_settings.value.time_interval,
      });
    }

    // check if response was successful
    if (res.data.status == "success") {
      wld.value = res.data.stats;
      api.value.hint = `Showing WLD for ${username.value}`;
    } else {
      api.value.hint = `Could not find user ${username.value}`;
      wld.value = {
        wins: 0,
        loses: 0,
        draws: 0,
      };
    }
  } catch (err) {
    api.value.hint = `Error fetching WLD for ${username.value}`;
    wld.value = {
      wins: 0,
      loses: 0,
      draws: 0,
    };
  } finally {
    document.title = `${wld.value.wins}/${wld.value.loses}/${wld.value.draws} - WLD`;
    api.value.loading = false;
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
  // close current tab
  window.close();
}

function open_github() {
  window.open("https://github.com/thieleju/wld", "_blank");
}
</script>

<style scoped></style>
