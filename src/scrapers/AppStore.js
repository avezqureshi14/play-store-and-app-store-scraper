import { ScraperInterface } from "./ScraperInterface";
import { category } from "../constants/category";
import store from 'app-store-scraper';

export class AppStore extends ScraperInterface {
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