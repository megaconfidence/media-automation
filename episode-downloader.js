async function episodeDownloader(browser, episodeLink) {
  const page = await browser.newPage();
  await page.goto(episodeLink, { waitUntil: "domcontentloaded" });
  await page.setViewport({ width: 1080, height: 1024 });

  //inside jw player iframe
  const iframeSelector = 'iframe[id="video"]';
  const iframeElementHandle = await page.waitForSelector(iframeSelector);
  const iframe = await iframeElementHandle.contentFrame();
  const playButtonSelector = 'div[aria-label="Play"]';
  await iframe.waitForSelector(playButtonSelector);
  await iframe.click(playButtonSelector);
  const pauseButtonSelector = 'div.jw-icon-playback[aria-label="Play"]';
  await iframe.click(pauseButtonSelector);
  const downloadButtonSelector = 'div[aria-label="Download Video"]';
  await iframe.click(downloadButtonSelector);
  await page.close();
  const newWindowTarget = await browser.waitForTarget((target) =>
    target.url().includes("s3embtaku.pro"),
  );

  //final download page - black screen
  const downloadPage = await newWindowTarget.page();
  const downloadLinksSelector = 'a[download=""]';
  await downloadPage.waitForSelector(downloadLinksSelector);
  const downloadLinks = await downloadPage.evaluate((downloadLinksSelector) => {
    return Array.from(document.querySelectorAll(downloadLinksSelector))
      .reverse()
      .map((a) => a.href);
  }, downloadLinksSelector);
  await downloadPage.close();

  //browser downloader process
  const downloaderPage = (await browser.pages())[0];
  let redirectErr1080p;
  let redirectErr720p;
  //download 1080p
  try {
    await downloaderPage.goto(downloadLinks[0]);
  } catch (error) {
    redirectErr1080p = error.message.substring(0, 25);
  }
  //if download redirect for 1080p does not fail
  //download didn't go through. Try downloading 720p
  if (!redirectErr1080p) {
    try {
      await downloaderPage.goto(downloadLinks[1]);
    } catch (error) {
      redirectErr720p = error.message.substring(0, 25);
    }
  }
  console.log({
    downloading: episodeLink,
    "1080p": redirectErr1080p,
    "720p": redirectErr720p,
  });
}

export default episodeDownloader;
