// AppScraper.js
import Actor from 'apify';
import getStoreInstance from './getStoreInstance';
import { FREE, PAID } from '../constants/actionTypes';

export default class AppScraper {
  static async listApps({ platform, selectedCategory, limit, priceModel }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const allApps = await storeInstance.listApps({
        selectedCategory: selectedCategory,
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
      console.error('Error fetching data:', error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async listDeveloperApps({ platform, devId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const apps = await storeInstance.listDeveloperApps({ devId });
      await Actor.pushData(apps);
    } catch (error) {
      console.error('Error fetching data:', error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async getAppDetails({ platform, appId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const result = await storeInstance.getAppDetails({ appId });
      await Actor.pushData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      await Actor.pushData({ error: 'Internal Server Error' });
    }
  }
}
