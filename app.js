'use strict';
const BOTS = ['Grok Bot','Jorgy','Mystery Revealed','PLJ Brand','Outlook Bot','EZPZ QBO Bot','Asana Bot','Pipedrive Bot','Wren'];
const UNSURE = 'Tell Grok Bot if this looks different on your screen.';
// Only verified click-paths are given as steps. Unverified features get a general "where" plus the UNSURE note.
const LESSONS = [
  { id:'info', name:'Info', tagline:"Each bot's profile page",
    what:"Every bot has its own info panel. It's the bot's profile: it shows what the bot is working on and the settings that belong to that bot only. Most of the other lessons start here.",
    where:["Open a chat with the bot.","Tap the bot's name at the top of the chat to open its info panel. (On a computer you can also press Cmd+Shift+I.)","Look around: you'll see a live preview of the bot's computer, its Routines list, and Channels if there are any to connect.","The gear next to the X opens that bot's own Settings: picture, name, title, description and notifications.","Close the panel with the X in its top corner."],
    verified:true,
    ask:"What are you for, and what should I know about your profile?" },
  { id:'documents', name:'Documents', tagline:'Files a bot keeps and uses',
    what:"Documents are the files that go with a bot, like notes, reports or files you've given it, so it can use them without you sending them again. Every bot has its own documents.",
    where:["Open the bot's profile (tap its name at the top of the chat) and find the Documents section."],
    verified:false,
    ask:"List the documents you have for me and tell me what each one is for." },
  { id:'computer', name:'Computer', tagline:'Watch what the bot is doing',
    what:"Every bot works on its own computer, with its own screen and web browser. You can watch it work at any time. All of your bots share one machine, but each bot gets its own screen.",
    where:["Open the bot's info panel (tap its name at the top of the chat).","At the top is a live preview of the bot's computer. Tap it to see the full screen.","The Computer tab in the app's main Settings is a different thing. It lists your own computers that are linked to Grok Bot. (To open Settings, tap your account button at the bottom left of the sidebar.)"],
    verified:true,
    ask:"Open a web browser on your computer and show me the weather in Manila." },
  { id:'takecontrol', name:'Take Control', tagline:'You drive the bot\u2019s screen',
    what:"Sometimes a bot needs you, for example to type a password or get past a 'Are you a robot?' check. With Take Control you work the bot's screen yourself, so you type the password instead of giving it to the bot. When you're done, hand control back and the bot keeps going.",
    where:["Open the bot's profile and find the Take Control section."],
    verified:false,
    ask:"I need to sign in to a website for you. Open the sign-in page on your computer and tell me when it's ready for me to take control." },
  { id:'instructions', name:'Instructions', tagline:'Rules the bot always follows',
    what:"Instructions are the rules a bot always follows, such as what its job is, what tone to use, and what it must ask you about first. Clear instructions keep each bot focused on its own job.",
    where:["Open the bot's profile and find the Instructions section.","You can also just tell the bot in chat what you want it to always do."],
    verified:false,
    ask:"From now on, always ask me before you send any email or post anything. Please add that to your instructions." },
  { id:'routines', name:'Routines', tagline:'Jobs that run on their own',
    what:"A routine is a saved request that runs by itself. It can run on a schedule, like every Monday at 8 AM, or when something happens, like a new email arriving. You set one up by asking the bot in chat.",
    where:["In the chat, ask the bot to set up the routine (try the example below).","Open the bot's info panel (tap its name at the top of the chat). Your routines are listed under the computer preview."],
    verified:true,
    ask:"Remind me every Monday at 8 AM to review my pipeline." },
  { id:'notifications', name:'Notifications', tagline:'When each bot pings you',
    what:"Each bot has its own notification setting, so a busy bot doesn't drown out the important ones. The app's main Settings also has notification sounds under General.",
    where:["Open the bot's info panel (tap its name at the top of the chat).","Tap the gear next to the X to open that bot's Settings.","Change that bot's notification setting there."],
    verified:true,
    ask:"What kinds of things will you notify me about, and how often?" },
  { id:'share', name:'Share', tagline:'Show a bot or its work to others',
    what:"Share lets someone else see a bot or what it has made, like a teammate or your editor. Before you share, make sure you know what the other person will be able to see, especially for bots that handle money or private email.",
    where:["Open the bot's profile and find the Share section."],
    verified:false,
    ask:"Before I share you with anyone, tell me exactly what they would be able to see." }
];

