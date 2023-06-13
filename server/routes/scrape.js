const express = require("express");
const router = express.Router();

const { scrape_chess_com_website } = require("../scraper.js");

router.post("/", async (req, res) => {
  try {
    // check body
    if (!req.body.username || !req.body.time_interval)
      return res.status(400).json({ message: "Bad request!" });

    const data = await scrape_chess_com_website(
      `https://www.chess.com/member/kugelbuch`
    );

    res
      .status(200)
      .json({ status: "success", message: "Scraped Data", content: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server Error", error });
  }
});

module.exports = router;
