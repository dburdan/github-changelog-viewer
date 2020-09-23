import constants from '../constants';
import type { SearchResponse } from './api';


type TCacheEntry = {
  lastUpdatedAt: number;
  data: SearchResponse;
};
type TStorageValues = {
  [constants.GIT_TOKEN]: string;
  changelogCache: Record<string, TCacheEntry>;
};
const tempStorage: Partial<TStorageValues> = {};


const storage = {
  set: <T extends keyof TStorageValues>(key: T, value: TStorageValues[T]): void => {
    tempStorage[key] = value;
  },
  get: <T extends keyof TStorageValues>(key: T): TStorageValues[T] | undefined => {
    return tempStorage?.[key] as never;
  },
  getCache: (key: string): TCacheEntry | undefined => {
    return tempStorage?.[constants.STORAGE.CHANGELOG_CACHE_KEY]?.[key];
  },
  setCache: (key: string, data: Pick<TCacheEntry, 'data'> & Partial<Pick<TCacheEntry, 'lastUpdatedAt'>>): void => {
    if (!tempStorage?.[constants.STORAGE.CHANGELOG_CACHE_KEY]) {
      tempStorage[constants.STORAGE.CHANGELOG_CACHE_KEY] = {};
    }
    tempStorage[constants.STORAGE.CHANGELOG_CACHE_KEY][key] = {
      lastUpdatedAt: Date.now(),
      ...data,
    };

    // Update chrome local storage with cache and empty cache if too large
    chrome.storage.local.getBytesInUse((bytesInUse) => {
      if (bytesInUse < constants.STORAGE.MAX_CACHE_SIZE) {
        chrome.storage.local.set({
          changelogCache: tempStorage.changelogCache,
        });
      } else {
        chrome.storage.local.clear();
      }
    });
  },
};

export default storage;
