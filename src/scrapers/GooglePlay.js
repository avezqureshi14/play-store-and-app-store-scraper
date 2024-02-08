import { ScraperInterface } from "./ScraperInterface";
import gplay from 'google-play-scraper';

export class GooglePlayStore extends ScraperInterface {
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