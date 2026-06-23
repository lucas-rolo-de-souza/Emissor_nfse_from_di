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

  // Upload the v2 file
  const filePath = path.resolve("E:/Github/My Projects/Emissor_nfse_from_di/format_guidelines/nota_fiscal_1.txt");
  await page.locator('input[type="file"]').setInputFiles(filePath);
  await page.waitForTimeout(1000);

  // Screenshot summary bar — should show layout badge
  await page.screenshot({ path: "/tmp/v2_summary.png", clip: { x: 0, y: 100, width: 1400, height: 250 } });

  // Expand the header and scroll to the bottom fields (new v2 fields)
  await page.locator("button:has-text('HEADER')").click();
  await page.waitForTimeout(400);

  // Scroll to bottom of page to see the new v2 fields
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "/tmp/v2_newfields.png", clip: { x: 0, y: 400, width: 1400, height: 500 } });

  // Screenshot the download button area
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "/tmp/v2_header_bar.png", clip: { x: 0, y: 60, width: 1400, height: 100 } });

  // Open the download menu
  await page.locator('[aria-label="Mais opções de download"]').click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: "/tmp/v2_download_menu.png", clip: { x: 900, y: 60, width: 500, height: 200 } });

  await browser.close();
  console.log("Done");
})();
