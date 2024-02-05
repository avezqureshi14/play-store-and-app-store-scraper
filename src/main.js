import store from "app-store-scraper";
import gplay from "google-play-scraper";
import { Actor } from "apify";
import { category } from "./constants/category.js";

class AppScraper {
  static async listApps({ storeType, selectedCategory, limit, priceModel }) {
    const appStoreCategory = category[selectedCategory];
    try {
      let allApps;
      if (storeType === "APP_STORE") {
        allApps = await store.list({
          category: appStoreCategory,
          num: limit,
        });
      } else if (storeType === "GOOGLE_PLAY") {
        allApps = await gplay.list({
          category: selectedCategory,
          num: limit,
        });
      }
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

  static async listDeveloperApps({ storeType, devId }) {
    if (storeType === "APP_STORE") {
      try {
        const apps = await store.developer({ devId: devId });
        await Actor.pushData(apps);
      } catch (error) {
        console.error("Error fetching data from App Store:", error);
        await Actor.pushData({ error: error.message });
      }
    } else {
      await Actor.pushData({
        error: "This parameter only works for App Store",
      });
    }
  }

  static async getAppDetails({ storeType, appId }) {
    try {
      let result;
      if (storeType === "GOOGLE_PLAY") {
        result = await store.app({ appId: appId });
      } else if (storeType === "APP_STORE") {
        result = await gplay.app({ appId: appId });
      }
      await Actor.pushData(result);
    } catch (error) {
      console.error("Error fetching data from App Store:", error);
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
      case "LIST_APPS":
        await AppScraper.listApps(input);
        break;
      case "LIST_DEVELOPER_APPS":
        await AppScraper.listDeveloperApps(input);
        break;
      case "GET_DETAILS":
        await AppScraper.getAppDetails(input);
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
