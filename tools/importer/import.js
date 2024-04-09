/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global WebImporter */
/* eslint-disable no-console, class-methods-use-this */

const createBanner = (main, document) => {
  const bannerImage = document.querySelector('.cmp-hero__image picture');
  const bannerText = document.querySelector('.cmp-hero__teaser');

  const h3 = document.createElement('h3');
  const p = bannerText.querySelector('p');
  // h3.textContent = p.textContent;
  // p.replaceWith(h3);
  const bannerPrice = document.querySelector('.price').parentNode;
  bannerText.append(bannerPrice);

  const bannerCells = [
    ['Banner'],
    [bannerText, bannerImage],
  ];
  const banner = WebImporter.DOMUtils.createTable(bannerCells, document);
  main.prepend(banner);
};

const createBenefits = (main, document) => {
  const benefitsLists = document.querySelectorAll('.benefits');

  benefitsLists.forEach((benefits) => {
    const title = benefits.querySelector('p');
    const benefitItems = benefits.querySelectorAll('.benefits__item');

    const cells = [
      ['Benefits'],
      [title],
    ];

    benefitItems.forEach((item) => {
      const newArray = [];
      newArray.push(item);
      cells.push(newArray);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    benefits.replaceWith(table);
  });
};

const createAccordion = (main, document) => {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    const accordionItems = accordion.querySelectorAll('.cmp-accordion__item');

    const cells = [
      ['Accordion'],
    ];

    accordionItems.forEach((item) => {
      const newArray = [];
      const title = item.querySelector('h2');

      newArray.push(title);
      newArray.push(item);
      cells.push(newArray);
    });

    const table = WebImporter.DOMUtils.createTable(cells, document);
    accordion.replaceWith(table);
  });
};

const addChecklistTable = (document, lists) => {
  const cells = [
    ['Section Metadata'],
    ['Style', 'check-list'],
  ];
  lists.forEach((list) => {
    const section = list.parentNode.parentNode.parentNode;
    const table = WebImporter.DOMUtils.createTable(cells, document);
    section.append(table);
    section.after(document.createElement('hr'));
  });
};

const createCheckLists = (main, document) => {
  addChecklistTable(document, document.querySelectorAll('ul.check-list'));
  addChecklistTable(document, document.querySelectorAll('ul.check-list--green'));
};

export default {
  /**
     * Apply DOM operations to the provided document and return
     * the root element to be then transformed to Markdown.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @returns {HTMLElement} The root element to be transformed
     */
  transformDOM: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    // define the main element: the one that will be transformed to Markdown
    const main = document.body;

    // attempt to remove non-content elements
    WebImporter.DOMUtils.remove(main, [
      'header',
      '.header',
      'nav',
      '.nav',
      'footer',
      '.footer',
      'iframe',
      'noscript',
      '.stickyfooter',
      '.stickyFooterNewReact',
      '.scrollToTop',
    ]);

    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    WebImporter.rules.convertIcons(main, document);

    createBanner(main, document);
    createCheckLists(main, document);
    createBenefits(main, document);
    createAccordion(main, document);
    return main;
  },

  /**
     * Return a path that describes the document being transformed (file name, nesting...).
     * The path is then used to create the corresponding Word document.
     * @param {HTMLDocument} document The document
     * @param {string} url The url of the page imported
     * @param {string} html The raw html (the document is cleaned up during preprocessing)
     * @param {object} params Object containing some parameters given by the import process.
     * @return {string} The path
     */
  generateDocumentPath: ({
    // eslint-disable-next-line no-unused-vars
    document, url, html, params,
  }) => {
    let p = new URL(url).pathname;
    if (p.endsWith('/')) {
      p = `${p}index`;
    }
    return decodeURIComponent(p)
      .toLowerCase()
      .replace(/\.html$/, '')
      .replace(/[^a-z0-9/]/gm, '-');
  },
};
