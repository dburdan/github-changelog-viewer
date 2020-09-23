import messageListener from './utils/messageListener';
import dom from './utils/dom';
import storage from './utils/storage';
import constants from './constants';


(() => {
  const readyStateCheckInterval = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);
      messageListener.addListeners();

      // Load github token
      chrome.storage.sync.get(
        {
          [constants.GIT_TOKEN_SYNC]: ''
        },
        (storedData) => {
          if (!!storedData) {
            storage.set(constants.GIT_TOKEN, storedData[constants.GIT_TOKEN_SYNC]);
          }
        }
      );

      // Load cached repo data, then load process changelog data
      chrome.storage.local.get((items) => {
        storage.set(constants.STORAGE.CHANGELOG_CACHE_KEY, items?.changelogCache);
        dom.loadChangelogData();
      });
    }
  }, 10);
})();
