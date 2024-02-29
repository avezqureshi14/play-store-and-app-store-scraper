import { ScraperInterface } from '../scrapper-interface.js';
import { countries } from '../../constants/countries.js';
import { gplayCategory } from './constants/category.js';
import gplay from 'google-play-scraper';

const { memoized } = require('google-play-scraper'); // Import memoized from google-play-scraper

export class GooglePlayStore extends ScraperInterface {
  constructor() {
    super();
    // Create memoized versions of functions
    this.memoizedListApps = memoized(this.listApps.bind(this));
    this.memoizedGetAppDetails = memoized(this.getAppDetails.bind(this));
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
    throw new Error('This parameter only works for App Store');
  }

  async getAppDetails({ appId }) {
    return await this.memoizedGetAppDetails({ appId });
  }
}
