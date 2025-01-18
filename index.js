import puppeteer from "puppeteer-core";
import episodeDownloader from "./episode-downloader.js";
import commandLineArgs from "command-line-args";

function paginate(array, pageSize, pageNumber) {
  //page number starts from 1
  return array
    .slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
    .reverse();
}

(async () => {
  const options = commandLineArgs([
    { name: "link", alias: "l", type: String, defaultOption: true },
    { name: "startEpisode", alias: "s", type: Number, defaultValue: 1 },
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

  // await page.setViewport({ width: 1080, height: 1024 });
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a.play")).map((a) => a.href);
  });
  await page.close();
  const downloadListSize = 10;
  const numOfDownloadPages = Math.ceil(links.length / downloadListSize);

  for (let i = numOfDownloadPages; i >= 1; i--) {
    const currentDownloadList = paginate(links, downloadListSize, i);
    for (const downloadItem of currentDownloadList) {
      const currentEpisodeNum = Number(
        downloadItem.split("/").reverse()[0].match(/\d/g).join(""),
      );
      console.log({ currentEpisodeNum, startEpisode: options.startEpisode });
      if (currentEpisodeNum < options.startEpisode) continue;
      await episodeDownloader(browser, downloadItem);
    }
  }
  // await browser.close();
  process.exit();
})();
