const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT;

const frontend_url =
  process.env.NODE_ENV === "development"
    ? process.env.FRONTEND_URL_DEV
    : process.env.FRONTEND_URL_PROD;

// Enable CORS
app.use(
  cors({
    origin: frontend_url,
    optionsSuccessStatus: 200,
    methods: "POST",
  })
);

// parse json
app.use(express.json());

// import routes
app.use("/wld_chess_com", require("./routes/wld_chess_com.js"));
app.use("/wld_lichess", require("./routes/wld_lichess.js"));
// app.use("/scrape", require("./routes/scrape.js"));

// fallback route
app.get("*", (req, res) => {
  res.status(404).json({ message: "Route not found!" });
});

// start server
app.listen(port, () => {
  log(`In mode ${process.env.NODE_ENV}`);
  log(`App listening on port ${port}!`);
});

// print with timestamp
function log(msg) {
  console.log(`${new Date().toISOString()} | ${msg}`);
}

module.exports = {
  log,
  frontend_url,
};
