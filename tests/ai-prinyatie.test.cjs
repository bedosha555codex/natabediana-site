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
    classList: { toggle() {} },
    querySelectorAll: () => [],
    setAttribute: (name, value) => attributes.set(name, value),
    getAttribute: (name) => attributes.get(name),
    addEventListener: (name, listener) => listeners.set(name, listener),
    click: () => listeners.get('click')(),
  };
}

function loadPage() {
  let activeElement;
  const elements = new Map();
  for (const match of html.matchAll(/<([a-z]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const [tag, , id] = match;
    const node = element();
    node.hidden = /\shidden(?=\s|>)/.test(tag);
    node.textContent = html.slice(match.index + tag.length).split('<', 1)[0].trim();
    node.focus = () => { activeElement = node; };
    for (const [, name, value] of tag.matchAll(/(aria-[\w-]+)="([^"]*)"/g)) {
      node.setAttribute(name, value);
    }
    elements.set(id, node);
  }

  const document = {
    getElementById: (id) => elements.get(id),
    querySelector: (selector) => elements.get(selector.slice(1)) ?? element(),
    querySelectorAll: () => [],
  };
  const window = { addEventListener() {}, scrollY: 0, location: { href: pageUrl } };
  runInNewContext(script, { document, window }, { filename: 'script.js' });
  const toggle = elements.get('ai-prinyatie-toggle');
  const stages = elements.get(toggle.getAttribute('aria-controls'));
  const collapse = elements.get('ai-prinyatie-collapse');
  return { toggle, stages, collapse, window, getFocusedElement: () => activeElement };
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
