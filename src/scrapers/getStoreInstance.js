// getStoreInstance.js
import AppStore from './AppStore';
import GooglePlayStore from './GooglePlayStore';
import { APP_STORE, GOOGLE_PLAY } from '../constants/actionTypes';

export default function getStoreInstance(platform) {
  if (platform === APP_STORE) {
    return new AppStore();
  } else if (platform === GOOGLE_PLAY) {
    return new GooglePlayStore();
  } else {
    throw new Error('Invalid platform');
  }
}
