import { Actor } from 'apify';
import {
  GET_DETAILS,
  GET_REVIEWS,
  LIST_APPS,
  LIST_DEVELOPER_APPS
} from './constants/actionTypes.js';
import { logError } from './utility/logError.js';
import { ScraperFactory } from './scrappers/scrapper-factory.js';

const runActor = async () => {
  try {
    await Actor.init();
    const input = await Actor.getInput();
    const { action, platform } = input;
    const storeInstance = ScraperFactory.getScraperInstance(platform);

    switch (action) {
      case LIST_APPS: {
        const apps = await storeInstance.listApps(input);
        await Actor.pushData(apps.slice(0, input.limit));
        break;
      }
      case LIST_DEVELOPER_APPS: {
        const developerApps = await storeInstance.listDeveloperApps(input);
        await Actor.pushData(developerApps);
        break;
      }
      case GET_DETAILS: {
        const appDetails = await storeInstance.getAppDetails(input);
        await Actor.pushData(appDetails);
        break;
      }
      case GET_REVIEWS: {
        const reviews = await storeInstance.getReviews(input);
        console.log(reviews?.data);
        await Actor.pushData(reviews);
        break;
      }
      default: {
        const errorMessage = 'Invalid action specified in input.';
        await Actor.pushData(logError(new Error(errorMessage)));
        break;
      }
    }
  } catch (error) {
    await Actor.pushData(logError(error));
  } finally {
    await Actor.exit();
  }
};

runActor();
