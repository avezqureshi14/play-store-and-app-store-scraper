import memoize from 'memoizee';
import { ScraperInterface } from '../scrapper-interface.js';
import { countries } from '../../constants/countries.js';
import { gplayCategory } from './constants/category.js';
import gplay from 'google-play-scraper';
import { gplaySort } from '../google-play/constants/sort.js';
import { gplayReviews } from './constants/reviews.js';
import { mapToGPlaySortValue } from '../../utility/helper-gplay.js';

export class GooglePlayStore extends ScraperInterface {
  constructor() {
    super();

    // Iterate through class methods and memoize them
    Object.getOwnPropertyNames(GooglePlayStore.prototype).forEach((methodName) => {
      if (typeof this[methodName] === 'function' && methodName !== 'constructor') {
        this[methodName] = memoize(this[methodName].bind(this), { promise: true });
      }
    });
  }

  listApps({
    selectedCollection,
    selectedCategory,
    selectedCountry,
    selectedSort,
  }) {
    const playStoreCategory = gplayCategory[selectedCategory];
    const playStoreCollection = selectedCollection;
    const playStoreCountry = countries[selectedCountry];
    const sort = gplaySort[selectedSort];

    return gplay.list({
      category: playStoreCategory,
      collection: playStoreCollection,
      country: playStoreCountry,
      sort: sort,
    });
  }

  listDeveloperApps({ devId }) {
    throw new Error('This parameter only works for App Store');
  }

  getAppDetails({ appId }) {
    return gplay.app({ appId });
  }

  async getReviews({ appId }) {
    const numReviews = 20;
    const sortReviewsBy = 'NEWEST';

    try {
      // Fetch the reviews
      const reviews = await this.fetchReviews({ appId, sortReviewsBy, numReviews });

      // Filter out bad (1-3 stars) and good (4-5 stars) ratings
      const filteredReviews = reviews.filter((review) => {
        const score = review.score;
        return score >= 4; // Consider 4 and 5 stars as good ratings
        // If you also want to filter out bad ratings, use the following line
        // return score >= 4 && score <= 5;
      });

      return filteredReviews;
    } catch (error) {
      // Handle errors, e.g., log them or throw a custom error
      console.error('Error fetching and filtering reviews:', error);
      throw error;
    }
  }

  // Helper function to fetch reviews
  async fetchReviews({ appId, sortReviewsBy, numReviews }) {
    const playStoreReviewSort = gplayReviews[sortReviewsBy];

    // Map playStoreReviewSort to the corresponding gplay sort value
    const gplaySortValue = mapToGPlaySortValue(playStoreReviewSort);

    // Fetch reviews using gplay.reviews
    const reviews = await gplay.reviews({
      appId: appId,
      sort: gplaySortValue,
      num: numReviews,
    });

    return reviews;
  }

}
