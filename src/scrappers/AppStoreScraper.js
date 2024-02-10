import { ScraperInterface } from "./scraperInterface.js";
import { storeCategory } from "../constants/storeCategory.js";
import { storeCollection } from "../constants/storeCollection.js";
import { countries } from "../constants/countries.js";
import store from "app-store-scraper";
import { appStoreSort } from "../constants/sort.js";

export class AppStore extends ScraperInterface {
    async listApps({
      selectedCollection,
      selectedCategory,
      num,
      selectedCountry,
      selectedSort
    }) {
      const appStoreCategory = storeCategory[selectedCategory];
      const appStoreCollection = storeCollection[selectedCollection];
      const appStoreCountry = countries[selectedCountry];
      const appStoreSort = appStoreSort[selectedSort];
      const allApps = await store.list({
        category: appStoreCategory,
        collection: appStoreCollection, 
        country:appStoreCountry,
        sort:  appStoreSort,
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
  