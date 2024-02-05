import store from "app-store-scraper";
import gplay from "google-play-scraper";
import { Actor } from "apify";
import { category } from "./constants/category.js";

class AppScraper {
  static async listApps({ storeType, devId, limit, priceModel, action, appId, playStoreCategory, playStorePopularity }) {
    try {
      let allApps;

      if (storeType === "APP_STORE") {
        if (action === "LIST_APPS") {
          const selectedCategory = category[playStoreCategory];
          allApps = await store.list({
            category: selectedCategory,
            num: limit
          });
        } else if (action === "LIST_DEVELOPER_APPS") {
          allApps = await store.developer({ devId: devId });
        } else if (action === "GET_DETAILS") {
          const result = await store.app({ appId: appId });
          await Actor.pushData(result);
          return;
        }
      } else if (storeType === "GOOGLE_PLAY") {
        if (action === "LIST_APPS") {
          allApps = await gplay.list({
            category: playStoreCategory,
            collection: playStorePopularity,
            num: limit,
          });
        } else if (action === "GET_DETAILS") {
          const result = await gplay.app({ appId: appId });
          await Actor.pushData(result);
          return;
        }
      }

      let filteredApps = allApps;

      if (priceModel === "FREE") {
        filteredApps = filteredApps.filter((app) => app.free === true);
      } else if (priceModel === "PAID") {
        filteredApps = filteredApps.filter((app) => app.free === false);
      }

      await Actor.pushData(filteredApps.slice(0, limit));
    } catch (error) {
      console.error(`Error fetching data from ${storeType}:`, error);
      await Actor.pushData({ error: error.message });
    }
  }
}

const runActor = async () => {
  await Actor.init();

  const input = await Actor.getInput();
  const { storeType, action } = input;

  try {
    await AppScraper.listApps(input);
  } catch (error) {
    console.error(`Error processing input: ${error}`);
    await Actor.pushData({ error: "Internal Server Error" });
  }

  await Actor.exit();
};

runActor();
