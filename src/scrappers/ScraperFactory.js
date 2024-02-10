import { APP_STORE, GOOGLE_PLAY } from "../constants/actionTypes.js";
import { AppStore } from "./AppStoreScraper.js";
import { GooglePlayStore } from "./GooglePlayStoreScraper.js";
export class ScraperFactory {
  static getScraperInstance(platform) {
    switch (platform) {
      case APP_STORE:
        return new AppStore();
      case GOOGLE_PLAY:
        return new GooglePlayStore();
      default:
        throw new Error("Invalid platform");
    }
  }
}
