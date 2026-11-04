import { mountLineSwap } from './line-swap-160.js';
import { mountDecisionCarousel } from './reactbits/carousel.js';
import { mountTechText } from './reactbits/tech-text.js?v=104';

const motion = matchMedia('(prefers-reduced-motion: reduce)');
const heading = document.querySelector('.identity:not([data-static-name])');
if (heading) {
const surface = document.createElement('span');
surface.className = 'tech-text-surface';
surface.tabIndex = 0;
surface.setAttribute('role', 'button');
surface.setAttribute('aria-label', 'Play with Ghazi’s lettering');
surface.setAttribute('aria-description', 'Drag a letter or press Enter to give it a nudge. It springs back into place.');
surface.title = 'Drag a letter; it springs back.';
heading.appendChild(surface);
let dispose;
function mount() {
  dispose?.();
  surface.replaceChildren();
  surface.removeAttribute('data-ready');
  heading.classList.remove('tech-enhanced');
  surface.hidden = motion.matches;
  if (motion.matches) return;
  dispose = mountTechText(surface, {
    text: 'Ghazi Aryan', fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 500,
    fontSize: 1000, letterSpacing: -.035, color: 'currentColor', accentColor: 'currentColor',
    align: 'left', reveal: 'letter', selection: false, labels: false, lineStyle: 'dashed', guides: false, specks: 0,
    draggable: true, bounce: .12, sweep: false, clickKick: true, intro: 'none',
    paintBounds: heading.closest('.hero'),
  });
}
surface.addEventListener('techtext:ready', () => heading.classList.add('tech-enhanced'));
document.fonts.ready.then(mount);
motion.addEventListener('change', mount);
}

// Complete product screens with visible controls and native keyboard navigation.
const productViews = [
  { file: 'assets/advocate-instant-case.webp', name: 'Instant Case', alt: 'Advocate’s current Instant Case onboarding with a fan of work-entry cards', title: 'Start with one work ramble.', caption: 'A first session shows how a work note can turn into part of your review story. Current app UI with sample data.' },
  { file: 'assets/advocate-instant-result.webp', name: 'First result', alt: 'Instant Case’s first career claim and other supported areas, using sample work', title: 'See what your work already supports.', caption: 'A work ramble becomes a useful claim mapped to a competency, generated on the fly. Here, it’s Impact. Current app UI with sample data.' },
  { file: 'assets/advocate-current-journal.webp', name: 'Capture', alt: 'Advocate’s current Journal screen with work entries and connected threads', title: 'Catch wins while they’re fresh.', caption: 'Journal keeps work notes and their connected threads together as your story grows. Current app UI with sample data.' },
  { file: 'assets/advocate-current-story.webp', name: 'Story', alt: 'Advocate’s current Story screen with career claims and their supporting evidence', title: 'Your review story, kept ready.', caption: 'Work notes build a running story around the areas that matter in your role. Each statement links back to its source. Current app UI with sample data.' },
  { file: 'assets/advocate-current-prepare.webp', name: 'Prepare', alt: 'Advocate’s current Prepare screen for reviews, one-to-ones and résumé bullets', title: 'Ready for the next conversation.', caption: 'Use the same work notes for a review, a one-to-one or the next résumé update. Current app UI with sample data.' },
  { file: 'assets/advocate-current-areas.webp', name: 'Context', alt: 'Advocate’s current evaluation-area selection screen', title: 'What counts in your role?', caption: 'Choose evaluation areas, photograph your company’s rubric or paste its text. The story follows those criteria. Current app UI with sample data.' },
];
const productTabs = [...document.querySelectorAll('[data-preview]')];
const productImage = document.getElementById('appPreview');
const productPanel = document.getElementById('adv-preview-panel');
const galleryTitle = mountLineSwap(document.querySelector('.gallery-headline'),productViews.map(view=>view.title),2);
const galleryCaption = mountLineSwap(document.getElementById('appPreviewCaption'),productViews.map(view=>view.caption),2);
function revealProductTab() {
  const active = productTabs.find(tab => tab.getAttribute('aria-selected') === 'true');
  const strip = active.parentElement;
  if (!strip.clientWidth) return;
  const offset = active.getBoundingClientRect().left - strip.getBoundingClientRect().left;
  strip.scrollTo({ left: strip.scrollLeft + offset - (strip.clientWidth - active.offsetWidth) / 2, behavior: 'instant' });
}
document.getElementById('advocate-case').addEventListener('portfolio:caseopen', () => requestAnimationFrame(revealProductTab));

