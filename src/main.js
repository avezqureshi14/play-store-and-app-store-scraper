import store from "app-store-scraper";
import gplay from "google-play-scraper";
import { Actor } from "apify";
import { storeCategory } from "./constants/storeCategory.js";
import { gplayCategory } from "./constants/gplayCategory.js";
import {
  APP_STORE,
  GET_DETAILS,
  GOOGLE_PLAY,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { storeCollection } from "./constants/storeCollection.js";
import { countries } from "./constants/countries.js";

// This is Interface for Scraper
class ScraperInterface {
  async listApps({ selectedCollection, selectedCategory, num,selectedCountry }) {}
  async listDeveloperApps({ devId }) {}
  async getAppDetails({ appId }) {}
}

// This is Implementation for the App Store
class AppStore extends ScraperInterface {
  async listApps({
    selectedCollection,
    selectedCategory,
    num,
    selectedCountry,
  }) {
    const appStoreCategory = storeCategory[selectedCategory];
    const appStoreCollection = storeCollection[selectedCollection];
    const appStoreCountry = countries[selectedCountry];
    const allApps = await store.list({
      category: appStoreCategory,
      collection: appStoreCollection, 
      num,
    });

    // Filter apps based on price if needed
    return allApps;
  }

  async listDeveloperApps({ devId }) {
    return await store.developer({ devId });
  }

  async getAppDetails({ appId }) {
    return await store.app({ appId });
  }
}

// This is Implementation for Google Play
class GooglePlayStore extends ScraperInterface {
  async listApps({
    selectedCollection,
    selectedCategory,
    num,
    selectedCountry,
  }) { 
    const playStoreCountry = countries[selectedCountry];

    return await gplay.list({
      category: gplayCategory[selectedCategory],
      num,
    });
  }

  async listDeveloperApps({ devId }) {
    throw new Error("This parameter only works for App Store");
  }

  async getAppDetails({ appId }) {
    return await gplay.app({ appId });
  }
}

// Factory class for creating store instances
class ScraperFactory {
  static getScraperInstance(platform) {
    switch (platform) {
      case APP_STORE:
        return new AppStore();
      case GOOGLE_PLAY:
        return new GooglePlayStore();
      default:
        throw new Error("Invalid platform");
    }
  }
}

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;

    const storeInstance = ScraperFactory.getScraperInstance(platform);

    switch (action) {
      case LIST_APPS:
        const apps = await storeInstance.listApps(input);
        await Actor.pushData(apps.slice(0, input.limit));
        break;
      case LIST_DEVELOPER_APPS:
        await Actor.pushData(await storeInstance.listDeveloperApps(input));
        break;
      case GET_DETAILS:
        await Actor.pushData(await storeInstance.getAppDetails(input));
        break;
      default:
        await Actor.pushData(
          logError(new Error("Invalid action specified in input."))
        );
        break;
    }
  } catch (error) {
    await Actor.pushData(logError(error));
  } finally {
    await Actor.exit();
  }
};

runActor();
