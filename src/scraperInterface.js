// This is Interface for Scraper
export class ScraperInterface {
    async listApps({ selectedCollection, selectedCategory, num,selectedCountry }) {}
    async listDeveloperApps({ devId }) {}
    async getAppDetails({ appId }) {}
  }
  