function selectProduct(index, focus = false, animate = true) {
  const view = productViews[index];
  const update = () => {
  productTabs.forEach((tab, i) => tab.dataset.counter = `${i + 1} / ${productViews.length}`);
  productImage.src = view.file;
  productImage.alt = view.alt;
  productImage.style.objectPosition = 'center';
  
  galleryTitle.show(index,animate);galleryCaption.show(index,animate);
  productPanel.setAttribute('aria-labelledby', productTabs[index].id);
  productTabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  if (focus) productTabs[index].focus({ preventScroll: true });
  revealProductTab();
  };
  if (!animate || productTabs[index].getAttribute('aria-selected') === 'true') update();
  else window.portfolioSwap(productImage.parentElement, update, focus);
}
productTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectProduct(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % productTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + productTabs.length) % productTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = productTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectProduct(next, true); }
  });
});

document.querySelector('.gallery-previous').addEventListener('click', () => {
  const active = productTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  selectProduct((active - 1 + productTabs.length) % productTabs.length);
});
document.querySelector('.gallery-next').addEventListener('click', () => {
  const active = productTabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
  selectProduct((active + 1) % productTabs.length);
});
selectProduct(2);
window.selectAdvocateScreen = index => selectProduct(index, false, false);
productViews.forEach(view => { const preload = new Image(); preload.src = view.file; preload.decode().catch(() => {}); });

// A quiet light table for the original film frames, with native modal focus behavior.
const pictures = [...document.querySelectorAll('.frame img')];
const viewer = document.createElement('dialog');
viewer.className = 'film-viewer';
viewer.setAttribute('aria-label', 'Ghazi’s film photographs');
viewer.innerHTML = '<button type="button" class="viewer-close" aria-label="Close photograph">Close</button><figure><img src="assets/film-medina.webp" alt=""><figcaption></figcaption></figure><div class="viewer-controls"><button type="button" class="viewer-prev">Previous</button><span aria-live="polite"></span><button type="button" class="viewer-next">Next</button></div>';
document.body.append(viewer);
let current = 0;
function showPicture(index) {
  current = (index + pictures.length) % pictures.length;
  const source = pictures[current];
  const image = viewer.querySelector('img');
  image.src = source.src;
  image.alt = source.alt;
  viewer.querySelector('figcaption').textContent = source.nextElementSibling?.textContent || source.closest('.frame').querySelector('.cap').textContent;
  viewer.querySelector('.viewer-controls span').textContent = `0${current + 1} / 03`;
}
let pictureRequest = 0;
let requestedPicture = 0;
const pictureReady = pictures.map(picture => {
  const preload = new Image(); preload.src = picture.src;
  return preload.decode().catch(() => {});
});
async function changePicture(index, keyboard = false) {
  const request = ++pictureRequest;
  requestedPicture = (index + pictures.length) % pictures.length;
  const next = requestedPicture;
  await pictureReady[next];
  if (request !== pictureRequest || !viewer.open) return;
  window.portfolioSwap(viewer.querySelector('figure'), () => showPicture(next), keyboard);
}
pictures.forEach((picture, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'film-open';
  button.setAttribute('aria-label', `View ${picture.alt}`);
  picture.replaceWith(button);
  button.append(picture);
  button.addEventListener('click', () => {
    ++pictureRequest; requestedPicture = index; showPicture(index); viewer.showModal();
  });
});
const closeViewer = () => { ++pictureRequest; viewer.close(); };
viewer.querySelector('.viewer-close').addEventListener('click', closeViewer);
viewer.addEventListener('cancel', event => { event.preventDefault(); closeViewer(); });
viewer.querySelector('.viewer-prev').addEventListener('click', () => changePicture(requestedPicture - 1));
viewer.querySelector('.viewer-next').addEventListener('click', () => changePicture(requestedPicture + 1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    changePicture(requestedPicture + (event.key === 'ArrowRight' ? 1 : -1), true);
  }
});
// The figure stretches beyond the picture; its empty area is also outside the photo.
viewer.addEventListener('click', event => {
  if (!event.target.closest('img,button,figcaption')) closeViewer();
});

