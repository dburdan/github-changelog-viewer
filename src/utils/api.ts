import storage from './storage';
import constants from '../constants';
import logger from './logger';


const GITHUB_API_BASE_URL = 'https://api.github.com/';
const GITHUB_SEARCH_API_BASE_URL = GITHUB_API_BASE_URL + 'search/code?q=';


/**
 * Parse URL to get repo and organization name.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const getRepoNamesFromUrl = () => {
  const pathnames = window.location.pathname.split('/');
  const user = pathnames[1];
  const repo = pathnames[2];

  return {
    user,
    repo,
  };
};

const checkStatus = (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  if (response.status === 429) {
    throw Error('GitHub rate limit exceeded. Add you API token in extension options to avoid this.');
  }

  response.json().then((body) => {
    throw Error(`GitHub error: ${response.status} - ${body?.message}`);
  });
};

const parseJSON = (response: Response) => {
  return response === null ? null : response.json();
};

export type SearchResponse = {
  incomplete_results: boolean;
  total_count: number;
  items: {
    git_url: string;
    html_url: string;
    name: string;
    path: string;
    score: number;
    sha: string;
    url: string;
    repository: Record<string, unknown>; // * Needs GitHub types
  }[];
};

/**
 * Get all Changelogs int he repo by querying GitHubs API.
 */
const getChangelogs = (callback: (data: SearchResponse | null) => void): void => {
  const path = getRepoNamesFromUrl();
  if (!path.user || !path.repo) return;
  const userRepo = path.user + '/' + path.repo;

  const token = storage.get(constants.GIT_TOKEN) || localStorage.getItem(constants.GIT_TOKEN_SYNC);
  let headers = {};

  if (token) {
    headers = {
      Authorization: 'token ' + token,
      'User-Agent': 'GitHub-Changelog-Viewer'
    };
  }

  // Check cache for data
  const cacheKey = `${path.user}|${path.repo}`;
  const cachedRepo = storage.getCache(cacheKey);
  if ((cachedRepo?.lastUpdatedAt ?? 0) > Date.now() - constants.STORAGE.CACHE_DURATION) {
    const itemLength = cachedRepo?.data?.items.length ?? 0;
    if (itemLength > 0) {
      callback(cachedRepo.data as SearchResponse);
      return;
    }
  }

  // Query API then cache the results
  window
    .fetch(GITHUB_SEARCH_API_BASE_URL + 'filename:CHANGELOG.md+repo:' + userRepo, {
      headers: headers,
    })
    .then(checkStatus)
    .then(parseJSON)
    .then((data: SearchResponse) => {
      if ((data?.items?.length ?? 0) > 0) {
        storage.setCache(cacheKey, { data });
      }
      callback(data);
    })
    .catch((error) => {
      if (error) {
        logger.log('Error in github-changelog-viewer.', 'error', error)
      }
      callback(null);
    });
};


export default {
  getRepoNamesFromUrl,
  getChangelogs,
};
