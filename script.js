const siteHeader = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-nav');

const contactDialog = document.querySelector('#contact-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogCopy = document.querySelector('.dialog-copy');
const closeButton = document.querySelector('.dialog-close');
const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('.form-status');

const diagnosticDialog = document.querySelector('#diagnostic-dialog');
const diagnosticForm = document.querySelector('#diagnostic-form');
const diagnosticSteps = [...document.querySelectorAll('.diagnostic-step')];
const diagnosticProgress = document.querySelector('.diagnostic-progress');
const diagnosticTitle = document.querySelector('#diagnostic-dialog-title');
const diagnosticNav = document.querySelector('.diagnostic-nav');
const diagnosticBack = document.querySelector('.diagnostic-back');
const diagnosticNext = document.querySelector('.diagnostic-next');
const diagnosticError = document.querySelector('.diagnostic-error');
const diagnosticResult = document.querySelector('.diagnostic-result');
const diagnosticClose = document.querySelector('.diagnostic-close');
const diagnosticRestart = document.querySelector('.diagnostic-restart');
const copyResultButton = document.querySelector('[data-copy-result]');
const discussResultButton = document.querySelector('[data-discuss-result]');
const resultTitle = document.querySelector('#diagnostic-result-title');
const resultContext = document.querySelector('#diagnostic-result-context');
const resultReason = document.querySelector('#diagnostic-result-reason');
const resultSteps = document.querySelector('#diagnostic-result-steps');
const resultFormat = document.querySelector('#diagnostic-result-format');
const diagnosticCopyStatus = document.querySelector('.diagnostic-copy-status');
const reviewsMoreButton = document.querySelector('[data-reviews-more]');
const reviewsMoreNote = document.querySelector('#reviews-more-note');

let currentDiagnosticStep = 1;
let latestDiagnosticText = '';

const dialogModes = {
  review: {
    title: 'Подойдёт ли вам стратегический разбор',
    copy: 'Коротко опишите ситуацию. Разбор длится от 60 до 120 минут, проходит онлайн или очно и стоит от 15 000 до 30 000 рублей.',
    subject: 'Запрос на стратегический разбор'
  },
  support: {
    title: 'Обсудить личное сопровождение',
    copy: 'Расскажите, к какому результату вы хотите прийти за 90 дней.',
    subject: 'Запрос на личное сопровождение'
  },
  publicity: {
    title: 'Обсудить выход в публичность',
    copy: 'Напишите, о какой компании или проекте вы хотите рассказывать и чего ждёте от публичности.',
    subject: 'Запрос на продвижение компании через первое лицо'
  },
  corporate: {
    title: 'Обсудить задачу компании',
    copy: 'Расскажите, для кого нужна программа и какой результат важно получить.',
    subject: 'Запрос на корпоративную программу'
  },
  contact: {
    title: 'Описать ситуацию',
    copy: 'Напишите несколько слов о том, что сейчас происходит. Не нужно заранее выбирать формат работы.',
    subject: 'Вопрос с сайта'
  },
  diagnostic: {
    title: 'Задать вопрос по результату',
    copy: 'Предварительный маршрут уже добавлен в сообщение. Можно дописать детали или один вопрос.',
    subject: 'Результат диагностики'
  }
};

const diagnosticRoutes = {
  growth: {
    title: 'Сейчас полезно увидеть следующую точку роста',
    reason: 'Когда явной проблемы нет, следующий этап легче выбрать через сильные стороны бизнеса, новые возможности и результат, который действительно важен именно сейчас.',
    steps: [
      'Запишите, что в бизнесе уже работает особенно хорошо.',
      'Выберите одну возможность, которая может усилить этот результат.',
      'Определите небольшой шаг, которым можно проверить её в ближайшие две недели.'
    ],
    format: 'Стратегический разбор'
  },
  focus: {
    title: 'Сейчас важно выбрать одно главное направление',
    reason: 'Пока несколько задач кажутся одинаково важными, внимание распределяется между ними и ни одна не получает нужного движения.',
    steps: [
      'Выпишите все действующие проекты, идеи и обязательства.',
      'Отметьте, что уже даёт результат или ведёт к важной для вас цели.',
      'Выберите одно направление главным на ближайшие две недели.'
    ],
    format: 'Стратегический разбор'
  },
  direction: {
    title: 'Сейчас важно увидеть направление следующего этапа',
    reason: 'Новое решение легче принять, когда понятны текущая точка, желаемый результат и критерии, по которым вы будете выбирать путь.',
    steps: [
      'Зафиксируйте, что в бизнесе уже работает и что вы хотите сохранить.',
      'Опишите результат, который хотите увидеть через три месяца.',
      'Сравните возможные направления по пользе, ресурсам и срокам.'
    ],
    format: 'Стратегический разбор'
  },
  system: {
    title: 'Сейчас важно уменьшить зависимость бизнеса от вас',
    reason: 'Когда большая часть решений держится на одном человеке, на развитие остаётся всё меньше времени и сил.',
    steps: [
      'Запишите задачи и решения, которые повторяются каждую неделю.',
      'Отметьте, что можно передать другому человеку без риска для результата.',
      'Передайте одну задачу вместе с понятным результатом и сроком.'
    ],
    format: 'Стратегический разбор или личное сопровождение'
  },
  team: {
    title: 'Сейчас важно договориться о ролях и общем результате',
    reason: 'Людям легче брать ответственность, когда они понимают цель, свою часть работы и правила взаимодействия.',
    steps: [
      'Сформулируйте один общий результат на ближайший период.',
      'Запишите, кто за какую часть результата отвечает.',
      'Проведите короткую встречу и зафиксируйте договорённости.'
    ],
    format: 'Стратегический разбор или корпоративная программа'
  },
  publicity: {
    title: 'Сейчас важно собрать понятный выход в публичность',
    reason: 'Публичность помогает бизнесу, когда связана с вашей реальной экспертизой, интересом аудитории и понятным следующим действием.',
    steps: [
      'Определите, ради какого результата вы готовы выходить в публичность.',
      'Выберите три темы на пересечении вашего опыта и вопросов клиентов.',
      'Найдите одну подходящую площадку и предложите конкретную тему.'
    ],
    format: 'Продвижение компании через первое лицо'
  },
  network: {
    title: 'Сейчас важно понять, кто или что ускорит следующий шаг',
    reason: 'Иногда для движения нужна не новая стратегия, а точное знакомство, эксперт, знание или подходящая площадка.',
    steps: [
      'Сформулируйте задачу и результат, который вам нужен.',
      'Определите, какого знания, человека или ресурса не хватает.',
      'Подготовьте короткое и конкретное предложение для первого разговора.'
    ],
    format: 'Разбор ситуации и навигация по возможностям'
  },
  energy: {
    title: 'Сейчас важно освободить силы для главного',
    reason: 'Большое количество дел не всегда означает движение. Рабочий ритм возвращается, когда видно главное, лишнее убрано, а отдых перестаёт быть случайностью.',
    steps: [
      'Запишите всё, что забирало время и силы последние семь дней.',
      'Отметьте, что можно убрать, перенести или передать другому.',
      'Заранее поставьте в календарь время на главное дело и на отдых.'
    ],
    format: 'Стратегический разбор с возможным сопровождением'
  }
};

const businessDescriptions = {
  solo: 'Вы развиваете дело самостоятельно.',
  small: 'У вас небольшой бизнес и первые сотрудники.',
  medium: 'У вас растущая команда от 6 до 20 человек.',
  large: 'В вашей компании больше 20 сотрудников.',
  corporate: 'Вы представляете крупную компанию или корпорацию.'
};

const resultDescriptions = {
  plan: 'Вам важно получить ясный план.',
  steps: 'Вам важно быстро перейти от решения к первым действиям.',
  system: 'Вам важно уменьшить зависимость работы от одного человека.',
  team: 'Вам важно, чтобы команда понимала общий результат.',
  publicity: 'Вам нужен подготовленный выход в публичность.',
  network: 'Вам нужен разговор или возможность, которые помогут двигаться дальше.',
  energy: 'Вам важно освободить время и силы для главного.'
};

function closeMenu() {
  mobileMenu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}

function updateHeader() {
  siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
}

function openContact(modeKey = 'contact', message = '') {
  const mode = dialogModes[modeKey] || dialogModes.contact;
  dialogTitle.textContent = mode.title;
  dialogCopy.textContent = mode.copy;
  contactForm.dataset.subject = mode.subject;
  contactForm.elements.message.value = message;
  formStatus.textContent = '';
  closeMenu();
  contactDialog.showModal();
}

function showDiagnosticStep(step) {
  currentDiagnosticStep = step;
  diagnosticSteps.forEach((item) => item.classList.toggle('is-active', Number(item.dataset.step) === step));
  diagnosticProgress.textContent = `Вопрос ${step} из 5`;
  diagnosticBack.disabled = step === 1;
  diagnosticNext.textContent = step === 5 ? 'Показать результат' : 'Дальше';
  diagnosticError.textContent = '';
  diagnosticDialog.scrollTop = 0;
}

function resetDiagnostic() {
  diagnosticForm.reset();
  diagnosticResult.hidden = true;
  diagnosticNav.hidden = false;
  diagnosticTitle.hidden = false;
  diagnosticProgress.hidden = false;
  latestDiagnosticText = '';
  diagnosticCopyStatus.textContent = '';
  showDiagnosticStep(1);
}

function openDiagnostic() {
  closeMenu();
  resetDiagnostic();
  diagnosticDialog.showModal();
}

function selectedValues(name) {
  return [...diagnosticForm.querySelectorAll(`[name="${name}"]:checked`)].map((input) => input.value);
}

function stepIsValid(step) {
  if (step === 1) return selectedValues('situation').length > 0;
  const names = { 2: 'business', 3: 'goal', 4: 'barrier', 5: 'result' };
  return selectedValues(names[step]).length > 0;
}

function chooseDiagnosticRoute() {
  const scores = {};
  const add = (key, amount) => {
    const normalized = key === 'choice' || key === 'delay' || key === 'plan' || key === 'steps' ? 'focus' : key;
    if (diagnosticRoutes[normalized]) scores[normalized] = (scores[normalized] || 0) + amount;
  };

  selectedValues('situation').forEach((value) => add(value, 3));
  selectedValues('goal').forEach((value) => add(value, 4));
  selectedValues('barrier').forEach((value) => add(value, 2));
  selectedValues('result').forEach((value) => add(value, 1));

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'focus';
}

function renderDiagnosticResult() {
  const routeKey = chooseDiagnosticRoute();
  const route = diagnosticRoutes[routeKey];
  const business = selectedValues('business')[0];
  const expectedResult = selectedValues('result')[0];
  const format = business === 'corporate' && routeKey === 'team'
    ? 'Корпоративная программа под задачу компании'
    : route.format;

  resultTitle.textContent = route.title;
  resultContext.textContent = `${businessDescriptions[business] || ''} ${resultDescriptions[expectedResult] || ''}`.trim();
  resultReason.textContent = route.reason;
  resultSteps.innerHTML = route.steps.map((step) => `<li>${step}</li>`).join('');
  resultFormat.textContent = format;

  latestDiagnosticText = [
    route.title,
    '',
    resultContext.textContent,
    '',
    route.reason,
    '',
    'Три первых действия:',
    ...route.steps.map((step, index) => `${index + 1}. ${step}`),
    '',
    `Подходящий формат: ${format}`
  ].join('\n');

  diagnosticSteps.forEach((step) => step.classList.remove('is-active'));
  diagnosticTitle.hidden = true;
  diagnosticProgress.hidden = true;
  diagnosticNav.hidden = true;
  diagnosticResult.hidden = false;
  diagnosticDialog.scrollTop = 0;
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Открыть меню' : 'Закрыть меню');
  mobileMenu.classList.toggle('is-open', !open);
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

document.querySelectorAll('[data-dialog-mode]').forEach((trigger) => {
  trigger.addEventListener('click', () => openContact(trigger.dataset.dialogMode || 'contact'));
});

document.querySelectorAll('[data-diagnostic-open]').forEach((trigger) => {
  trigger.addEventListener('click', openDiagnostic);
});

closeButton.addEventListener('click', () => contactDialog.close());
diagnosticClose.addEventListener('click', () => diagnosticDialog.close());

contactDialog.addEventListener('click', (event) => {
  if (event.target === contactDialog) contactDialog.close();
});

diagnosticDialog.addEventListener('click', (event) => {
  if (event.target === diagnosticDialog) diagnosticDialog.close();
});

diagnosticForm.querySelectorAll('[name="situation"]').forEach((input) => {
  input.addEventListener('change', () => {
    const checked = selectedValues('situation');
    if (checked.length <= 2) return;
    input.checked = false;
    diagnosticError.textContent = 'Выберите не больше двух вариантов.';
  });
});

diagnosticNext.addEventListener('click', () => {
  if (!stepIsValid(currentDiagnosticStep)) {
    diagnosticError.textContent = 'Выберите вариант, который ближе всего к вашей ситуации.';
    return;
  }

  if (currentDiagnosticStep === 5) {
    renderDiagnosticResult();
    return;
  }

  showDiagnosticStep(currentDiagnosticStep + 1);
});

diagnosticBack.addEventListener('click', () => {
  if (currentDiagnosticStep > 1) showDiagnosticStep(currentDiagnosticStep - 1);
});

diagnosticRestart.addEventListener('click', resetDiagnostic);

discussResultButton.addEventListener('click', () => {
  diagnosticDialog.close();
  openContact('diagnostic', latestDiagnosticText);
});

async function copyRequest(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand('copy');
  helper.remove();
  return copied;
}

copyResultButton.addEventListener('click', async () => {
  try {
    const copied = await copyRequest(latestDiagnosticText);
    diagnosticCopyStatus.textContent = copied ? 'Результат скопирован.' : 'Не удалось скопировать автоматически.';
  } catch {
    diagnosticCopyStatus.textContent = 'Не удалось скопировать автоматически.';
  }
});

if (reviewsMoreButton && reviewsMoreNote) {
  reviewsMoreButton.addEventListener('click', () => {
    const isExpanded = reviewsMoreButton.getAttribute('aria-expanded') === 'true';
    reviewsMoreButton.setAttribute('aria-expanded', String(!isExpanded));
    reviewsMoreNote.hidden = isExpanded;
    reviewsMoreButton.textContent = isExpanded ? 'Посмотреть ещё отзывы' : 'Скрыть сообщение';
  });
}

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const data = new FormData(contactForm);
  const requestText = [
    contactForm.dataset.subject || 'Запрос с сайта',
    `Имя: ${data.get('name')}`,
    `Сообщение: ${data.get('message')}`
  ].join('\n');

  const telegramUrl = `https://t.me/natabediana?text=${encodeURIComponent(requestText)}`;
  const telegramWindow = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  formStatus.textContent = 'Открываем Telegram с подготовленным сообщением.';
  if (!telegramWindow) window.location.href = telegramUrl;
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();
