const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true, args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto("http://localhost:5174/");
  await page.waitForLoadState("networkidle");
  await page.locator("button:has-text('Visualizar')").click();
  await page.waitForTimeout(300);

  const filePath = path.resolve("E:/Github/My Projects/Emissor_nfse_from_di/format_guidelines/nota_fiscal_1.txt");
  await page.locator('input[type="file"]').setInputFiles(filePath);
  await page.waitForTimeout(1000);

  // Expand HEADER to show novo v2 badges
  await page.locator("button:has-text('HEADER')").click();
  await page.waitForTimeout(400);

  // Scroll to near bottom of expanded header (where new v2 fields are)
  const headerCard = page.locator("div").filter({ hasText: /HEADER/ }).first();
  await headerCard.scrollIntoViewIfNeeded();
  // Scroll down past the table to get to the end of the header fields
  await page.evaluate(() => { window.scrollBy(0, 1200); });
  await page.waitForTimeout(200);
  await page.screenshot({ path: "/tmp/v2_badges.png", clip: { x: 100, y: 300, width: 1300, height: 500 } });

  await browser.close();
  console.log("Done");
})();
