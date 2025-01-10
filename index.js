import puppeteer from "puppeteer";

function paginate(array, pageSize, pageNumber) {
  //page number starts from 1
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}
(async () => {
  // const browser = await puppeteer.launch({ headless: false });

  const browser = await puppeteer.connect({ browserURL });
  const page = await browser.newPage();

  await page.goto("https://w7.animeland.tv/category/one-piece", {
    waitUntil: "domcontentloaded",
  });

  await page.setViewport({ width: 1080, height: 1024 });
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a.play")).map((a) => a.href);
  });
  const downloadListSize = 10;
  const numOfDownloadPages = Math.ceil(links.length / downloadListSize);

  // for (let i = 1; i <= numOfDownloadPages; i++) {
  //   const currentDownloadList = paginate(links, downloadListSize, i);
  //   console.log({ currentPage });
  //
  // }
  const currentDownloadList = paginate(links, downloadListSize, 1);
  for (const downloadItem of currentDownloadList) {
    const page = await browser.newPage();
    await page.goto(downloadItem, { waitUntil: "domcontentloaded" });

    const playButtonSelector = 'div[aria-label="Play"]';
    await page.waitForSelector(playButtonSelector);
    await page.click(playButtonSelector);
    const pauseButtonSelector = 'div.jw-icon-playback[aria-label="Play"]';
    await page.click(pauseButtonSelector);

    console.log(downloadItem);
  }

  await browser.close();
})();
