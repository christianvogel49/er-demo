import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function appendRightNav() {
  const html = `
  <div class="navigation-wrap__icons-wrapper">
    <div class="navigation-icon navigation-icon--action-item hidden-md">
      <a
        href="https://www.ergo.de/de/sonstige/suchergebnisse"
        target="_self"
        class="navigation-icon__link search"
        aria-label="Suche"
        title="Wonach suchen Sie?"
      >
        <span class="icon-bars" aria-hidden="true">
          <img
            viewbox="0 0 24 24"
            src="https://www.ergo.de/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/SearchIcon.svg"
            alt="SearchIcon"
          />
        </span>
        <span class="navigation-main__extra-small-text">Suche</span>
      </a>
    </div>



    <div class="navigation-icon navigation-icon--action-item hidden-md">
      <a
        href="https://www.ergo.de/de/Service/Vermittlersuche"
        target="_self"
        rel="nofollow"
        class="navigation-icon__link agentSearch"
        aria-label="Berater"
        aria-haspopup="dialog"
        title="ERGO Berater finden"
      >
        <span class="icon-bars" aria-hidden="true">
          <img
            viewbox="0 0 24 24"
            src="https://www.ergo.de/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/LocationIcon.svg"
            alt="LocationIcon"
          />
        </span>
        <span class="navigation-main__extra-small-text">Berater</span>
      </a>
    </div>

    <div class="navigation-icon navigation-icon--action-item">
      <a
        href="https://kunde-s.ergo.de/meineversicherungen/lz/start.aspx?vu=ergo"
        target="_blank"
        rel="nofollow"
        class="navigation-icon__link login"
        data-tracking-full-path="MN|Log-in"
        aria-label="Log-in"
        aria-haspopup="dialog"
        title="Meine Versicherungen"
      >
        <span class="icon-bars" aria-hidden="true">
          <img
            viewbox="0 0 24 24"
            src="https://www.ergo.de/etc.clientlibs/ergoone/clientlibs/publish/assets/resources/icons/ProfileIcon.svg"
            alt="ProfileIcon"
          />
        </span>
        <span class="navigation-main__extra-small-text">Log-in</span>
      </a>
    </div>
  </div>

  <div class="navigation-divider"></div>
  <div
    class="navigation-icon navigation-icon--phone"
    title="Telefonischer Beratungsservice"
  >
    <a
      href="tel:0800 / 3746 208"
      class="navigation-icon__link"
      aria-label="Anrufen"
    >
      <span class="icon-bars" aria-hidden="true">
        <div class="icon-phone"></div>
      </span>
      <span class="navigation-main__extra-small-text hidden-min-md"
        >Anrufen</span
      >
      <div class="phone-text hidden-md">
        <span class="phone-text__phonenumber hidden-sm">0800 / 3746 208</span>
        <span class="phone-text__hours hidden-sm">7-24 Uhr (gebührenfrei)</span>
      </div>
    </a>
  </div>
`;
  return html;
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  const navRight = document.createElement('div');
  navRight.classList.add('section', 'nav-right');
  navRight.innerHTML = appendRightNav();
  nav.append(navRight);
}
