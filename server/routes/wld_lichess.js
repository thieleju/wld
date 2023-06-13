const express = require("express");
const router = express.Router();

const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    // check body
    if (!req.body.username || !req.body.time_interval || !req.body.game_mode)
      return res.status(400).json({ message: "Bad request!" });

    const time_interval = req.body.time_interval;
    const game_mode = req.body.game_mode;
    const username = req.body.username;

    const since = get_timestamp_since(time_interval);

    const response = await axios.get(
      `https://lichess.org/api/games/user/${username}?since=${since}&moves=false`,
      {
        headers: {
          Accept: "application/x-ndjson",
        },
      }
    );

    // parse input
    const parsed = parseInput(response.data);

    // filter games depending on mode
    const games = filter_games(parsed, game_mode);

    // get stats from games
    const stats = get_stats(games, username);

    res.status(200).json({ status: "success", stats });
  } catch (error) {
    let message = "Server error!";
    if (error?.response?.data?.error) message = error.response.data.error;
    res.status(200).json({ status: "error", message });
  }
});

function get_stats(games, username) {
  let stats = {
    wins: 0,
    loses: 0,
    draws: 0,
  };
  games.forEach((game) => {
    // get color of player
    let color = "";
    if (game.players.white.user.name.toLowerCase() === username.toLowerCase())
      color = "white";
    else color = "black";

    // count wins, loses and draws
    if (game.status === "draw") stats.draws++;
    if (game.winner === color) stats.wins++;
    else stats.loses++;
  });
  return stats;
}

function filter_games(games, game_mode) {
  const filtered_games = games.filter((game) => {
    // filter game mode
    if (game_mode.includes(game.speed)) return true;
    else return false;
  });
  return filtered_games;
}

function get_timestamp_since(time_interval) {
  switch (time_interval) {
    case "last 1 hour":
      return get_timestamp_before_hours(1);
    case "last 6 hours":
      return get_timestamp_before_hours(6);
    case "last 12 hours":
      return get_timestamp_before_hours(12);
    case "last 24 hours":
      return get_timestamp_before_hours(24);
    case "today":
      return get_timestamp_beginning_of_day();
    case "this month":
      return get_timestamp_beginning_of_month();
    default:
      return false;
  }
}

function get_timestamp_before_hours(hours) {
  return new Date().getTime() - hours * 60 * 60 * 1000;
}

function get_timestamp_beginning_of_month() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const beginningOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
  return beginningOfMonth.getTime();
}

function get_timestamp_beginning_of_day() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  return currentDate.getTime();
}

function parseInput(input) {
  const lines = input.trim().split("\n");
  const result = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      result.push(obj);
    } catch (error) {}
  }
  return result;
}

module.exports = router;
