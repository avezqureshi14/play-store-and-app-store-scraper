import { Actor } from "apify";
import { FREE, PAID } from "./constants/actionTypes";
import getStoreInstance from "./scrapers/getStoreInstance";
class AppScraper {
  static async listApps({ platform, selectedCategory, limit, priceModel }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const allApps = await storeInstance.listApps({
        category: selectedCategory,
        num: limit,
      });
      let filteredApps = allApps;

      if (priceModel === FREE) {
        filteredApps = filteredApps.filter((app) => app.free === true);
      } else if (priceModel === PAID) {
        filteredApps = filteredApps.filter((app) => app.free === false);
      }

      await Actor.pushData(filteredApps.slice(0, limit));
    } catch (error) {
      console.error("Error fetching data:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async listDeveloperApps({ platform, devId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const apps = await storeInstance.listDeveloperApps({ devId });
      await Actor.pushData(apps);
    } catch (error) {
      console.error("Error fetching data:", error);
      await Actor.pushData({ error: error.message });
    }
  }

  static async getAppDetails({ platform, appId }) {
    const storeInstance = getStoreInstance(platform);

    try {
      const result = await storeInstance.getAppDetails({ appId });
      await Actor.pushData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
      await Actor.pushData({ error: "Internal Server Error" });
    }
  }
}

const runActor = async () => {
  await Actor.init();

  const input = await Actor.getInput();
  const { action } = input;

  try {
    switch (action) {
      case LIST_APPS:
        await AppScraper.listApps(input);
        break;
      case LIST_DEVELOPER_APPS:
        await AppScraper.listDeveloperApps(input);
        break;
      case GET_DETAILS:
        await AppScraper.getAppDetails(input);
        break;
      default:
        console.error("Invalid action specified in input.");
        await Actor.pushData({ error: "Invalid action specified." });
        break;
    }
  } catch (error) {
    console.error("Error processing input:", error);
    await Actor.pushData({ error: "Internal Server Error" });
  }

  await Actor.exit();
};

runActor();
