import puppeteer from "puppeteer-core";
import episodeDownloader from "./episode-downloader.js";
import commandLineArgs from "command-line-args";

function paginate(array, pageSize, pageNumber) {
  //page number starts from 1
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

(async () => {
  const options = commandLineArgs([
    { name: "link", alias: "l", type: String, defaultOption: true },
  ]);
  const browser = await puppeteer.connect({
    headless: false,
    browserURL: "http://localhost:9222",
  });
  const page = await browser.newPage();

  const seriesLink = options.link;
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

  for (let i = 1; i <= numOfDownloadPages; i++) {
    const currentDownloadList = paginate(links, downloadListSize, i);
    for (const downloadItem of currentDownloadList) {
      await episodeDownloader(browser, downloadItem);
    }
  }
  // await browser.close();
  process.exit();
})();
