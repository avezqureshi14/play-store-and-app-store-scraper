import gplay from "google-play-scraper";
import { Actor } from 'apify';

const runActor = async () => {
  await Actor.init();

  let result = [];

  const { appId } = await Actor.getInput();

  try {
    result = await gplay.app({ appId: appId });
  } catch (error) {
    console.error("Error fetching data from Google Play:", error);
    await Actor.pushData({ error: "Internal Server Error" });
  }

  await Actor.pushData(result);
  await Actor.exit();
};

runActor();