const KEY = 'gbAcademy.v1';
const blank = () => ({ view:'home', lesson:0, paused:false, checks:{}, scroll:0 });
let S;
try { S = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { S = blank(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

const $ = s => document.querySelector(s);
const app = $('#app'), title = $('#title'), homeBtn = $('#homeBtn'), pauseBtn = $('#pauseBtn');
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const doneCount = id => BOTS.filter(b => S.checks[id + '|' + b]).length;
const isDone = id => doneCount(id) === BOTS.length;
const totalDone = () => LESSONS.reduce((n, l) => n + doneCount(l.id), 0);

function renderHome() {
  S.view = 'home'; save();
  title.textContent = 'Grok Bot Academy';
  homeBtn.hidden = true; pauseBtn.hidden = true;
  const total = LESSONS.length * BOTS.length, pct = Math.round(totalDone() / total * 100);
  const started = totalDone() > 0 || S.lesson > 0;
  let h = `<div class="card"><h3>Your progress</h3><div class="bar"><i style="width:${pct}%"></i></div>
    <p class="muted">${LESSONS.filter(l => isDone(l.id)).length} of ${LESSONS.length} lessons done &middot; ${totalDone()} of ${total} bot checks</p>
    ${S.paused ? `<p><b>Paused</b> on lesson ${S.lesson + 1}: ${esc(LESSONS[S.lesson].name)}</p>` : ''}
    <button class="big" id="resume">${started ? 'Resume: ' + esc(LESSONS[S.lesson].name) : 'Start lesson 1'}</button></div>`;
  h += LESSONS.map((l, i) => `<button class="lesson-row ${isDone(l.id) ? 'done' : ''} ${i === S.lesson && started ? 'current' : ''}" data-i="${i}">
      <span class="num">${isDone(l.id) ? '&#10003;' : i + 1}</span>
      <span class="meta"><b>${esc(l.name)}</b><small>${esc(l.tagline)} &middot; ${doneCount(l.id)}/${BOTS.length} bots</small></span></button>`).join('');
  h += `<p class="muted" style="font-size:15px">Your progress is saved on this phone. You can close the app and come back at any time.</p>
    <button class="big ghost" id="reset">Start over</button>`;
  app.innerHTML = h;
  $('#resume').onclick = () => openLesson(S.lesson, true);
  app.querySelectorAll('.lesson-row').forEach(b => b.onclick = () => openLesson(+b.dataset.i));
  $('#reset').onclick = () => { if (confirm('Clear all progress and start over?')) { S = blank(); save(); renderHome(); } };
  window.scrollTo(0, 0);
}

function openLesson(i, restoreScroll) {
  S.view = 'lesson'; S.lesson = i; S.paused = false; if (!restoreScroll) S.scroll = 0; save();
  const l = LESSONS[i];
  title.textContent = `${i + 1}. ${l.name}`;
  homeBtn.hidden = false; pauseBtn.hidden = false; pauseBtn.textContent = 'Pause'; pauseBtn.className = 'pill';
  app.innerHTML = `
    <p class="muted">Lesson ${i + 1} of ${LESSONS.length}</p>
    <h2>${esc(l.name)}</h2>
    <div class="card"><h3>What it's for</h3><p>${esc(l.what)}</p></div>
    <div class="card where"><h3>Where to find it</h3><ul class="steps">${l.where.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
    ${l.verified ? '' : `<div class="card note">&#9888;&#65039; ${UNSURE}</div>`}
    <div class="card ask"><h3>Ask your bot</h3><p class="muted">Say or type this to a bot to practice:</p>
      <q>${esc(l.ask)}</q><button class="copy" id="copy">Copy</button></div>
    <div class="card"><h3>Try it now</h3><p class="muted">Go try it on each bot, then come back and tick it off.</p>
      ${BOTS.map(b => `<label class="check"><input type="checkbox" data-b="${esc(b)}" ${S.checks[l.id + '|' + b] ? 'checked' : ''}> ${esc(b)}</label>`).join('')}
      <p id="cnt" class="muted">${doneCount(l.id)}/${BOTS.length} done</p></div>`;
  app.querySelectorAll('input[type=checkbox]').forEach(cb => cb.onchange = () => {
    S.checks[l.id + '|' + cb.dataset.b] = cb.checked; save();
    $('#cnt').textContent = `${doneCount(l.id)}/${BOTS.length} done` + (isDone(l.id) ? ' \u2014 lesson complete!' : '');
  });
  $('#copy').onclick = async () => {
    try { await navigator.clipboard.writeText(l.ask); $('#copy').textContent = 'Copied'; } catch { $('#copy').textContent = 'Press and hold the text to copy'; }
  };
  let nav = document.querySelector('.navbar');
  if (!nav) { nav = document.createElement('nav'); nav.className = 'navbar'; document.body.appendChild(nav); }
  const last = i === LESSONS.length - 1;
  nav.innerHTML = `<button id="back" ${i === 0 ? 'disabled' : ''}>&larr; Back</button>
    <button id="next" class="primary">${last ? 'Finish' : 'Next &rarr;'}</button>`;
  $('#back').onclick = () => i > 0 && openLesson(i - 1);
  $('#next').onclick = () => last ? (removeNav(), renderHome()) : openLesson(i + 1);
  requestAnimationFrame(() => window.scrollTo(0, restoreScroll ? S.scroll || 0 : 0));
}

function removeNav() { const n = document.querySelector('.navbar'); if (n) n.remove(); }

function showPaused() {
  S.paused = true; S.scroll = window.scrollY; save();
  const o = document.createElement('div'); o.className = 'overlay';
  o.innerHTML = `<h2>&#9208; Paused</h2><p>Lesson ${S.lesson + 1}: ${esc(LESSONS[S.lesson].name)}</p>
    <p class="muted">Go practice on your bots. Your place is saved, even if you close the app.</p>
    <button class="big" id="res">&#9654; Resume</button><button class="big ghost" id="toHome">All lessons</button>`;
  document.body.appendChild(o);
  o.querySelector('#res').onclick = () => { o.remove(); openLesson(S.lesson, true); };
  o.querySelector('#toHome').onclick = () => { o.remove(); removeNav(); renderHome(); };
}

pauseBtn.onclick = showPaused;
homeBtn.onclick = () => { S.scroll = window.scrollY; removeNav(); renderHome(); };
let t; window.addEventListener('scroll', () => { clearTimeout(t); t = setTimeout(() => { if (S.view === 'lesson') { S.scroll = window.scrollY; save(); } }, 250); }, {passive:true});

// Start exactly where he left off.
if (S.view === 'lesson') { openLesson(S.lesson, true); if (S.paused) showPaused(); } else renderHome();

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
