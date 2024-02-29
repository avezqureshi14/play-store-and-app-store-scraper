import { memoized as m } from "google-play-scraper";
import { ScraperInterface } from "../scrapper-interface.js";
import { countries } from "../../constants/countries.js";
import { gplayCategory } from "./constants/category.js";

export class GooglePlayStore extends ScraperInterface {
  constructor() {
    super();
    
    // Create memoized versions of functions with default options
    this.memoizedListApps = m();
    this.memoizedGetAppDetails = m();
  }

  async listApps({
    selectedCollection,
    selectedCategory,
    selectedCountry,
    selectedSort,
  }) {
    const playStoreCategory = gplayCategory[selectedCategory];
    const playStoreCollection = selectedCollection;
    const playStoreCountry = countries[selectedCountry];
    const sort = gplaySort[selectedSort];

    return await this.memoizedListApps({
      category: playStoreCategory,
      collection: playStoreCollection,
      country: playStoreCountry,
      sort,
    });
  }

  async listDeveloperApps({ devId }) {
    throw new Error("This parameter only works for App Store");
  }

  async getAppDetails({ appId }) {
    return await this.memoizedGetAppDetails({ appId });
  }
}
