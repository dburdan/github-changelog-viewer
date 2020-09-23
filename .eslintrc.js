module.exports = {
  "env": {
    "browser": true,
    "webextensions": true,
    "node": true,
    "jest": true
  },
  "parser": "@typescript-eslint/parser",
  "extends": ["plugin:@typescript-eslint/recommended"],
  "plugins": [
    "@typescript-eslint",
  ],
  "rules": {
    "promise/param-names": "off",
    "handle-callback-err": 0
  },
  "ignorePatterns": [
    "dist/",
    "*.zip",
  ],
};
