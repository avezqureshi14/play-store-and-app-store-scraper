import gplay from "google-play-scraper";
import { Actor } from "apify";

const runActor = async () => {
  await Actor.init();

  const input = await Actor.getInput();
  const { action } = input;
  try {
    switch (action) {
      case "LIST_APPS":
        await listApps(input);
        break;
      case "GET_APP_DETAILS":
        await getAppDetails(input);
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

const listApps = async ({ category, popularity, limit, priceModel }) => {
  try {
    const allApps = await gplay.list({
      category: category,
      collection: popularity,
      num: limit,
    });

    let filteredApps = allApps;

    if (priceModel === "FREE") {
      // Filter apps to include only free apps (Freemium, Ad-Supported, etc.)
      filteredApps = filteredApps.filter((app) => app.free === true);
    } else if (priceModel === "PAID") {
      // Filter apps to include only paid apps
      filteredApps = filteredApps.filter((app) => app.free === false);
    }

    await Actor.pushData(filteredApps.slice(0, limit));
  } catch (error) {
    console.error("Error fetching data from Google Play:", error);
    await Actor.pushData({ error: error.message });
  }
};


const getAppDetails = async ({ appId }) => {
  try {
    const result = await gplay.app({ appId: appId });
    await Actor.pushData(result);
  } catch (error) {
    console.error("Error fetching data from Google Play:", error);
    await Actor.pushData({ error: "Internal Server Error" });
  }
};

runActor();
