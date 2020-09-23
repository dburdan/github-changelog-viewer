export default {
  GIT_TOKEN: 'token',
  GIT_TOKEN_SYNC: 'gcviewer-token', // ! Change options.js
  PAGE_DID_RENDER: 'pageDidRender',
  STORAGE: {
    CHANGELOG_CACHE_KEY: 'changelogCache',
    CACHE_DURATION: (1000 * 60) * 30, // 30 minutes in ms
    MAX_CACHE_SIZE: 2 * 1000 * 1000, // 5MB is max in chrome
  },
  DOM: {
    STYLE_ID: 'github-changelog-viewer-styles',
    CHANGELOG_NAV_DIV_ID: 'changelog-nav-div',
    CHANGELOG_DROPDOWN_ID: 'changelog-dropdown',
    CUSTOM_DROPDOWN_ITEM_CLASS: 'custom-dropdown-item',
  },
} as const;
