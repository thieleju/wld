const puppeteer = require("puppeteer");
const WebSocket = require("ws");

async function scrape_chess_com_website(url) {
  // start browser
  const browser = await puppeteer.launch({ headless: "new" });
  // open new page
  const page = await browser.newPage();
  // go to url
  await page.goto(url);

  const selector =
    ".ui_v5-button-component.ui_v5-button-danger.ui_v5-button-small";

  const linkButton = await page.waitForSelector(selector, {
    timeout: 60000,
    visible: true,
  });

  // TODO check if button exists

  const link = await page.evaluate((el) => el.href, linkButton);

  // live link
  console.log(link);
  await page.goto(link);

  // Warte auf das Auftauchen des WebSocket-URL-Elements auf der Seite
  // await page.waitForNetworkIdle();
  const selector_wss = ".sidebar-component:not(.sidebar-loading)";

  const wss = await page.waitForSelector(selector_wss);
  // await delay(6000);

  const opponentSelector =
    ".user-username-component.user-username-white.user-username-link.user-tagline-username";

  // Warte, bis das Element mit dem Selector aktualisiert wurde
  await page.waitForFunction(
    (selector) => {
      const element = document.querySelector(selector);
      return element && element.textContent !== "";
    },
    { timeout: 60000 },
    opponentSelector
  );

  // Lese den aktualisierten Inhalt des Elements
  const updatedContent = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    return element ? element.textContent : "";
  }, opponentSelector);

  console.log("Aktualisierter Inhalt:", updatedContent);

  // close browser
  await browser.close();
  // return page content
  return "";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  scrape_chess_com_website,
};
