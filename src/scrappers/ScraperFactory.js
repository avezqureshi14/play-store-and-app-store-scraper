import { APP_STORE, GOOGLE_PLAY } from "../constants/actionTypes";
import { AppStore } from "./AppStoreScraper";
import { GooglePlayStore } from "./GooglePlayStoreScraper";
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
