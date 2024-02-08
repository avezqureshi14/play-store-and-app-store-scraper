import store from 'app-store-scraper';
import gplay from 'google-play-scraper';
import { Actor } from 'apify';
import { storeCategory } from './constants/storeCategory.js';
import { gplayCategory } from './constants/gplayCategory.js';
import { APP_STORE, FREE, GET_DETAILS, GOOGLE_PLAY, LIST_APPS, LIST_DEVELOPER_APPS, PAID } from './constants/actionTypes.js';
import { logError } from './utility/logError.js';

// This is Interface for Scraper
class ScraperInterface {
  async listApps({ selectedCategory, num }) {}
  async listDeveloperApps({ devId }) {}
  async getAppDetails({ appId }) {}
}

// This is Implementation for the App Store
class AppStore extends ScraperInterface {
  async listApps({ selectedCategory, num }) {
    const appStoreCategory = storeCategory[selectedCategory];
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

// This is Implementation for Google Play
class GooglePlayStore extends ScraperInterface {
  async listApps({ selectedCategory, num }) {
    return await gplay.list({
      category: gplayCategory[selectedCategory],
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

// Factory class for creating store instances
class ScraperFactory {
  static getScraperInstance(platform) {
    switch (platform) {
      case APP_STORE:
        return new AppStore();
      case GOOGLE_PLAY:
        return new GooglePlayStore();
      default:
        throw new Error('Invalid platform');
    }
  }
}

class AppScraper {
  constructor(storeInstance) {
    this.storeInstance = storeInstance;
  }

  async listApps({ selectedCategory, limit, priceModel }) {
    try {
      const allApps = await this.storeInstance.listApps({
        selectedCategory,
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

  async listDeveloperApps({ devId }) {
    try {
      const apps = await this.storeInstance.listDeveloperApps({ devId });
      await Actor.pushData(apps);
    } catch (error) {
      await Actor.pushData(logError(error));
    }
  }

  async getAppDetails({ appId }) {
    try {
      const result = await this.storeInstance.getAppDetails({ appId });
      await Actor.pushData(result);
    } catch (error) {
      await Actor.pushData(logError(error));
    }
  }
}

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;

    const storeInstance = ScraperFactory.getScraperInstance(platform);
    const appScraper = new AppScraper(storeInstance);

    switch (action) {
      case LIST_APPS:
        await appScraper.listApps(input);
        break;
      case LIST_DEVELOPER_APPS:
        await appScraper.listDeveloperApps(input);
        break;
      case GET_DETAILS:
        await appScraper.getAppDetails(input);
        break;
      default:
        await Actor.pushData(logError(new Error('Invalid action specified in input.')));
        break;
    }
  } catch (error) {
    await Actor.pushData(logError(error));
  } finally {
    await Actor.exit();
  }
};

runActor();