// Compare the specific rail drift Ghazi observed, without presenting it as a production screenshot.
document.querySelectorAll('.rail-evidence').forEach((figure, index) => {
  const before = figure.querySelector('.rail-before');
  const windows = [...before.querySelectorAll('.rail-window')].map(window => window.outerHTML);
  const target = figure.querySelector('.rail-target');
  const labels = [
    'Surface A keeps the business-entity-to-risk hierarchy in a light rail.',
    'Surface B inverts the rail and moves the business-entity-to-risk hierarchy into the record.'
  ];
  figure.removeAttribute('role');
  figure.removeAttribute('aria-label');
  before.removeAttribute('aria-hidden');
  before.className = 'rail-comparison';
  const panelId = `rail-variant-${index}`;
  before.innerHTML = `<div class="rail-controls" role="group" aria-label="Compare the original rail variants"><button type="button" aria-pressed="true" aria-controls="${panelId}">Surface A</button><button type="button" aria-pressed="false" aria-controls="${panelId}">Surface B</button></div><div id="${panelId}" class="rail-variant" role="img" aria-label="${labels[0]}">${windows[0]}</div>`;
  target.setAttribute('role','img');
  target.setAttribute('aria-label','The spec generator defined this shared rail component to keep the business-entity-to-risk hierarchy and actions consistent.');
  target.removeAttribute('aria-hidden');
  const decorate = container => {
    const window = container.querySelector('.rail-window');
    window.setAttribute('aria-hidden','true');
    window.insertAdjacentHTML('afterbegin','<div class="rail-appbar"><span>Risk platform</span><span>Assessments / Record</span></div>');
  };
  decorate(before); decorate(target);
  const narrow = matchMedia('(max-width: 560px)');
  const shared = document.createElement('button');
  shared.type = 'button';
  shared.textContent = 'Shared rail';
  shared.setAttribute('aria-controls', panelId + '-shared');
  target.id = panelId + '-shared';
  before.querySelector('.rail-controls').append(shared);
  const controls = [...before.querySelectorAll('button')];
  let selected = narrow.matches ? 2 : 1;
  function selectVariant(variant, animate = true) {
    const update = () => {
    selected = variant;
    const panel = before.querySelector('.rail-variant');
    const original = variant === 2 ? 1 : variant;
    panel.innerHTML = windows[original];
    panel.setAttribute('aria-label', labels[original]);
    decorate(panel);
    panel.hidden = narrow.matches && variant === 2;
    target.hidden = narrow.matches && variant !== 2;
    shared.hidden = !narrow.matches;
    controls.forEach((control, i) => control.setAttribute('aria-pressed', String(i === variant)));
    figure.querySelector('.rail-takeaway').textContent = !narrow.matches || variant === 2
      ? 'A shared rail component defined by the spec generator.'
      : variant === 0 ? 'One surface kept the hierarchy in a light rail.'
      : 'Another inverted the rail and moved the hierarchy into the record.';
    };
    const from = narrow.matches && selected === 2 ? target.querySelector('.rail-window') : before.querySelector('.rail-window');
    if (!animate) update();
    else window.portfolioSwap(narrow.matches && selected === 2 ? target : before.querySelector('.rail-variant'), update);
  }
  controls.forEach((button, variant) => button.addEventListener('click', () => selectVariant(variant)));
  narrow.addEventListener('change', () => selectVariant(!narrow.matches && selected === 2 ? 1 : selected, false));
  selectVariant(selected, false);


});

