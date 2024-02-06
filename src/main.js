import Actor from 'apify';
import AppScraper from './AppScraper';
import {
  LIST_APPS,
  LIST_DEVELOPER_APPS,
  GET_DETAILS,
} from './constants/actionTypes';

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
        console.error('Invalid action specified in input.');
        await Actor.pushData({ error: 'Invalid action specified.' });
        break;
    }
  } catch (error) {
    console.error('Error processing input:', error);
    await Actor.pushData({ error: 'Internal Server Error' });
  }

  await Actor.exit();
};

runActor();
