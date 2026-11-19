// Leonida Nights — GTA VI trophy tracker.
// Loads the trophy list from data/trophies.json, renders the checklist with
// filters, a spoiler setting and a guide pane, and keeps progress in
// localStorage with export and import. No network use beyond the local data file.

const EARNED_KEY = 'leonida-nights-earned-v1';
const SPOILER_KEY = 'leonida-nights-spoiler-v1';

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  side: 'Side quests',
  crime: 'Crime & robberies',
  secret: 'Secret',
  platinum: 'Platinum & 100%',
  completion: 'Platinum & 100%',
  online: 'Online',
};
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const emptyEl = document.getElementById('emptyState');
const resultEl = document.getElementById('resultLine');
const bannerEl = document.getElementById('missableBanner');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
const statusEl = document.getElementById('statusFilter');
const spoilerEl = document.getElementById('spoilerToggle');

let trophies = [];
let earned = new Set(readStored(EARNED_KEY, []));
let spoiler = readStored(SPOILER_KEY, false) === true;
let selectedId = null;

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function storeEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort()));
}
function storeSpoiler() {
  localStorage.setItem(SPOILER_KEY, JSON.stringify(spoiler));
}
function byId(id) {
  return trophies.find((t) => t.id === id);
}
function isStory(t) {
  return t.kind === 'story';
}
function spoilerHides(t) {
  return spoiler && isStory(t) && !earned.has(t.name);
}
function displayName(t) {
  return spoilerHides(t) ? 'Hidden story trophy' : t.name;
}
function displayDescription(t) {
  return spoilerHides(t) ? 'Spoiler hidden — earn this trophy to reveal it.' : t.description;
}
function kindOf(t) {
  return KIND_LABELS[t.kind] ?? t.kind;
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  const kind = kindEl.value;
  const grade = gradeEl.value;
  const status = statusEl.value;
  if (kind === 'online') return [];
  return trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'platinum' && t.kind !== 'platinum' && t.kind !== 'completion') return false;
    if (kind !== 'all' && kind !== 'missable' && kind !== 'platinum' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.name)) return false;
    if (status === 'todo' && earned.has(t.name)) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function tag(text, cls) {
  const s = document.createElement('span');
  s.className = 'tag' + (cls ? ' ' + cls : '');
  s.textContent = text;
  return s;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  document.getElementById('progressText').textContent = `${n} of ${total} earned`;
  document.getElementById('progressPct').textContent = total ? `${Math.round((n / total) * 100)}%` : '0%';
  document.getElementById('progressFill').style.width = total ? `${(n / total) * 100}%` : '0%';
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(n));
  bar.setAttribute('aria-valuemax', String(total));
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const have = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
      const all = trophies.filter((t) => t.grade === g).length;
      return `${g} ${have}/${all}`;
    })
    .join(' · ');
  document.getElementById('gradeCounts').textContent = counts;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren();
  const kind = kindEl.value;
  if (kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'There are no online trophies: all 55 trophies are offline single-player (PowerPyx). Nothing to show here.';
    resultEl.textContent = '0 of 55 shown — no online trophies exist for this game.';
  } else if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match these filters. Clear the search or pick another kind.';
    resultEl.textContent = '0 of 55 shown.';
  } else {
    emptyEl.hidden = true;
    resultEl.textContent = `${shown.length} of ${trophies.length} shown · ${earned.size} earned`;
  }
  bannerEl.hidden = !trophies.some((t) => t.missable && !earned.has(t.name));
  for (const t of shown) {
    const li = document.createElement('li');
    if (earned.has(t.name)) li.classList.add('earned');
    if (selectedId === t.id) li.classList.add('selected');
    li.dataset.trophyId = String(t.id);

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${displayName(t)}`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      storeEarned();
      renderProgress();
      renderList();
      renderDetail();
    });
    box.addEventListener('click', (e) => e.stopPropagation());

    const medal = document.createElement('span');
    medal.className = `medal ${t.grade}`;
    medal.textContent = GRADE_LETTER[t.grade];
    medal.title = t.grade;

    const body = document.createElement('div');
    body.className = 't-body';
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = displayName(t);
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = displayDescription(t);
    const meta = document.createElement('div');
    meta.className = 't-meta';
    meta.append(tag(t.grade));
    meta.append(tag(kindOf(t)));
    if (t.missable) meta.append(tag('Missable', 'missable'));
    if (t.target && t.target !== 'Unconfirmed') meta.append(tag(t.target, 'target'));
    if (t.target === 'Unconfirmed') meta.append(tag('Unconfirmed', 'unconfirmed'));
    body.append(name, desc, meta);

    const hint = document.createElement('span');
    hint.className = 't-guide-hint';
    hint.textContent = 'Guide ›';

    li.append(box, medal, body, hint);
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderList();
      renderDetail();
      detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    listEl.append(li);
  }
}

function renderDetail() {
  detailEl.replaceChildren();
  const t = selectedId === null ? null : byId(selectedId);
  if (!t) {
    const h = document.createElement('h2');
    h.textContent = 'Pick a trophy to see its guide';
    const p = document.createElement('p');
    p.className = 'desc';
    p.textContent = 'Click any trophy in the list and its full guide opens here — what to do, where and how, when it can be missed, and the sources each fact comes from.';
    const facts = document.createElement('p');
    facts.className = 'guide-text';
    facts.textContent = 'Quick facts: 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze), 28 hidden until earned, 0 online, 1 possibly missable, about 200 hours to the platinum, 1 playthrough. Sources: Exophase and PSNProfiles for the list; PowerPyx for the methods.';
    detailEl.append(h, p, facts);
    return;
  }
  const medal = document.createElement('span');
  medal.className = `medal ${t.grade}`;
  medal.textContent = GRADE_LETTER[t.grade];
  const h = document.createElement('h2');
  h.textContent = displayName(t);
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = displayDescription(t);
  detailEl.append(medal, h, desc);

  const tags = document.createElement('div');
  tags.className = 'tag-row';
  tags.append(tag(t.grade), tag(kindOf(t)));
  if (t.missable) tags.append(tag('Missable', 'missable'));
  if (t.target) tags.append(tag(t.target, 'target'));
  detailEl.append(tags);

  if (t.missable && t.missableNote) {
    const warn = document.createElement('p');
    warn.className = 'spoiler-note';
    warn.textContent = t.missableNote;
    detailEl.append(warn);
  }
  if (spoilerHides(t)) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Spoiler hidden. Earn this story trophy to reveal its guide, or switch “Hide story spoilers” off.';
    detailEl.append(note);
  } else {
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = t.guide;
    detailEl.append(guide);
    if (t.steps && t.steps.length) {
      const stepsTitle = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = 'Steps';
      stepsTitle.append(strong);
      const ol = document.createElement('ol');
      ol.className = 'steps';
      for (const s of t.steps) {
        const li = document.createElement('li');
        li.textContent = s;
        ol.append(li);
      }
      detailEl.append(stepsTitle, ol);
    }
    if (t.sources && t.sources.length) {
      const srcTitle = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = 'Sources';
      srcTitle.append(strong);
      const ul = document.createElement('ul');
      ul.className = 'sources';
      for (const s of t.sources) {
        const li = document.createElement('li');
        if (s.url) {
          const a = document.createElement('a');
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = s.name;
          li.append(a);
        } else {
          li.textContent = s.name;
          li.classList.add('src-note');
        }
        ul.append(li);
      }
      detailEl.append(srcTitle, ul);
    }
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'earn-btn' + (earned.has(t.name) ? ' earned' : '');
  btn.textContent = earned.has(t.name) ? '✓ Earned — click to untick' : 'Mark as earned';
  btn.addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name);
    else earned.add(t.name);
    storeEarned();
    renderProgress();
    renderList();
    renderDetail();
  });
  detailEl.append(btn);
}

function stageNames(stage) {
  return trophies
    .filter((t) => t.roadmap === stage)
    .map((t) => (spoilerHides(t) ? 'Hidden story trophy' : t.name))
    .join(' · ');
}
function renderRoadmap() {
  document.getElementById('stage1List').textContent = stageNames(1);
  document.getElementById('stage2List').textContent = stageNames(2);
  document.getElementById('stage3List').textContent = stageNames(3);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    guide: 'Leonida Nights Trophy Guide & Tracker',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importProgress(file) {
  try {
    const data = JSON.parse(await file.text());
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    const kept = names.filter((n) => typeof n === 'string' && known.has(n));
    earned = new Set(kept);
    storeEarned();
    renderAll();
    resultEl.textContent = `Imported ${kept.length} earned trophies.`;
  } catch {
    resultEl.textContent = 'That file could not be imported. It should be a progress export from this guide.';
  }
}

// Tabs
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((b) => {
      b.classList.remove('active');
      b.removeAttribute('aria-current');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-current', 'page');
    const which = tab.dataset.tab;
    document.getElementById('checklistSection').hidden = which !== 'checklist';
    document.getElementById('roadmapSection').hidden = which !== 'roadmap';
    document.getElementById('aboutSection').hidden = which !== 'about';
  });
});

// Controls
spoilerEl.checked = spoiler;
spoilerEl.addEventListener('change', () => {
  spoiler = spoilerEl.checked;
  storeSpoiler();
  renderList();
  renderDetail();
  renderRoadmap();
});
for (const el of [searchEl, kindEl, gradeEl, statusEl]) {
  el.addEventListener(el === searchEl ? 'input' : 'change', () => {
    renderList();
  });
}
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) importProgress(file);
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned ticks?')) return;
  earned = new Set();
  storeEarned();
  renderAll();
});
document.getElementById('missableJump').addEventListener('click', () => {
  const t = trophies.find((x) => x.missable);
  if (!t) return;
  searchEl.value = '';
  kindEl.value = 'all';
  gradeEl.value = 'all';
  statusEl.value = 'all';
  selectedId = t.id;
  renderList();
  renderDetail();
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// Boot
const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
renderAll();
