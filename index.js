import puppeteer from "puppeteer-core";
import episodeDownloader from "./episode-downloader.js";

function paginate(array, pageSize, pageNumber) {
  //page number starts from 1
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}
(async () => {
  const browser = await puppeteer.connect({
    headless: false,
    browserURL: "http://localhost:9222",
    // browserWSEndpoint:
    // "ws://127.0.0.1:9222/devtools/browser/f1ed9cc2-959f-49ee-896f-e9b4d0217d28",
  });
  const page = await browser.newPage();

  const seriesLink = "https://w7.animeland.tv/category/one-piece";
  await page.goto(seriesLink, {
    waitUntil: "domcontentloaded",
  });

  await page.setViewport({ width: 1080, height: 1024 });
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a.play")).map((a) => a.href);
  });
  await page.close();
  const downloadListSize = 10;
  const numOfDownloadPages = Math.ceil(links.length / downloadListSize);

  // for (let i = 1; i <= numOfDownloadPages; i++) {
  //   const currentDownloadList = paginate(links, downloadListSize, i);
  //   console.log({ currentPage });
  //
  // }
  const currentDownloadList = paginate(links, downloadListSize, 1);
  for (const downloadItem of currentDownloadList) {
    await episodeDownloader(browser, downloadItem);
  }

  // await browser.close();
  process.exit();
})();
