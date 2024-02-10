import { ScraperInterface } from "./scraperInterface.js";
import { countries } from "../constants/countries.js";
import { gplayCategory } from "../constants/gplayCategory.js"
import gplay from "google-play-scraper";

export class GooglePlayStore extends ScraperInterface {
    async listApps({
      selectedCollection,
      selectedCategory,
      num,
      selectedCountry,
    }) {
      const playStoreCategory = gplayCategory[selectedCategory];
      const playStoreCollection = selectedCollection;
      const playStoreCountry = countries[selectedCountry];
      const allApps = gplay.list({
        category: playStoreCategory,
        collection: playStoreCollection,
        country: playStoreCountry,
      });
      
      return allApps;
    }
  
    async listDeveloperApps({ devId }) {
      throw new Error("This parameter only works for App Store");
    }
  
    async getAppDetails({ appId }) {
      return await gplay.app({ appId });
    }
  }