// Keep the shipped app visible and the local example one explicit control away.
const mainTabs = [...document.querySelectorAll('.main-product-tabs [role="tab"]')];
function selectMainProduct(index, focus = false, animate = true) {
  const update = () => {
  mainTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = false;
    panel.inert = !selected;
    panel.setAttribute('aria-hidden', String(!selected));
    panel.dataset.inactive = String(!selected);
  });
  document.querySelector('.demo-disclosure').style.visibility = index === 1 ? 'visible' : 'hidden';
  if (focus) mainTabs[index].focus({ preventScroll: true });
  };
  update();
  document.querySelector('.live-product').classList.toggle('instant-selection', focus || !animate);
}
mainTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectMainProduct(index));
  tab.addEventListener('keydown', event => {
    if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
      event.preventDefault();
      selectMainProduct(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index, true);
    }
  });
});
selectMainProduct(0);


mountDecisionCarousel(document.querySelector('.decision-reel'));

// The gallery is the default product view; its explicit example action opens the local demo.
document.getElementById('try-advocate-example').addEventListener('click', () => {
  window.setPortfolioCase(document.getElementById('advocate-case'), false, { onward: () => {
    selectMainProduct(1, false, false);
    document.getElementById('advInput').focus({ preventScroll: true });
    const target = document.querySelector('.main-product-tabs');
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 105, behavior: motion.matches ? 'instant' : 'smooth' });
  } });
});

// Compare two real first-session outcomes, inside one fixed evidence window.
const outcomeTabs = [...document.querySelectorAll('.outcome-tabs [role=tab]')];
const outcomes = [
  { state: 'supported', file: 'assets/advocate-instant-result.webp', alt: 'Actual first result from six work details: a supported Impact statement about a retry fix and roadmap', caption: 'A fuller ramble produces a claim tied to a competency, generated on the fly.' },
  { state: 'short', file: 'assets/advocate-short-note.webp', alt: 'Actual short-note result: the original note stays editable, with a request for one specific detail', caption: 'Advocate reflects the ramble as a note without assigning a competency yet. The person can add a detail or choose “Keep this for now.”' }
];
function selectOutcome(index, focus = false) {
  if (outcomeTabs[index].getAttribute('aria-selected') === 'true') { if (focus) outcomeTabs[index].focus(); return; }
  const next = outcomes[index];
  const update = () => {
    const evidence = document.querySelector('.outcome-evidence');
    evidence.dataset.outcome = next.state;
    const picture = evidence.querySelector('img');
    picture.src = next.file;
    picture.alt = next.alt;
    evidence.querySelector('figcaption').innerHTML = next.caption + '<span>Actual app · Sample data</span>';
    document.getElementById('outcome-example').setAttribute('aria-labelledby', outcomeTabs[index].id);
    outcomeTabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    if (focus) outcomeTabs[index].focus({ preventScroll: true });
  };
  window.portfolioSwap(document.getElementById('outcome-example'), update, focus);
}
outcomeTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectOutcome(index));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    selectOutcome(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index, true);
  });
});

// Two distinct stories share a reader; internal jumps never change its route.
const storyNav = document.querySelector('.case-story-nav');
if (storyNav) {
  const reader = storyNav.closest('.case-reader');
  reader?.querySelector('.case-reader-bar').append(storyNav);
  const links = [...storyNav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const markStory = () => {
    const top = reader.getBoundingClientRect().top + Math.max(
      reader.querySelector('.case-reader-bar').getBoundingClientRect().height + 30,
      parseFloat(getComputedStyle(sections[0]).scrollMarginTop) + 2
    );
    let active = 0;
    sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= top) active = i; });
    links.forEach((link, i) => { if (i === active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
  };
  links.forEach((link, i) => link.addEventListener('click', event => {
    event.preventDefault();
    sections[i].tabIndex = -1;
    sections[i].scrollIntoView({ block:'start', behavior:motion.matches ? 'instant' : 'smooth' });
    sections[i].focus({ preventScroll:true });
  }));
  reader?.addEventListener('scroll', markStory, { passive:true });
  document.getElementById('platform-case').addEventListener('portfolio:caseopen', markStory);
}
