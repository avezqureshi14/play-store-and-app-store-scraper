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

  getReviews({ appId, sortReviewsBy, numReviews }) {
    const playStoreReviewSort = gplayReviews[sortReviewsBy];

    // Map playStoreReviewSort to the corresponding gplay sort value
    const gplaySortValue = mapToGPlaySortValue(playStoreReviewSort);
    const reviews = gplay.reviews({
      appId: appId,
      sort: gplaySortValue,
      num: numReviews,
    })
    console.log(reviews?.data);
    if(reviews?.data?.score > 5){
      console.log({reviews})
    }
    return reviews;
  }
}
