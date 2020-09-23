import constants from './constants';


let currentUrl = '';
let tabId;

/**
 * Listen to web requests from github.com so we can determine if the page has changed
 * (since GitHub is a SPA).
 */
chrome.webRequest.onCompleted.addListener(
  (details) => {
    const parsedUrl = new URL(details.url);

    if (currentUrl && currentUrl.indexOf(parsedUrl.pathname) > -1 && tabId) {
      chrome.tabs.sendMessage(tabId, { type: constants.PAGE_DID_RENDER });
    }
  },
  { urls: ['*://*.github.com/*'] },
);

chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    tabId = details.tabId;
    currentUrl = details.url;
  },
  {
    url: [
      {
        hostSuffix: 'github.com'
      },
    ],
  },
);
