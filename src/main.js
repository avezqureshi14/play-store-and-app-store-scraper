import store from "app-store-scraper";
import gplay from "google-play-scraper";
import { Actor } from "apify";
import { category } from "./constants/category.js";
import {
  APP_STORE,
  FREE,
  GET_DETAILS,
  GOOGLE_PLAY,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
  PAID,
} from "./constants/actionTypes.js";

// Interface for the app store
class AppStoreInterface {
  async listApps({ selectedCategory, num }) {}
  async listDeveloperApps({ devId }) {}
  async getAppDetails({ appId }) {}
}

// Implementation for the App Store
class AppStore extends AppStoreInterface {
  async listApps({ selectedCategory, num }) {
    const appStoreCategory = category[selectedCategory];
    return await store.list({
      category: appStoreCategory,
      num: num,
    });
  }

  async listDeveloperApps({ devId }) {
    return await store.developer({ devId: devId });
  }

  async getAppDetails({ appId }) {
    return await store.app({ appId: appId });
  }
}

// Implementation for Google Play
class GooglePlayStore extends AppStoreInterface {
  async listApps({ selectedCategory, num }) {
    return await gplay.list({
      category: selectedCategory,
      num: num,
    });
  }

  async listDeveloperApps({ devId }) {
    throw new Error("This parameter only works for App Store");
  }

  async getAppDetails({ appId }) {
    return await gplay.app({ appId: appId });
  }
}

// Function to get the appropriate store instance based on the platform
function getStoreInstance(platform) {
  if (platform === APP_STORE) {
    return new AppStore();
  } else if (platform === GOOGLE_PLAY) {
    return new GooglePlayStore();
  } else {
    throw new Error("Invalid platform");
  }
}

class AppScraper {
  static async listApps({ platform, selectedCategory, limit, priceModel }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const allApps = await storeInstance.list({
        category: selectedCategory,
        num: limit,
      });

      let filteredApps = allApps;

      if (priceModel === FREE) {
        filteredApps = filteredApps.filter((app) => app.free === true);
      } else if (priceModel === PAID) {
        filteredApps = filteredApps.filter((app) => app.free === false);
      }

      await Actor.pushData(filteredApps.slice(0, limit));
    } catch (error) {
      console.error("Error fetching data:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async listDeveloperApps({ platform, devId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const apps = await storeInstance.listDeveloperApps({ devId });
      await Actor.pushData(apps);
    } catch (error) {
      console.error("Error fetching data:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async getAppDetails({ platform, appId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const result = await storeInstance.getAppDetails({ appId });
      await Actor.pushData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      case LIST_APPS:
        await AppScraper.listApps(input);
        break;
      case LIST_DEVELOPER_APPS:
        await AppScraper.listDeveloperApps(input);
        break;
      case GET_DETAILS:
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
