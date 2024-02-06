import store from 'app-store-scraper';
import gplay from 'google-play-scraper';
import { Actor } from 'apify';
import { category } from './constants/category.js';
import {
  APP_STORE,
  FREE,
  GET_DETAILS,
  GOOGLE_PLAY,
  LIST_APPS,
  LIST_DEVELOPER_APPS,
  PAID,
} from './constants/actionTypes.js';

// Interface for the app store
class ScrapperInterface {
  async listApps({ selectedCategory, num }) {}
  async listDeveloperApps({ devId }) {}
  async getAppDetails({ appId }) {}
}

// Implementation for the App Store
class AppStore extends ScrapperInterface {
  async listApps({ selectedCategory, num }) {
    const appStoreCategory = category[selectedCategory];
    return await store.list({
      category: appStoreCategory,
      num,
    });
  }

  async listDeveloperApps({ devId }) {
    return await store.developer({ devId });
  }

  async getAppDetails({ appId }) {
    return await store.app({ appId });
  }
}

// Implementation for Google Play
class GooglePlayStore extends ScrapperInterface {
  async listApps({ selectedCategory, num }) {
    return await gplay.list({
      category: selectedCategory,
      num,
    });
  }

  async listDeveloperApps({ devId }) {
    throw new Error('This parameter only works for App Store');
  }

  async getAppDetails({ appId }) {
    return await gplay.app({ appId });
  }
}

// Function to get the appropriate store instance based on the platform
function getStoreInstance(platform) {
  switch (platform) {
    case APP_STORE:
      return new AppStore();
    case GOOGLE_PLAY:
      return new GooglePlayStore();
    default:
      throw new Error('Invalid platform');
  }
}

// Utility function for logging errors
function logError(error) {
  console.error('Error fetching data:', error);
  return { error: error.message || 'Internal Server Error' };
}

class AppScraper {
  static async listApps({ platform, selectedCategory, limit, priceModel }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const allApps = await storeInstance.listApps({
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
      await Actor.pushData(logError(error));
    }
  }

  static async listDeveloperApps({ platform, devId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const apps = await storeInstance.listDeveloperApps({ devId });
      await Actor.pushData(apps);
    } catch (error) {
      await Actor.pushData(logError(error));
    }
  }

  static async getAppDetails({ platform, appId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const result = await storeInstance.getAppDetails({ appId });
      await Actor.pushData(result);
    } catch (error) {
      await Actor.pushData(logError(error));
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
        await Actor.pushData(logError(new Error('Invalid action specified in input.')));
        break;
    }
  } catch (error) {
    await Actor.pushData(logError(error));
  }

  await Actor.exit();
};

runActor();
