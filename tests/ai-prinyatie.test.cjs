const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const { runInNewContext } = require('node:vm');

const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const script = readFileSync(join(__dirname, '../script.js'), 'utf8');
const pageUrl = 'https://natabediana.ru/#ai-prinyatie';

function element() {
  const attributes = new Map();
  const listeners = new Map();
  return {
    classList: { remove() {}, toggle() {} },
    dataset: {},
    elements: { message: { value: '' } },
    querySelectorAll: () => [],
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name),
    addEventListener: (name, listener) => listeners.set(name, listener),
    hasListener: (name) => listeners.has(name),
    click: () => listeners.get('click')(),
    reset() {},
    showModal() { this.open = true; },
  };
}

function loadPage(markup = html) {
  let activeElement;
  const elements = new Map();
  const triggers = new Map([
    ['[data-reviews-more]', []],
    ['[data-diagnostic-open]', []],
    ['[data-dialog-mode]', []],
  ]);
  for (const match of markup.matchAll(/<[a-z][a-z0-9]*\b[^>]*>/g)) {
    const [tag] = match;
    const id = tag.match(/\sid="([^"]+)"/)?.[1];
    const trigger = tag.match(/\s(data-reviews-more|data-diagnostic-open|data-dialog-mode)(?=[\s=>])/);
    if (!id && !trigger) continue;

    const node = element();
    node.hidden = /\shidden(?=\s|>)/.test(tag);
    node.textContent = markup.slice(match.index + tag.length).split('<', 1)[0].trim();
    node.focus = () => { activeElement = node; };
    for (const [, name, value] of tag.matchAll(/(aria-[\w-]+)="([^"]*)"/g)) {
      node.setAttribute(name, value);
    }
    if (id) elements.set(id, node);
    if (trigger) triggers.get(`[${trigger[1]}]`).push(node);
    const mode = tag.match(/\sdata-dialog-mode="([^"]+)"/)?.[1];
    if (mode) node.dataset.dialogMode = mode;
  }

  const document = {
    getElementById: (id) => elements.get(id) ?? null,
    querySelector: (selector) => {
      if (selector.startsWith('#')) return elements.get(selector.slice(1));
      if (triggers.has(selector)) return triggers.get(selector)[0];
      return element();
    },
    querySelectorAll: (selector) => triggers.get(selector) ?? [],
  };
  const window = { addEventListener() {}, scrollY: 0, location: { href: pageUrl } };
  runInNewContext(script, { document, window }, { filename: 'script.js' });
  const toggle = elements.get('ai-prinyatie-toggle');
  const stages = elements.get(toggle?.getAttribute('aria-controls'));
  const collapse = elements.get('ai-prinyatie-collapse');
  return { toggle, stages, collapse, document, window, getFocusedElement: () => activeElement };
}

test('the top button opens and closes the stages on the same page', () => {
  const { toggle, stages, window } = loadPage();
  assert.equal(stages.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.textContent, 'Посмотреть этапы программы');

  toggle.click();
  assert.equal(stages.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(toggle.textContent, 'Свернуть этапы программы');

  toggle.click();
  assert.equal(stages.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.textContent, 'Посмотреть этапы программы');
  assert.equal(window.location.href, pageUrl);
});

test('the bottom button closes the stages and returns focus to the top button', () => {
  const { toggle, stages, collapse, getFocusedElement, window } = loadPage();
  assert.equal(collapse.getAttribute('aria-controls'), toggle.getAttribute('aria-controls'));
  toggle.click();
  collapse.focus();
  collapse.click();

  assert.equal(stages.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(toggle.textContent, 'Посмотреть этапы программы');
  assert.equal(getFocusedElement(), toggle);
  assert.equal(window.location.href, pageUrl);

  toggle.click();
  assert.equal(stages.hidden, false);
});

test('current script keeps diagnosis and contact working with cached HTML without the program', () => {
  const cachedHtml = html.replace(/<section class="ai-prinyatie"[^>]*>[\s\S]*?(?=<section class="formats")/, '');
  const { document } = loadPage(cachedHtml);
  for (const id of ['ai-prinyatie-toggle', 'ai-prinyatie-stages', 'ai-prinyatie-collapse']) {
    assert.equal(document.getElementById(id), null);
  }

  document.querySelector('[data-diagnostic-open]').click();
  assert.equal(document.getElementById('diagnostic-dialog').open, true);

  const serviceTrigger = document.querySelectorAll('[data-dialog-mode]')
    .find((trigger) => trigger.dataset.dialogMode === 'review');
  serviceTrigger.click();
  assert.equal(document.getElementById('contact-dialog').open, true);
  const form = document.getElementById('contact-form');
  assert.equal(form.dataset.subject, 'Запрос на стратегический разбор');
  assert.equal(form.hasListener('submit'), true);
});

test('the existing review disclosure synchronizes visibility, label and aria-expanded', () => {
  const { document, getFocusedElement } = loadPage();
  const button = document.querySelector('[data-reviews-more]');
  const note = document.getElementById(button.getAttribute('aria-controls'));
  assert.equal(note.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(button.textContent, 'Посмотреть ещё отзывы');

  button.click();
  assert.equal(note.hidden, false);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(button.textContent, 'Скрыть сообщение');

  const previousFocus = document.querySelector('[data-diagnostic-open]');
  previousFocus.focus();
  button.click();
  assert.equal(note.hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(button.textContent, 'Посмотреть ещё отзывы');
  assert.equal(getFocusedElement(), previousFocus);
});
