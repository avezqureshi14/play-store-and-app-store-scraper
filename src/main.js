import { Actor } from "apify";
import { GET_DETAILS,  LIST_APPS, LIST_DEVELOPER_APPS} from "./constants/actionTypes.js";
import { logError } from "./utility/logError.js";
import { ScraperFactory } from "./scrappers/ScraperFactory.js";

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;
    const storeInstance = ScraperFactory.getScraperInstance(platform);

    switch (action) {
      case LIST_APPS:
        const apps = await storeInstance.listApps(input);
        await Actor.pushData(apps.slice(0, input.limit));
        break;
      case LIST_DEVELOPER_APPS:
        await Actor.pushData(await storeInstance.listDeveloperApps(input));
        break;
      case GET_DETAILS:
        await Actor.pushData(await storeInstance.getAppDetails(input));
        break;
      default:
        await Actor.pushData(
          logError(new Error("Invalid action specified in input."))
        );
        break;
    }
  } catch (error) {
    await Actor.pushData(logError(error));
  } finally {
    await Actor.exit();
  }
};

runActor();