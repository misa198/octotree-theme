import * as domLoaded from 'dom-loaded';
import * as fileIcons from 'file-icons-js';
import mobile from 'is-mobile';
import select from 'select-dom';
import { observe } from 'selector-observer';
import { detectBrowser } from './detectBrowser';
import { get } from './storage';
import { KEYS } from './keys';
import '../styles/file-icon.css';
import '../styles/icons.css';
import '../styles/octotree.css';

const fonts = [
  { name: 'FontAwesome', path: 'fonts/fontawesome.woff2' },
  { name: 'Mfizz', path: 'fonts/mfixx.woff2' },
  { name: 'Devicons', path: 'fonts/devopicons.woff2' },
  { name: 'file-icons', path: 'fonts/file-icons.woff2' },
  { name: 'octicons', path: 'fonts/octicons.woff2' },
];

let octotree = false;
let github = false;
const browserName = detectBrowser();

const loadFonts = () => {
  for (const font of fonts) {
    const fontFace = new FontFace(
      font.name,
      `url("${(browserName === 'chrome' ? chrome : browser).extension.getURL(
        font.path
      )}") format("woff2")`,
      {
        style: 'normal',
        weight: 'normal',
      }
    );

    fontFace
      .load()
      .then((loadedFontFace) => document.fonts.add(loadedFontFace));
  }
};

const getGitHubMobileFilename = (filenameDom: HTMLElement) =>
  Array.from(filenameDom.childNodes)
    .filter((node) => node.nodeType === node.TEXT_NODE)
    .map((node) => node.nodeValue!.trim())
    .join('');

const isMobile = mobile();

const replaceIcon = ({
  iconDom,
  filenameDom,
}: {
  iconDom: HTMLElement | null;
  filenameDom: HTMLElement;
}) => {
  const filename = isMobile
    ? getGitHubMobileFilename(filenameDom)
    : filenameDom.innerText.trim();

  let isDirectory = false;
  if (iconDom) {
    isDirectory = iconDom.classList.contains('octicon-file-directory');
  }

  const className: string | null = fileIcons.getClassWithColor(filename);

  if (className && !isDirectory) {
    const icon = document.createElement('span');
    icon.className = `icon octicon-file ${className}`;
    if (iconDom) {
      iconDom.parentNode!.replaceChild(icon, iconDom as HTMLElement);
    }
  }
};

const replaceOctotreeIcon = ({
  iconDom,
  filenameDom,
}: {
  iconDom: HTMLElement | null;
  filenameDom: HTMLElement;
}) => {
  const filename = isMobile
    ? getGitHubMobileFilename(filenameDom)
    : filenameDom.innerText.trim();

  let isDirectory = false;
  if (iconDom) {
    if (
      iconDom.parentElement!.getAttribute('aria-expanded') === 'false' ||
      iconDom.parentElement!.getAttribute('aria-expanded') === 'true'
    ) {
      isDirectory = true;
    }
  }

  const className: string | null = fileIcons.getClassWithColor(filename);

  if (className && !isDirectory) {
    const icon = document.createElement('i');
    icon.className = `icon octicon-file misa198-octotree-icon ${iconDom?.classList.value} ${className}`;
    icon.setAttribute('role', 'presentation');
    icon.setAttribute('rel', 'blob octotree-default-icon octotree-icon-file');

    if (iconDom) {
      iconDom.parentNode!.replaceChild(icon, iconDom as HTMLElement);
    }
  }
};

const init = async () => {
  loadFonts();
  await domLoaded;

  if (github) {
    observe('.js-navigation-container > .js-navigation-item', {
      add(element) {
        const filenameDom = select('div[role="rowheader"] > span', element);

        if (!filenameDom) {
          return;
        }

        replaceIcon({
          iconDom: select('.octicon-file', element) as HTMLElement,
          filenameDom,
        });
      },
    });
  }

  if (octotree) {
    observe(
      '.jstree-container-ul.jstree-children.jstree-wholerow-ul.jstree-no-dots',
      {
        add() {
          observe('.octotree-sidebar', {
            add(element) {
              if (element) {
                select(
                  '.octotree-sidebar.octotree-github-sidebar.ui-resizable'
                )?.classList.add('misa198-octotree-sidebar');
              }
            },
          });

          observe('.jstree-node', {
            add(element) {
              const filenameDom = select('.jstree-anchor > div', element);

              if (!filenameDom) {
                return;
              }

              replaceOctotreeIcon({
                iconDom: select(
                  '.jstree-anchor > .jstree-icon',
                  element
                ) as HTMLElement,
                filenameDom,
              });
            },
          });
        },
      }
    );
  }
};

(() => {
  get([KEYS.MISA198_GITHUB, KEYS.MISA198_OCTOTREE], (result) => {
    github = result[KEYS.MISA198_GITHUB] === true;
    octotree = result[KEYS.MISA198_OCTOTREE] === true;
  });
  init();
})();
