import dom from './dom';
import constants from '../constants';


// Message received from background.js process.
const onMessage = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    // Navigation state changed, so call DOM function again
    if (request?.type === constants.PAGE_DID_RENDER) {
      dom.loadChangelogData();
    }
  });
};

const addListeners = (): void => {
  onMessage();
};

export default {
  onMessage,
  addListeners,
};
