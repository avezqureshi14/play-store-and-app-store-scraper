// AppStore.js
import ScraperInterface from './ScraperInterface';
import store from 'app-store-scraper';
import { category } from '../constants/category';

export default class AppStore extends ScraperInterface {
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
