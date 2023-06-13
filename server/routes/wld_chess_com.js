// express js route imports
const express = require("express");
const router = express.Router();

const axios = require("axios");

router.post("/", async (req, res) => {
  try {
    // check body
    if (!req.body.username || !req.body.time_interval || !req.body.game_mode)
      return res.status(400).json({ message: "Bad request!" });

    const date = new Date();

    const time_interval = req.body.time_interval;
    const game_mode = req.body.game_mode;
    const username = req.body.username;

    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) month = `0${month}`;

    const response = await axios.get(
      `https://api.chess.com/pub/player/${username}/games/${year}/${month}`
    );

    // filter games depending on date and mode
    const games = response.data.games.filter((game) => {
      // filter game mode and time interval
      if (
        Array.isArray(game_mode) &&
        game_mode.includes(game.time_class) &&
        check_time_interval(game.end_time, time_interval)
      )
        return true;

      if (
        game.time_class == game_mode &&
        check_time_interval(game.end_time, time_interval)
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
      if (game.white.username.toLowerCase() === username.toLowerCase())
        color = "white";
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

    return res.status(200).json({ status: "success", stats });
  } catch (error) {
    let message = "Server error!";
    if (error?.response?.data?.message) message = error.response.data.message;
    res.status(200).json({ status: "error", message });
  }
});

function check_time_interval(end_time, time_interval) {
  const current_date = Math.floor(Date.now() / 1000);
  // filter games that are not finished
  if (end_time > current_date) return false;
  // filter games depending on time interval
  switch (time_interval) {
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

module.exports = router;
