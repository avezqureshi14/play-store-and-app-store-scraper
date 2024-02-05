import store from "app-store-scraper";
import gplay from "google-play-scraper";
import { Actor } from "apify";
import { category } from "./constants/category.js";

class AppStore {
  static async listApps({ appStoreCategory, limit, priceModel }) {
    const selectedCategory = category[appStoreCategory];
    try {
      const allApps = await store.list({
        category: selectedCategory,
        num: limit
      });

      let filteredApps = allApps;

      if (priceModel === "FREE") {
        filteredApps = filteredApps.filter((app) => app.free === true);
      } else if (priceModel === "PAID") {
        filteredApps = filteredApps.filter((app) => app.free === false);
      }

      await Actor.pushData(filteredApps.slice(0, limit));
    } catch (error) {
      console.error("Error fetching data from App Store:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async listDeveloperApps({ devId }) {
    try {
      const apps = await store.developer({ devId: devId });
      await Actor.pushData(apps);
    } catch (error) {
      console.error("Error fetching data from App Store:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async getAppDetails({ appId }) {
    try {
      const result = await store.app({ appId: appId });
      await Actor.pushData(result);
    } catch (error) {
      console.error("Error fetching data from App Store:", error);
      await Actor.pushData({ error: "Internal Server Error" });
    }
  }
}

class GooglePlay {
  static async listApps({ playStoreCategory, playStorePopularity, limit, priceModel }) {
    try {
      const allApps = await gplay.list({
        category: playStoreCategory,
        collection: playStorePopularity,
        num: limit,
      });

      let filteredApps = allApps;

      if (priceModel === "FREE") {
        filteredApps = filteredApps.filter((app) => app.free === true);
      } else if (priceModel === "PAID") {
        filteredApps = filteredApps.filter((app) => app.free === false);
      }

      await Actor.pushData(filteredApps.slice(0, limit));
    } catch (error) {
      console.error("Error fetching data from Google Play:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async getAppDetails({ appId }) {
    try {
      const result = await gplay.app({ appId: appId });
      await Actor.pushData(result);
    } catch (error) {
      console.error("Error fetching data from Google Play:", error);
      await Actor.pushData({ error: "Internal Server Error" });
    }
  }
}

const runActor = async () => {
  await Actor.init();

  const input = await Actor.getInput();
  const { action } = input;

  try {
    switch (action) {
      case "LIST_APP_STORE_APPS":
        await AppStore.listApps(input);
        break;
      case "LIST_APP_STORE_DEVELOPER_APPS":
        await AppStore.listDeveloperApps(input);
        break;
      case "GET_APP_STORE_APP_DETAILS":
        await AppStore.getAppDetails(input);
        break;
      case "LIST_GOOGLE_PLAY_APPS":
        await GooglePlay.listApps(input);
        break;
      case "GET_GOOGLE_PLAY_APP_DETAILS":
        await GooglePlay.getAppDetails(input);
        break;
      default:
        console.error("Invalid action specified in input.");
        await Actor.pushData({ error: "Invalid action specified." });
        break;
    }
  } catch (error) {
    console.error("Error processing input:", error);
    await Actor.pushData({ error: "Internal Server Error" });
  }

  await Actor.exit();
};

runActor();
