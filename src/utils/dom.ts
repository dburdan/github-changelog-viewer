import constants from '../constants';
import api, { SearchResponse } from './api';
import logger from './logger';


const getNavItemHtml = (href: string, numChangelogs: number) => {
  const string = (numChangelogs === 0)
    ? 'Release Notes'
    : (numChangelogs === 1)
      ? 'changelog'
      : 'changelogs';
  return `
    <a
      id="${constants.DOM.CHANGELOG_NAV_DIV_ID}"
      href="${href}"
      class="ml-3 link-gray-dark no-underline position-relative"
    >
      <svg text="gray" height="16" class="octicon octicon-tag text-gray" viewBox="0 0 16 16" version="1.1" width="16" aria-hidden="true">
        <path fill-rule="evenodd" d="M2 4a1 1 0 100-2 1 1 0 000 2zm3.75-1.5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zm0 5a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-8.5zM3 8a1 1 0 11-2 0 1 1 0 012 0zm-1 6a1 1 0 100-2 1 1 0 000 2z"></path>
      </svg>

      ${numChangelogs > 0 ? `
        <strong>${numChangelogs}</strong>
      ` : ''}

      <span class="text-gray-light">${string}</span>
    </a>
  `
};

const getDropdownHtml = (list: [string, string][]) => {
  const sortedList = list.sort((a, b) => {
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
  });
  return `
    <div id="${constants.DOM.CHANGELOG_DROPDOWN_ID}">
      <ul class="dropdown-menu dropdown-menu-sw">
        ${sortedList.map(([name, link]) => {
          // <li class="d-block d-md-none dropdown-divider" role="none"></li>
          return `
            <li class="${constants.DOM.CUSTOM_DROPDOWN_ITEM_CLASS}" title="${name}">
              <a class="dropdown-item" href="${link}">
                ${name}
              </a>
            </li>
          `;
        }).join('')}
      </ul>
    </div>
  `;
}


/**
 * Given a selector, remove the elements from the dom.
 */
const removeElements = (selector: string) => {
  if (!selector) return;

  document.querySelectorAll(selector)?.forEach((elem: HTMLElement) => {
    elem.parentNode.removeChild(elem);
  });
};

const injectCommonCss = () => {
  removeElements(`#${constants.DOM.STYLE_ID}`);

  const styleElem = document.createElement('style');
  styleElem.type = 'text/css';
  styleElem.id = constants.DOM.STYLE_ID;
  styleElem.innerHTML = `
    .${constants.DOM.CUSTOM_DROPDOWN_ITEM_CLASS} a {
      line-height: 1.5;
    }
    #${constants.DOM.CHANGELOG_DROPDOWN_ID} {
      display: none;
    }
    #${constants.DOM.CHANGELOG_DROPDOWN_ID} ul {
      max-height: calc(100vh - 300px);
      overflow: auto;
    }
    #${constants.DOM.CHANGELOG_DROPDOWN_ID} .dropdown-menu {
      width: 220px;
    }
  `;
  document.getElementsByTagName('head')[0].appendChild(styleElem);
};


/**
 * Query API for repo data
 */
const loadChangelogData = (): void => {
  // First we'll check if the required DOM elements are present before we load.
  const navItemDiv = document.querySelector('div.file-navigation div.flex-items-center');
  if (!!navItemDiv) {
    api.getChangelogs((data) => {
      if (!data) return;
      appendChangelogNav(data);
    });
  }
};

/**
 * Append changelog button to navigation bar
 */
const appendChangelogNav = (data: SearchResponse) => {
  removeElements(`#${constants.DOM.CHANGELOG_NAV_DIV_ID}`);
  removeElements(`#${constants.DOM.CHANGELOG_DROPDOWN_ID}`);

  injectCommonCss();

  // Get current branch from dropdown. This differs if branch isn't on master.
  const branchSelectMenu = document.getElementById('branch-select-menu');
  const branchSelectMenuSummary = branchSelectMenu?.querySelector('summary');
  let currentBranch = branchSelectMenuSummary?.title;
  if (currentBranch.includes(' ')) { // If on master, a space will exist in the `title` attribute.
    currentBranch = branchSelectMenuSummary?.textContent?.trim();
  }
  if (!currentBranch) currentBranch = 'master';

  // Process search response
  const linkSets: [string, string][] = data?.items?.map((result) => {
    const name = result.path
      .replace('packages/', '')
      .replace('/CHANGELOG.md', '');
    return [name, `${result.repository.html_url}/tree/${currentBranch}/${result.path}`];
  });

  // Get nav divs
  const navParent = document.querySelector('div.file-navigation');
  const navItemDiv = navParent?.querySelector?.('div.flex-items-center');
  if (!navItemDiv) {
    logger.log('NavItemDiv not found. Not showing changelog helper.', 'warn')
    return;
  }

  // Add in custom elements
  const names = api.getRepoNamesFromUrl();
  const navHref = (linkSets.length === 0)
    ? `https://github.com/${names.user}/${names.repo}/releases`
      : (linkSets.length === 1)
        ? linkSets[0][1] // Link directly to single changelog
        : 'javascript:;'; // ! Shows error in console but doesn't leave history entry

  navItemDiv.insertAdjacentHTML('beforeend', getNavItemHtml(navHref, linkSets.length));
  const changelogDiv = document.getElementById(constants.DOM.CHANGELOG_NAV_DIV_ID);
  changelogDiv.insertAdjacentHTML('beforeend', getDropdownHtml(linkSets))

  // Add click event listener to open dropdown and outside listener to close
  if (linkSets.length > 1) {
    document.addEventListener('click', (e) => {
      const changelogDropdownDiv = document.getElementById(constants.DOM.CHANGELOG_DROPDOWN_ID);
      const navDiv = document.getElementById(constants.DOM.CHANGELOG_NAV_DIV_ID);

      if (navDiv?.contains?.(e.target as Node)) {
        changelogDropdownDiv.style.display === 'block'
          ? changelogDropdownDiv.style.display = 'none'
          : changelogDropdownDiv.style.display = 'block';
      } else {
        changelogDropdownDiv.style.display = 'none';
      }
    });
  }
};

export default {
  loadChangelogData,
};
