/**
 * Shared quiz, flashcard, and spaced-repetition engine.
 *
 * Lesson pages only supply data (see lektion4/data.json). This file renders
 * the shell and runs the session. Progress is stored under lesson.storeKey,
 * which stays the historical localStorage key for each lesson.
 *
 * The scheduling constants and the session logic were moved here unchanged
 * from the duplicated lesson pages.
 */

/** Spaced-repetition timing shared by every lesson. Box 1 is the short fail delay. */
export const SRS = {
  DAY: 86400000,
  NEW_WORDS: 12,
  NEW_QS: 5,
  FAIL_MS: 10 * 60 * 1000
};

/** Next Leitner box after a correct answer. Box 0 (new) and box 1 both advance to 2. */
export function nextBox(box) {
  return Math.min(5, (box < 1 ? 1 : box) + 1);
}

/** Polish plural: one / few (2–4, except 12–14) / many. */
export function plNum(n, one, few, many) {
  const n10 = n % 10, n100 = n % 100;
  if (n === 1) return one;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few;
  return many;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Static shell. Lesson copy comes from the data file; everything else is shared. */
export function renderShell(lesson) {
  return `<a class="skip" href="#home">Przejdź do treści</a>
<aside class="sidebar">
  <a class="logo" href="../"><i><span aria-hidden="true" class="ms fill">style</span></i>Deutsch B1</a>
  <button type="button" class="sn" data-act="nav" data-go="dzis" data-nav="dzis"><span aria-hidden="true" class="ms fill">today</span>Dziś</button>
  <button type="button" class="sn" data-act="nav" data-go="fiszki" data-nav="fiszki"><span aria-hidden="true" class="ms">style</span>Fiszki</button>
  <button type="button" class="sn" data-act="nav" data-go="gramatyka" data-nav="gramatyka"><span aria-hidden="true" class="ms">menu_book</span>Gramatyka</button>
  <button type="button" class="sn" data-act="nav" data-go="test" data-nav="test"><span aria-hidden="true" class="ms">task_alt</span>Test</button>
  <a class="sn" href="../spojniki/"><span aria-hidden="true" class="ms">link</span>Spójniki</a>
  <button type="button" class="sn" data-act="nav" data-go="postep" data-nav="postep"><span aria-hidden="true" class="ms">bar_chart</span>Postęp</button>
</aside>
<div class="shell">

  <div class="screen" id="home">
    <div class="home">
      <div class="home-top">
        <div>
          <p class="crumb"><a href="../">${escapeHtml(lesson.crumb)}</a><span class="desk"> · Schritte plus Neu B1</span></p>
          <h1 id="greet">Dzień dobry!</h1>
        </div>
        <div class="streak" id="h-streak" aria-label="Seria dni"><span aria-hidden="true" class="ms fill" aria-hidden="true">local_fire_department</span> 0 dni</div>
      </div>
      <div class="cols">
        <div>
          <section class="hero" aria-labelledby="due-label">
            <div class="stack" aria-hidden="true"><i></i><i></i><i><span aria-hidden="true" class="ms fill">style</span></i></div>
            <div class="kicker" id="due-label">Dziś do powtórki</div>
            <div class="hero-n" id="h-count">0 <span>kart</span></div>
            <p class="mix" id="h-mix"></p>
            <button type="button" class="go5" id="h-start" data-act="start-5">
              <span class="pi" aria-hidden="true"><span aria-hidden="true" class="ms fill">timer</span></span>
              <span class="tx"><b>Start 5 min</b><small>mix na dziś</small></span>
              <span aria-hidden="true" class="ms" aria-hidden="true">arrow_forward</span>
            </button>
            <button type="button" class="nolim" id="h-all" data-act="start-all"><span aria-hidden="true" class="ms" aria-hidden="true">all_inclusive</span><span id="h-all-label">Bez limitu</span></button>
          </section>
          <p class="kbd">Naciśnij <b>Enter</b>, aby zacząć 5 min</p>
          <button type="button" class="cont" id="h-continue" data-act="continue" data-id="">
            <span class="rg" id="h-ring" role="img" aria-label="Postęp tematu"><i>0/0</i></span>
            <span class="tx"><small>Kontynuuj</small><b id="h-cont-title"></b><span class="s2" id="h-cont-sub"></span></span>
            <span aria-hidden="true" class="ms" aria-hidden="true">arrow_forward</span>
          </button>
          <div class="sec inset">Tryby</div>
          <div class="modes">
            <button type="button" class="mode" data-act="nav" data-go="fiszki"><span class="mi red"><span aria-hidden="true" class="ms fill">style</span></span><b>Fiszki</b><small id="m-flash-n"></small></button>
            <button type="button" class="mode" data-act="nav" data-go="gramatyka"><span class="mi blue"><span aria-hidden="true" class="ms fill">menu_book</span></span><b>Gramatyka</b><small id="m-gram-n"></small></button>
            <button type="button" class="mode" data-act="nav" data-go="test"><span class="mi green"><span aria-hidden="true" class="ms fill">task_alt</span></span><b>Test</b><small id="m-test-n"></small></button>
          </div>
        </div>
        <div>
          <section class="panel topics-panel" aria-labelledby="topics-label">
            <div class="sec"><span id="topics-label">${escapeHtml(lesson.topicsLabel)}</span><small id="h-topic-meta"></small></div>
            <div id="h-topics"></div>
          </section>
          <section class="panel head-bad" id="h-miss-panel" hidden>
            <div class="sec"><span id="h-miss-title">Błędy</span><small id="h-miss-sub"></small></div>
            <div class="err-list" id="h-mistakes"></div>
          </section>
        </div>
      </div>
      <p class="foot">${escapeHtml(lesson.footerNote)} <a href="../spojniki/">Spójniki i szyk</a></p>
    </div>
  </div>

  <div class="screen" id="vocabHome">
    <div class="pad">
      <div class="page-head">
        <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
        <h1>Fiszki</h1>
      </div>
      <p class="lead">Wybierz grupy. Na fiszce: rodzajnik w kolorze, formy, notatka i przykład. Przesuń w prawo, gdy znasz.</p>
      <div class="chips" id="chips"></div>
      <p class="counter" id="v-count"></p>
      <div class="bar" aria-hidden="true"><i id="v-bar"></i></div>
      <div class="stack-btns">
        <button type="button" class="go5" data-act="flash"><span class="pi"><span aria-hidden="true" class="ms fill">style</span></span><span class="tx"><b>Fiszki</b><small>przerzucanie i ocena</small></span></button>
        <button type="button" class="nolim" data-act="quiz-de">Quiz: niemiecki → polski</button>
        <button type="button" class="nolim" data-act="quiz-pl">Quiz: polski → niemiecki</button>
      </div>
      <details><summary>Lista słówek w wybranych grupach</summary><div class="word-list" id="word-list"></div></details>
    </div>
  </div>

  <div class="screen" id="grammar">
    <div class="pad">
      <div class="page-head">
        <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
        <h1>Gramatyka</h1>
        <button type="button" class="bk" data-act="info" aria-label="Przypomnienie gramatyki" style="margin-left:auto"><span aria-hidden="true" class="ms">info</span></button>
      </div>
      <p class="lead" id="g-meta"></p>
      <div class="panel topics-panel" id="g-list"></div>
    </div>
  </div>

  <div class="screen" id="tests">
    <div class="pad">
      <div class="page-head">
        <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
        <h1>Test</h1>
      </div>
      <p class="lead">Test lekcji ma trzy części i osobny wynik każdej z nich. Mieszany test losuje 20 pytań.</p>
      <div id="test-cards"></div>
    </div>
  </div>

  <div class="screen" id="progress">
    <div class="pad">
      <div class="page-head">
        <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
        <h1>Postęp</h1>
      </div>
      <div class="stat">
        <div><b id="p-streak">0</b>seria</div>
        <div><b id="p-known">0</b>znane słówka</div>
        <div><b id="p-test">–</b>rekord testu</div>
      </div>
      <div class="subhead">Tematy i rekordy</div>
      <div id="p-rows"></div>
      <p class="foot"><button type="button" class="linkish" data-act="reset">Wyzeruj postęp</button> · <a href="../spojniki/">Spójniki</a> · <a href="../">Wszystkie lekcje</a></p>
    </div>
  </div>

  <div class="screen" id="reminder">
    <div class="pad">
      <div class="page-head">
        <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
        <div style="min-width:0;flex:1">
          <h1 id="r-title" style="font-size:22px"></h1>
          <p class="title-pl" id="r-pl" style="font-size:14px"></p>
        </div>
        <button type="button" class="bk" data-act="info" aria-label="Przypomnienie gramatyki"><span aria-hidden="true" class="ms">info</span></button>
      </div>
      <div class="tag" id="r-src"></div>
      <div class="reminder-box prose" id="r-body"></div>
      <button type="button" class="go5" id="r-start" data-act="begin" style="margin-top:16px"><span class="tx"><b>Zaczynam ćwiczenia</b><small>pełny zestaw tego tematu</small></span><span aria-hidden="true" class="ms">arrow_forward</span></button>
    </div>
  </div>

  <div class="screen" id="game" aria-live="polite">
    <div class="game">
      <div id="head-timed">
        <div class="th">
          <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">close</span></button>
          <div class="tb" aria-hidden="true"><i id="time-bar"></i></div>
          <button type="button" class="bk" data-act="info" aria-label="Przypomnienie gramatyki"><span aria-hidden="true" class="ms">info</span></button>
          <div class="tim"><span class="rg" id="time-ring" aria-hidden="true"><i></i></span><span id="time-label">5:00</span></div>
        </div>
      </div>
      <div id="head-quiz" hidden>
        <div class="qh">
          <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
          <div class="t"><b id="g-title"></b><small id="g-pl"></small></div>
          <button type="button" class="bk" data-act="info" aria-label="Przypomnienie gramatyki"><span aria-hidden="true" class="ms">info</span></button>
        </div>
        <div class="prog"><div class="b"><i id="q-progress"></i></div></div>
      </div>
      <p class="meta"><span id="qnum">pytanie 1</span><span id="scoreline">0 dobrze</span></p>
      <span id="score" class="sr-only">0</span>
      <span id="streak" class="sr-only">0</span>
      <span id="q-progress-label" class="sr-only"></span>
      <div class="qc" id="qarea">
        <div class="tagc" id="case-label"></div>
        <div class="sentence" id="sentence"></div>
        <p class="hint" id="hint"></p>
      </div>
      <div id="answer-zone"></div>
      <div id="card-slot" hidden></div>
    </div>
  </div>

  <div class="screen" id="flash">
    <div class="flash">
      <div class="qh">
        <button type="button" class="bk" data-act="back" aria-label="Wstecz"><span aria-hidden="true" class="ms">arrow_back</span></button>
        <div class="t"><b id="f-group">Fiszki</b><small id="f-counter"></small></div>
        <button type="button" class="bk" data-act="audio" aria-label="Odtwórz wymowę"><span aria-hidden="true" class="ms">volume_up</span></button>
      </div>
      <label class="toggle"><input type="checkbox" id="only-unknown"> Pokaż tylko te, których jeszcze nie znam</label>
      <div class="card-stage">
        <div class="swipe-card" id="flashcard" tabindex="0" role="button" aria-label="Fiszka. Spacja odwraca.">
          <div class="known-badge" id="f-badge" hidden>znam</div>
          <div class="front" id="f-front"></div>
          <div class="back" id="f-back"></div>
        </div>
        <div class="swipe-legend" aria-hidden="true">
          <span class="no"><span aria-hidden="true" class="ms">arrow_back</span> nie wiem</span>
          <span class="mid"><span aria-hidden="true" class="ms">swipe</span> przesuń kartę</span>
          <span class="yes">znam <span aria-hidden="true" class="ms">arrow_forward</span></span>
        </div>
        <div class="bt2">
          <button type="button" class="no" data-act="dont">Nie wiem<small>wróci za 10 min</small></button>
          <button type="button" class="yes" data-act="know">Znam<small id="know-sub">następna: za 1 dzień</small></button>
        </div>
        <div class="flash-tools">
          <button type="button" class="ghost" data-act="flash-prev">Wstecz</button>
          <button type="button" class="ghost" data-act="flip">Odwróć</button>
          <button type="button" class="ghost" data-act="flash-next">Dalej</button>
        </div>
      </div>
    </div>
  </div>

  <div class="screen" id="over">
    <div class="sum">
      <div class="sum-top">
        <div class="k"><span aria-hidden="true" class="ms">timer</span> Sesja zakończona · <span id="sum-time">0:00</span></div>
        <div class="streak" id="sum-streak"></div>
      </div>
      <div class="score" id="final-score">0<span>/0</span></div>
      <p class="final-message" id="final-message"></p>
      <div class="stat">
        <div><b id="sum-pct">0%</b>poprawne</div>
        <div id="stat-cards"><b id="sum-cards">0</b>fiszek</div>
        <div id="stat-gram"><b id="sum-gram">0</b>gramatyka</div>
      </div>
      <div id="breakdown" class="breakdown"></div>
    </div>
    <div id="miss-wrap">
      <div class="subhead" id="miss-title">Błędy</div>
      <div id="mistake-list"></div>
    </div>
    <div id="gains-wrap">
      <div class="subhead">Postęp tematów</div>
      <div class="pad" style="padding-top:0" id="gains"></div>
    </div>
    <div class="actions">
      <button type="button" class="btn red" id="repeat-btn" data-act="repeat">Powtórz błędy</button>
      <button type="button" class="btn s" id="again-btn" data-act="again">Jeszcze raz</button>
      <button type="button" class="btn t" data-act="home">Zakończ na dziś</button>
    </div>
  </div>
</div>

<nav class="tabbar" aria-label="Nawigacja">
  <button type="button" data-act="nav" data-go="dzis" data-nav="dzis"><span aria-hidden="true" class="ms fill">today</span>Dziś</button>
  <button type="button" data-act="nav" data-go="fiszki" data-nav="fiszki"><span aria-hidden="true" class="ms">style</span>Fiszki</button>
  <button type="button" data-act="nav" data-go="gramatyka" data-nav="gramatyka"><span aria-hidden="true" class="ms">menu_book</span>Gramatyka</button>
  <button type="button" data-act="nav" data-go="postep" data-nav="postep"><span aria-hidden="true" class="ms">bar_chart</span>Postęp</button>
</nav>

<div class="sheet" id="feedback" hidden>
  <div class="sheet-card">
    <div class="handle" aria-hidden="true"></div>
    <div class="sh">
      <div class="ic ok"><span aria-hidden="true" class="ms">check</span></div>
      <div><b id="feedback-text">Dobrze!</b><small id="feedback-sub"></small></div>
    </div>
    <div class="sheet-scroll">
      <div id="solution"></div>
      <div class="explanation" id="explanation"></div>
    </div>
    <button type="button" class="cta" id="next-btn" data-act="next">Dalej <span aria-hidden="true" class="ms">arrow_forward</span></button>
  </div>
</div>

<div class="overlay" id="timesheet" hidden>
  <div class="dim"></div>
  <div class="sheet-card" role="dialog" aria-modal="true" aria-labelledby="time-title">
    <div class="sbig">
      <div class="clk"><span aria-hidden="true" class="ms">schedule</span></div>
      <h3 id="time-title">5 minut minęło</h3>
      <p id="time-copy"></p>
    </div>
    <button type="button" class="btn p" data-act="finish-q"><span aria-hidden="true" class="ms">edit</span> Dokończ to pytanie</button>
    <button type="button" class="btn s" data-act="add-five"><span aria-hidden="true" class="ms">more_time</span> Jeszcze 5 min</button>
    <button type="button" class="btn t" data-act="end-now">Zakończ i zobacz wynik</button>
  </div>
</div>

<div class="modal" id="help" hidden>
  <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="help-title">
    <button type="button" class="close-btn" data-act="close-help" aria-label="Zamknij">✕</button>
    <h2 id="help-title">Przypomnienie gramatyki</h2>
    <div id="help-body"></div>
  </div>
</div>
`;
}

async function loadLesson(dataUrl) {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error("Could not load lesson data (" + res.status + ")");
  const lesson = await res.json();
  if (!lesson || typeof lesson.storeKey !== "string" || !Array.isArray(lesson.topics) || !Array.isArray(lesson.vocab)) {
    throw new Error("Lesson data is missing storeKey, topics, or vocab");
  }
  return lesson;
}

export async function startLesson(dataUrl) {
  let lesson;
  try {
    lesson = await loadLesson(dataUrl);
  } catch (err) {
    console.error(err);
    document.body.innerHTML = '<p class="foot" style="padding:24px">Nie udało się wczytać lekcji. Odśwież stronę.</p>';
    return;
  }
  document.title = lesson.title;
  document.body.innerHTML = renderShell(lesson);
  runLesson(lesson);
}

function runLesson(lesson) {
const TOPICS = lesson.topics;
const VOCAB = lesson.vocab;
const VOCAB_GROUPS = lesson.vocabGroups;
const STORE_KEY = lesson.storeKey;
const REF = lesson.customRef || "";
const MEINE_GAPS = lesson.customGaps || [];
const DAY = SRS.DAY;
const NEW_WORDS = SRS.NEW_WORDS;
const NEW_QS = SRS.NEW_QS;
const FAIL_MS = SRS.FAIL_MS;
const BOX_MS = {1: FAIL_MS, 2: DAY, 3: 4 * DAY, 4: 8 * DAY, 5: 21 * DAY};
const LETTERS = "ABCDEFGH";

const $ = id => document.getElementById(id);
function esc(s){ return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]]; } return r; }
function dateKey(ts){ const d=new Date(ts==null?Date.now():ts); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function startOfDay(ts){ const d=new Date(ts==null?Date.now():ts); d.setHours(0,0,0,0); return d.getTime(); }
function formatAhead(ms){
  const m=Math.max(1, Math.round(ms/60000));
  if(m<60) return "za "+m+" min";
  if(ms>=20*3600000){
    const d=Math.max(1, Math.round(ms/DAY));
    return "za "+d+" "+plNum(d,"dzień","dni","dni");
  }
  const h=Math.max(1, Math.round(ms/3600000));
  return "za "+h+" godz.";
}
function formatClock(ms){
  const s=Math.max(0, Math.round(ms/1000));
  return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");
}
function greeting(){
  const h=new Date().getHours();
  if(h<5 || h>=22) return "Dobranoc";
  if(h<18) return "Dzień dobry";
  return "Dobry wieczór";
}
function topicById(id){ return TOPICS.find(t=>t.id===id); }
function qKey(topic, index){ return topic+":"+index; }
function withPl(title, pl){ return pl ? title+" · "+pl : title; }
function germanOnly(title){ return String(title||"").replace(/^[^\p{L}]+/u,"").replace(/\s·\s.*$/,""); }

function defaultStore(){
  return {best:{}, known:{}, groups:null, srs:{}, gsrs:{}, mistakes:[], lastMistakes:[], streak:{n:0, day:""}, lastTopic:null, mastered:{}, migratedKnown:true};
}
function loadStore(){
  try{
    const s=JSON.parse(localStorage.getItem(STORE_KEY));
    if(s && s.best && s.known){
      s.srs=s.srs||{};
      s.gsrs=s.gsrs||{};
      s.mistakes=Array.isArray(s.mistakes)?s.mistakes:[];
      s.lastMistakes=Array.isArray(s.lastMistakes)?s.lastMistakes:[];
      s.streak=s.streak && typeof s.streak.n==="number" ? s.streak : {n:0, day:""};
      if(!s.lastTopic) s.lastTopic=null;
      s.mastered=s.mastered||{};
      if(!s.migratedKnown){
        const due=Date.now()+4*DAY;
        for(const [w,on] of Object.entries(s.known)){
          if(on && !s.srs[w]) s.srs[w]={box:3, due, intro:Date.now()-30*DAY, introDay:""};
        }
        s.migratedKnown=true;
        s._needsSave=true;
      }
      return s;
    }
  }catch(e){}
  return defaultStore();
}
function saveStore(){
  try{
    const copy=Object.assign({}, store);
    delete copy._needsSave;
    localStorage.setItem(STORE_KEY, JSON.stringify(copy));
  }catch(e){}
}
function resetProgress(){
  if(!confirm("Na pewno wyzerować wszystkie wyniki, serię i plan powtórek?")) return;
  store=defaultStore();
  saveStore();
  queueCache=null;
  go("postep", true);
}

var store=null;
var session=null;
var queueCache=null;
var current=null;
var deck=[];
var fi=0;
var applying=false;

function masteredCount(id){
  const m=store.mastered[id];
  if(!m) return 0;
  return Object.keys(m).filter(k=>m[k]).length;
}
function mistakeSet(kind){
  return new Set(store.mistakes.filter(m=>m.kind===kind).map(m=>m.key));
}
function allGrammar(){
  const out=[];
  for(const t of TOPICS){
    if(t.isTest) continue;
    t.questions.forEach((q,i)=>out.push({topic:t.id, index:i, q, title:t.title, pl:t.pl||""}));
  }
  return out;
}
function ensureIntro(){
  const day=dateKey();
  const now=Date.now();
  let wordRoom=NEW_WORDS - Object.values(store.srs).filter(s=>s.introDay===day).length;
  if(wordRoom>0){
    for(const w of VOCAB){
      if(wordRoom<=0) break;
      if(store.srs[w.d] || store.known[w.d]) continue;
      store.srs[w.d]={box:0, due:now, intro:now, introDay:day};
      wordRoom--;
    }
  }
  let qRoom=NEW_QS - Object.values(store.gsrs).filter(s=>s.introDay===day).length;
  if(qRoom>0){
    const miss=mistakeSet("q");
    for(const item of allGrammar()){
      if(qRoom<=0) break;
      const k=qKey(item.topic, item.index);
      if(store.gsrs[k] || miss.has(k)) continue;
      if(store.mastered[item.topic] && store.mastered[item.topic][item.index]) continue;
      store.gsrs[k]={box:0, due:now, intro:now, introDay:day};
      qRoom--;
    }
  }
  saveStore();
}
function cardQuestion(w){
  const forms=w.pl && w.pl[0]!=="(" ? " ("+w.pl+")" : "";
  return {
    t:"card", kind:"card", word:w.d, wref:w,
    label:"Fiszka", q:w.d, a:w.p, pl:w.p,
    lex:w.d+forms+" = "+w.p,
    why:w.n||lesson.vocabFallback,
    e:(w.x||"")+(w.xp?" ("+w.xp+")":"")
  };
}
function grammarQuestion(item){
  return Object.assign({}, item.q, {kind:"q", topic:item.topic, index:item.index, label:withPl(item.title, item.pl)});
}
function composeQueue(){
  ensureIntro();
  const now=Date.now();
  const missQ=mistakeSet("q");
  const mistakes=[];
  for(const m of store.mistakes){
    if(m.kind!=="q") continue;
    const [topic, idx]=m.key.split(":");
    const t=topicById(topic);
    const q=t && t.questions[+idx];
    if(!q) continue;
    mistakes.push(grammarQuestion({topic, index:+idx, q, title:t.title, pl:t.pl||""}));
  }
  const grammar=[];
  for(const item of allGrammar()){
    const k=qKey(item.topic, item.index);
    if(missQ.has(k)) continue;
    const s=store.gsrs[k];
    if(s && s.due<=now && !(store.mastered[item.topic] && store.mastered[item.topic][item.index])) grammar.push(grammarQuestion(item));
  }
  const cards=[];
  for(const w of VOCAB){
    const s=store.srs[w.d];
    if(s && s.due<=now) cards.push(cardQuestion(w));
  }
  const cols=[mistakes.slice(), grammar.slice(), cards.slice()];
  const items=[];
  let guard=0;
  while(cols.some(c=>c.length) && guard++<5000){
    for(const col of cols) if(col.length) items.push(col.shift());
  }
  return {items, counts:{mistakes:mistakes.length, grammar:grammar.length, cards:cards.length, total:items.length}};
}
function refreshQueue(){ queueCache=composeQueue(); return queueCache; }

function gradeCard(word, ok){
  const s=store.srs[word] || {box:0, due:Date.now(), intro:Date.now(), introDay:dateKey()};
  if(ok){
    s.box=nextBox(s.box);
    s.due=Date.now()+BOX_MS[s.box];
    store.known[word]=true;
  }else{
    s.box=1;
    s.due=Date.now()+FAIL_MS;
    delete store.known[word];
  }
  store.srs[word]=s;
  saveStore();
}
function gradeQuestion(q, ok){
  if(q.topic==null || q.index==null) return;
  const k=qKey(q.topic, q.index);
  const s=store.gsrs[k] || {box:0, due:Date.now(), intro:Date.now(), introDay:dateKey()};
  store.mastered[q.topic]=store.mastered[q.topic]||{};
  if(ok){
    s.box=nextBox(s.box);
    s.due=Date.now()+BOX_MS[s.box];
    store.mastered[q.topic][q.index]=true;
    store.mistakes=store.mistakes.filter(m=>!(m.kind==="q" && m.key===k));
  }else{
    s.box=1;
    s.due=startOfDay()+DAY;
    delete store.mastered[q.topic][q.index];
    if(!store.mistakes.some(m=>m.kind==="q" && m.key===k)) store.mistakes.push({kind:"q", key:k});
  }
  store.gsrs[k]=s;
  saveStore();
}
function bumpStreak(){
  const day=dateKey();
  if(store.streak.day===day) return false;
  const y=dateKey(Date.now()-DAY);
  store.streak.n = store.streak.day===y ? store.streak.n+1 : 1;
  store.streak.day=day;
  saveStore();
  return true;
}
function articleInfo(d){
  const m=/^(der|die|das)\s+(.+)$/.exec(d);
  if(!m) return null;
  const label={der:"maskulinum", die:"femininum", das:"neutrum"};
  return {art:m[1], rest:m[2], cls:"art-"+m[1], label:label[m[1]]};
}
function speakGerman(text){
  try{
    if(!window.speechSynthesis || !text) return;
    const u=new SpeechSynthesisUtterance(text);
    u.lang="de-DE";
    u.rate=0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(e){}
}
function formsLine(w){
  if(!w.pl) return "";
  if(w.pl==="(Sg.)") return "tylko liczba pojedyncza";
  if(w.pl==="(Pl.)") return "tylko liczba mnoga";
  return w.d.match(/^(der|die|das) /) ? "Pl. "+w.pl : w.pl;
}

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const el=$(id);
  if(el) el.classList.add("active");
  document.body.dataset.screen=id==="vocabHome"?"fiszki":id==="over"?"over":id==="tests"?"test":id;
  const route = id==="home"?"dzis":id==="vocabHome"?"fiszki":id==="grammar"?"gramatyka":id==="tests"?"test":id==="progress"?"postep":"";
  document.body.dataset.route=route;
  document.querySelectorAll("[data-nav]").forEach(n=>n.classList.toggle("on", n.dataset.nav===route));
  if(id!=="game"){
    hideFeedback();
    hideTimeSheet();
    if(session && session.timer) stopTimer();
  }else if(session && session.def.timed && !session.expired && !session.timeSheet){
    startTimer();
  }
  window.scrollTo(0,0);
}
function go(hash, replace){
  const h=hash.startsWith("#")?hash:"#"+hash;
  const cur=location.hash||"#dzis";
  if(cur===h){ renderRoute(); return; }
  applying=true;
  if(replace) history.replaceState(null,"",h);
  else history.pushState(null,"",h);
  applying=false;
  renderRoute();
}
function goBack(){
  if(history.length>1) history.back();
  else go("dzis", true);
}
function renderRoute(){
  const h=location.hash||"#dzis";
  if(h.startsWith("#temat/")){
    const id=decodeURIComponent(h.slice(7));
    setupCurrent(id);
    paintReminder();
    showScreen("reminder");
    return;
  }
  if(h==="#quiz"){
    if(!session){ go("dzis", true); return; }
    showScreen("game");
    return;
  }
  if(h==="#wynik"){
    if(!session){ go("dzis", true); return; }
    showScreen("over");
    return;
  }
  if(h==="#fiszka"){
    if(!deck.length) buildFlashDeck();
    showScreen("flash");
    return;
  }
  if(h==="#fiszki"){ renderVocabHome(); showScreen("vocabHome"); return; }
  if(h==="#gramatyka"){ renderGrammar(); showScreen("grammar"); return; }
  if(h==="#test"){ renderTests(); showScreen("tests"); return; }
  if(h==="#postep"){ renderProgress(); showScreen("progress"); return; }
  renderHome();
  showScreen("home");
}

function continueTarget(){
  if(store.lastTopic){
    const t=topicById(store.lastTopic);
    if(t && !t.isTest) return t;
  }
  for(const t of TOPICS){
    if(t.isTest) continue;
    if(masteredCount(t.id)<t.questions.length) return t;
  }
  return TOPICS.find(t=>!t.isTest);
}
function renderHome(){
  const q=refreshQueue();
  const c=q.counts;
  $("greet").textContent=greeting()+"!";
  const days=store.streak.n||0;
  $("h-streak").innerHTML=`<span class="ms fill" aria-hidden="true">local_fire_department</span> ${days} ${plNum(days,"dzień","dni","dni")}`;
  $("h-count").innerHTML = c.total+" <span>"+plNum(c.total,"karta","karty","kart")+"</span>";
  const bits=[];
  bits.push(c.cards+" "+plNum(c.cards,"fiszka","fiszki","fiszek"));
  bits.push(c.grammar+" gramatyka");
  bits.push(c.mistakes===0 ? "0 błędów" : c.mistakes+" "+plNum(c.mistakes,"Twój błąd","Twoje błędy","Twoich błędów"));
  $("h-mix").textContent=bits.join(" · ");
  const est=Math.min(c.total, 14);
  const start=$("h-start");
  if(!c.total){
    start.disabled=true;
    start.querySelector("b").textContent="Na dziś gotowe";
    start.querySelector("small").textContent="Wróć jutro po nowe karty";
    $("h-all").hidden=true;
  }else{
    start.disabled=false;
    start.querySelector("b").textContent="Start 5 min";
    start.querySelector("small").textContent="ok. "+est+" "+plNum(est,"karta","karty","kart")+" · mix na dziś";
    $("h-all").hidden=false;
    $("h-all-label").textContent="Bez limitu · wszystkie "+c.total;
  }
  const t=continueTarget();
  const done=masteredCount(t.id), total=t.questions.length, left=Math.max(0,total-done);
  const pct=total?done/total:0;
  $("h-ring").style.background=`conic-gradient(var(--ink) ${Math.round(pct*100)}%, #ECEDF0 0)`;
  $("h-ring").querySelector("i").textContent=done+"/"+total;
  $("h-ring").setAttribute("aria-label", done+" z "+total+" pytań zaliczonych");
  $("h-cont-title").textContent=t.title;
  $("h-cont-sub").textContent=(t.pl?t.pl+" · ":"")+(left? left+" "+plNum(left,"pytanie zostało","pytania zostały","pytań zostało") : "wszystko zaliczone");
  $("h-continue").dataset.id=t.id;
  $("m-flash-n").textContent=VOCAB.length+" "+plNum(VOCAB.length,"słówko","słówka","słówek");
  const gTopics=TOPICS.filter(x=>!x.isTest);
  const gCount=gTopics.reduce((n,x)=>n+x.questions.length,0);
  $("m-gram-n").textContent=gTopics.length+" "+plNum(gTopics.length,"temat","tematy","tematów");
  const test=topicById("test");
  $("m-test-n").textContent=test.questions.length+" "+plNum(test.questions.length,"pytanie","pytania","pytań");
  $("h-topic-meta").textContent=gTopics.length+" tematów · "+gCount+" pytań";
  $("h-topics").innerHTML=gTopics.map(topicRow).join("");
  renderLastMistakes($("h-mistakes"), $("h-miss-panel"));
}
function topicRow(t){
  const done=masteredCount(t.id), total=t.questions.length;
  const pct=total?Math.round(done/total*100):0;
  const cls=done>=total && total ? "li done" : "li";
  return `<button type="button" class="${cls}" data-act="topic" data-id="${t.id}">
    <span class="li-name"><span class="de">${esc(t.title)}</span><span class="title-pl">${esc(t.pl||"")}</span></span>
    <span class="r"><span class="cnt">${done}/${total}</span><span class="mini" aria-hidden="true"><i style="width:${pct}%"></i></span></span>
  </button>`;
}
function renderLastMistakes(list, panel){
  const rows=store.lastMistakes||[];
  if(!rows.length){ panel.hidden=true; list.innerHTML=""; return; }
  panel.hidden=false;
  const n=rows.length;
  $("h-miss-title").textContent=n+" "+plNum(n,"błąd","błędy","błędów")+" z ostatniej sesji";
  const grammar=rows.some(r=>r.kind==="q");
  $("h-miss-sub").textContent=grammar?"wrócą w następnej sesji 5 min":"fiszki wrócą według planu powtórek";
  list.innerHTML=rows.slice(0,3).map(r=>`<div class="err"><span class="ms" aria-hidden="true">replay</span><div><b>${esc(r.prompt)}</b><small><em>→ ${esc(r.answer)}</em></small></div></div>`).join("");
}
function renderGrammar(){
  const gTopics=TOPICS.filter(t=>!t.isTest);
  $("g-list").innerHTML=gTopics.map(topicRow).join("");
  $("g-meta").textContent=gTopics.length+" tematów";
}
function renderTests(){
  const test=topicById("test");
  const best=id=>{ const b=store.best[id]; return b?`rekord ${b.correct}/${b.total}`:"jeszcze bez rekordu"; };
  $("test-cards").innerHTML=`
    <button type="button" class="card-link" data-act="topic" data-id="test" style="width:100%;cursor:pointer">
      <b>${esc(test.title)}</b><span class="title-pl">${esc(test.pl||"")}</span>
      <span>${test.questions.length} pytań · wynik każdej części · ${esc(best("test"))}</span>
    </button>
    <button type="button" class="card-link" data-act="topic" data-id="mix" style="width:100%;cursor:pointer">
      <b>Mieszany test całej lekcji</b><span class="title-pl">losowe pytania ze wszystkich tematów</span>
      <span>20 pytań · ${esc(best("mix"))}</span>
    </button>`;
}
function bestText(id){ const b=store.best[id]; return b?`${b.correct}/${b.total}`:"–"; }
function renderProgress(){
  const known=Object.keys(store.known).filter(k=>store.known[k]).length;
  const days=store.streak.n||0;
  $("p-streak").textContent=days+" "+plNum(days,"dzień","dni","dni");
  $("p-known").textContent=known+"/"+VOCAB.length;
  $("p-test").textContent=bestText("test");
  $("p-rows").innerHTML=TOPICS.map(t=>{
    const m=masteredCount(t.id);
    return `<div class="gain"><div><b>${esc(t.title)}</b><span class="title-pl">${esc(t.pl||"")}</span></div><div>${m}/${t.questions.length} · rekord ${esc(bestText(t.id))}</div></div>`;
  }).join("")+`<div class="gain"><div><b>Quiz słówek DE → PL</b></div><div>${esc(bestText("vq_de"))}</div></div>
     <div class="gain"><div><b>Quiz słówek PL → DE</b></div><div>${esc(bestText("vq_pl"))}</div></div>
     ${VOCAB.some(w=>w.g==="meine")?`<div class="gain"><div><b>Moje słówka</b></div><div>${esc(bestText("vq_meine"))}</div></div>`:""}`;
}

function selectedGroups(){ return store.groups && store.groups.length ? store.groups : VOCAB_GROUPS.map(g=>g.id); }
function selectedWords(){ const g=selectedGroups(); return VOCAB.filter(w=>g.includes(w.g)); }
function toggleGroup(id){
  let g=selectedGroups().slice();
  if(id==="all") g=VOCAB_GROUPS.map(x=>x.id);
  else if(g.length===VOCAB_GROUPS.length) g=[id];
  else if(g.includes(id)){ g=g.filter(x=>x!==id); if(!g.length) g=VOCAB_GROUPS.map(x=>x.id); }
  else g.push(id);
  store.groups=g; saveStore(); renderVocabHome();
}
function renderVocabHome(){
  const g=selectedGroups(); const all=g.length===VOCAB_GROUPS.length;
  $("chips").innerHTML=`<button type="button" class="chip ${all?"on":""}" data-act="group" data-id="all">Wszystkie</button>`+
    VOCAB_GROUPS.map(x=>{
      const n=VOCAB.filter(w=>w.g===x.id).length;
      const on=!all && g.includes(x.id);
      return `<button type="button" class="chip ${on?"on":""}" data-act="group" data-id="${x.id}" title="${esc(x.src)}">${esc(x.name)} (${n})<span class="chip-pl">${esc(x.pl||"")}</span></button>`;
    }).join("");
  const words=selectedWords();
  const known=words.filter(w=>store.known[w.d]).length;
  const onlyMeine=words.length && words.every(w=>w.g==="meine");
  $("v-count").textContent=`Wybrane: ${words.length} słówek · znam ${known} (${words.length?Math.round(known/words.length*100):0}%)`+(onlyMeine?" · quiz: oba kierunki i luki w zdaniach":"");
  $("v-bar").style.width=(words.length?known/words.length*100:0)+"%";
  $("word-list").innerHTML=words.map(w=>`<div><span>${store.known[w.d]?'<span class="k">✓</span> ':''}<b>${esc(w.d)}</b> <span class="small">${esc(w.pl||"")}</span></span><span>${esc(w.p)}</span></div>`).join("");
}

const PART_PL={"1 Wortschatz":"część 1 · słownictwo","2 Grammatik":"część 2 · gramatyka","3 Kommunikation":"część 3 · komunikacja"};
function partLabel(p){ return PART_PL[p] ? `Teil ${p} · ${PART_PL[p]}` : p; }
const MIX_REMINDER = lesson.mix.reminder;
function setupCurrent(id){
  if(id==="mix"){
    const pool=TOPICS.filter(t=>!t.isTest).flatMap(t=>t.questions.map((q,i)=>({...q, topic:t.id, index:i, label:withPl(t.title, t.pl)})));
    current={id:"mix", title:"Mieszany test całej lekcji", pl:"losowe pytania ze wszystkich tematów", src:lesson.mix.src, reminder:MIX_REMINDER, questions:shuffle(pool).slice(0,20), ordered:true, isTest:false};
    return;
  }
  const t=topicById(id);
  if(!t){ current=null; return; }
  if(!t.isTest) { store.lastTopic=t.id; saveStore(); }
  current={
    id:t.id, title:t.title, pl:t.pl||"", src:"Źródło: "+t.src, reminder:t.reminder,
    questions:t.questions.map((q,i)=>({...q, topic:t.id, index:i, label:q.part?partLabel(q.part):withPl(t.title, t.pl)})),
    ordered:!!t.isTest, isTest:!!t.isTest
  };
}
function paintReminder(){
  if(!current){ go("dzis", true); return; }
  $("r-title").textContent=current.title;
  $("r-pl").textContent=current.pl||"";
  $("r-pl").style.display=current.pl?"":"none";
  $("r-src").textContent=current.src;
  $("r-body").innerHTML=current.reminder;
}
function openTopic(id){
  setupCurrent(id);
  if(!current) return;
  paintReminder();
  go("temat/"+encodeURIComponent(current.id));
}
function beginCurrent(){
  if(!current) return;
  startGame({
    id:current.id,
    title:current.title,
    pl:current.pl,
    questions:current.questions.map(q=>({...q})),
    ordered:!!current.ordered,
    isTest:!!current.isTest,
    timed:false
  });
}

const TYPE_HINT={mc:"Wybierz poprawną odpowiedź.", order:"Ułóż zdanie po niemiecku. Kliknięte słowo wraca do puli.", type:"Wpisz brakujące słowo. Umlauty są pod polem."};
function startDaily(timed){
  const built=queueCache||refreshQueue();
  if(!built.counts.total) return;
  startGame({
    id:timed?"daily5":"dailyAll",
    title:timed?"Sesja 5 min":"Bez limitu",
    pl:timed?"mix na dziś":"wszystkie karty na dziś",
    questions:built.items.map(q=>({...q})),
    ordered:true,
    timed:!!timed,
    limitMs:5*60*1000,
    daily:true
  });
}
function startGame(def){
  const snap={};
  for(const t of TOPICS) snap[t.id]=masteredCount(t.id);
  if(session && session.timer) stopTimer();
  session={
    def, questions:def.ordered?[...def.questions]:shuffle(def.questions),
    qi:0, score:0, streak:0, correct:0, answered:false, partStats:{},
    done:[], started:Date.now(), elapsed:0,
    remaining:def.timed?def.limitMs:0, limit:def.timed?def.limitMs:0,
    timer:null, expired:false, endAfter:false, timeSheet:false, snap,
    tickAt:Date.now(), cardOk:0, cardN:0, qOk:0, qN:0, streakBumped:false
  };
  $("g-title").textContent=def.title||"";
  $("g-pl").textContent=def.pl||"";
  const timed=!!def.timed;
  $("head-timed").hidden=!timed;
  $("head-quiz").hidden=timed;
  if(timed){ renderTimer(); startTimer(); }
  showScreen("game");
  loadQuestion();
  go("quiz");
}
function startTimer(){
  stopTimer();
  if(!session || !session.def.timed || session.expired) return;
  session.tickAt=Date.now();
  session.timer=setInterval(onTick, 250);
}
function stopTimer(){
  if(session && session.timer){ clearInterval(session.timer); session.timer=null; }
}
function onTick(){
  if(!session || !session.def.timed || session.timeSheet || session.expired) return;
  const now=Date.now();
  const delta=now-session.tickAt;
  session.tickAt=now;
  session.elapsed+=delta;
  session.remaining-=delta;
  if(session.remaining<=0){
    session.remaining=0;
    session.expired=true;
    stopTimer();
    renderTimer();
    if(session.answered) showTimeSheet();
    return;
  }
  renderTimer();
}
function renderTimer(){
  if(!session) return;
  const rem=Math.max(0, session.remaining);
  const pct=session.limit?Math.max(0, Math.min(1, rem/session.limit)):0;
  $("time-label").textContent=formatClock(rem);
  $("time-bar").style.width=(pct*100)+"%";
  $("time-ring").style.background=`conic-gradient(var(--red) ${(pct*100).toFixed(2)}%, #ECEDF0 0)`;
}
function loadQuestion(){
  if(!session) return;
  session.answered=false;
  hideFeedback();
  hideTimeSheet();
  const q=session.questions[session.qi];
  const n=session.qi+1, total=session.questions.length;
  const good=session.correct;
  if(session.def.timed){
    $("qnum").textContent = q.t==="card" ? "karta "+n : "pytanie "+n;
    $("scoreline").textContent=good+" dobrze";
  }else{
    $("qnum").textContent="pytanie "+n+"/"+total;
    $("scoreline").textContent=good+" dobrze";
    $("q-progress").style.width=(n/total*100)+"%";
  }
  $("q-progress-label").textContent="Postęp "+n+" z "+total;
  const zone=$("answer-zone");
  zone.innerHTML="";
  $("card-slot").innerHTML="";
  $("card-slot").hidden=q.t!=="card";
  $("qarea").hidden=q.t==="card";
  if(q.t==="card") renderSessionCard(q);
  else{
    $("case-label").textContent=q.label|| (q.t==="order"?"Ułóż zdanie":q.t==="type"?"Wpisz":"Wybierz");
    $("sentence").innerHTML=q.t==="order" ? esc(q.q) : esc(q.q).replace(/___/g,'<span class="blank">&nbsp;</span>');
    $("hint").textContent=q.hint||TYPE_HINT[q.t]||"";
    if(q.t==="mc") renderMC(q, zone);
    else if(q.t==="order") renderOrder(q, zone);
    else renderType(q, zone);
  }
  const h=$("game");
  if(h) h.focus && document.activeElement && document.activeElement.blur();
}
function renderMC(q, zone){
  const box=document.createElement("div");
  box.className="ol";
  box.setAttribute("role","group");
  box.setAttribute("aria-label","Odpowiedzi");
  shuffle(q.o).forEach((opt,i)=>{
    const b=document.createElement("button");
    b.type="button"; b.className="opt";
    b.innerHTML=`<span class="l">${LETTERS[i]||i+1}</span><span>${esc(opt)}</span>`;
    b.onclick=()=>{
      if(session.answered) return;
      const ok=opt===q.a;
      box.querySelectorAll(".opt").forEach(x=>{
        x.disabled=true;
        const text=x.querySelector("span:last-child").textContent;
        if(text===q.a) x.classList.add("ok");
        else if(x===b) x.classList.add("bad");
      });
      finish(ok, q, q.a, opt);
    };
    box.appendChild(b);
  });
  zone.appendChild(box);
}
function renderOrder(q, zone){
  const ans=document.createElement("div"); ans.className="order-answer"; ans.setAttribute("aria-label","Twoje zdanie");
  const bank=document.createElement("div"); bank.className="order-bank"; bank.setAttribute("aria-label","Słowa do ułożenia");
  const check=document.createElement("button"); check.type="button"; check.className="check"; check.textContent="Sprawdź"; check.disabled=true;
  let tokens=q.w.map((w,i)=>({w,i}));
  let sh=shuffle(tokens); let guard=0;
  while(sh.map(x=>x.w).join(" ")===q.w.join(" ") && tokens.length>1 && guard++<8) sh=shuffle(tokens);
  const chosen=[];
  function draw(){
    ans.innerHTML=""; bank.innerHTML="";
    chosen.forEach((t,k)=>{
      const b=document.createElement("button"); b.type="button"; b.className="tile"; b.textContent=t.w;
      const sup=document.createElement("sup"); sup.textContent=String(k+1); b.appendChild(sup);
      b.onclick=()=>{ if(session.answered) return; chosen.splice(k,1); draw(); };
      ans.appendChild(b);
    });
    sh.filter(t=>!chosen.includes(t)).forEach(t=>{
      const b=document.createElement("button"); b.type="button"; b.className="tile"; b.textContent=t.w;
      b.onclick=()=>{ if(session.answered) return; chosen.push(t); draw(); };
      bank.appendChild(b);
    });
    if(!chosen.length) ans.innerHTML='<span class="small">Tu pojawi się Twoje zdanie…</span>';
    check.disabled=chosen.length!==q.w.length || session.answered;
  }
  check.onclick=()=>{
    if(session.answered) return;
    const mine=chosen.map(t=>t.w).join(" ");
    const valid=[q.w, ...(q.alts||[])].map(a=>a.join(" "));
    const ok=valid.includes(mine);
    ans.classList.add(ok?"ok":"bad");
    ans.querySelectorAll(".tile").forEach((btn,idx)=>{
      const word=chosen[idx].w;
      btn.classList.add(ok || word===q.w[idx] ? "ok" : "bad");
    });
    check.hidden=true;
    finish(ok, q, q.w.join(" "), mine);
  };
  draw();
  zone.appendChild(ans); zone.appendChild(bank); zone.appendChild(check);
}
function norm(s){ return s.trim().replace(/\s+/g," ").replace(/[.!?,]+$/,"").toLowerCase(); }
function renderType(q, zone){
  const row=document.createElement("div"); row.className="type-row";
  const inp=document.createElement("input"); inp.className="type-input"; inp.placeholder="Twoja odpowiedź…";
  inp.autocomplete="off"; inp.setAttribute("autocapitalize","off"); inp.spellcheck=false; inp.setAttribute("aria-label","Twoja odpowiedź");
  const btn=document.createElement("button"); btn.type="button"; btn.className="check"; btn.textContent="Sprawdź"; btn.style.width="100%"; btn.style.margin="0";
  row.appendChild(inp); row.appendChild(btn);
  const um=document.createElement("div"); um.className="umlauts";
  ["ä","ö","ü","ß","Ä","Ö","Ü"].forEach(c=>{
    const b=document.createElement("button"); b.type="button"; b.className="uml"; b.textContent=c;
    b.setAttribute("aria-label","Wstaw "+c);
    b.onclick=()=>{
      const p=inp.selectionStart??inp.value.length;
      inp.value=inp.value.slice(0,p)+c+inp.value.slice(inp.selectionEnd??p);
      inp.focus(); inp.setSelectionRange(p+1,p+1);
    };
    um.appendChild(b);
  });
  const go=()=>{
    if(session.answered || !inp.value.trim()) return;
    const v=norm(inp.value); const accepted=(Array.isArray(q.a)?q.a:[q.a]).map(norm);
    const ok=accepted.includes(v);
    inp.classList.add(ok?"ok":"bad"); inp.disabled=true; btn.hidden=true;
    um.querySelectorAll("button").forEach(b=>b.disabled=true);
    const shown=Array.isArray(q.a)?q.a.join(" / "):q.a;
    finish(ok, q, shown, inp.value);
  };
  btn.onclick=go;
  inp.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); go(); } });
  zone.appendChild(row); zone.appendChild(um);
  setTimeout(()=>{ try{ inp.focus(); }catch(e){} }, 40);
}
function renderSessionCard(q){
  const w=q.wref || VOCAB.find(x=>x.d===q.word);
  const slot=$("card-slot");
  slot.hidden=false;
  slot.innerHTML=cardMarkup(w, "session-card");
  const el=$("session-card");
  bindSwipe(el, {
    yes:()=>gradeSessionCard(q, true),
    no:()=>gradeSessionCard(q, false),
    tap:()=>el.classList.toggle("flipped")
  });
  el.querySelector("[data-audio]").onclick=e=>{ e.stopPropagation(); speakGerman(w.d); };
  el.addEventListener("keydown", e=>{
    if(e.key===" " || e.key==="Enter"){ e.preventDefault(); el.classList.toggle("flipped"); }
  });
  const knowMs=BOX_MS[nextBox((store.srs[w.d]||{box:0}).box)];
  el.parentElement.querySelector(".yes small").textContent="następna: "+formatAhead(knowMs);
  slot.querySelector("[data-act='know']").onclick=()=>gradeSessionCard(q, true);
  slot.querySelector("[data-act='dont']").onclick=()=>gradeSessionCard(q, false);
  const next=$("card-next");
  if(next) next.hidden=true;
}
function gradeSessionCard(q, ok){
  if(!session || session.answered) return;
  const el=$("session-card");
  if(el && !el.classList.contains("flipped")) el.classList.add("flipped");
  session.cardN++; if(ok) session.cardOk++;
  gradeCard(q.word, ok);
  const slot=$("card-slot");
  slot.querySelectorAll(".bt2 button").forEach(b=>b.disabled=true);
  finish(ok, q, q.a, ok?"znam":"nie wiem");
  if(!(session.expired || session.endAfter)){
    /* stay so the learner sees the back, Dalej is in the sheet — for cards we still show a short sheet */
  }
}
function cardMarkup(w, id){
  const art=articleInfo(w.d);
  const chip=art?`<span class="artchip ${art.cls}">${art.art} · ${art.label}</span>`:"";
  const word=art?`<span class="${art.cls}">${esc(art.art)}</span> ${esc(art.rest)}`:`${esc(w.d)}`;
  const known=store.known[w.d];
  return `<div class="swipe-card" id="${id}" tabindex="0" role="button" aria-label="Fiszka ${esc(w.d)}. Spacja odwraca, strzałka w lewo: nie wiem, strzałka w prawo: znam.">
    ${known?'<div class="known-badge">znam</div>':""}
    <button type="button" class="aud" data-audio aria-label="Odtwórz wymowę"><span class="ms" aria-hidden="true">volume_up</span></button>
    <div class="front">
      ${chip}
      <div class="word">${word}</div>
      <div class="forms">${esc(formsLine(w))}</div>
      <div class="tap-hint">Dotknij, aby odwrócić</div>
    </div>
    <div class="back">
      ${chip}
      <div class="plbig">${esc(w.p)}</div>
      <div class="note">${esc(w.n||"")}</div>
      <div class="ex">${esc(w.x||"")}<i>${esc(w.xp||"")}</i></div>
    </div>
  </div>
  <div class="swipe-legend" aria-hidden="true"><span class="no"><span class="ms">arrow_back</span> nie wiem</span><span class="mid"><span class="ms">swipe</span> przesuń kartę</span><span class="yes">znam <span class="ms">arrow_forward</span></span></div>
  <div class="bt2">
    <button type="button" class="no" data-act="dont">Nie wiem<small>wróci za 10 min</small></button>
    <button type="button" class="yes" data-act="know">Znam<small>następna: za 4 dni</small></button>
  </div>
  <button type="button" class="cta" id="card-next" hidden style="margin:12px 16px 0;width:calc(100% - 32px)">Zobacz wynik</button>`;
}
function bindSwipe(el, handlers){
  if(!el) return;
  let sx=0, sy=0, dx=0, active=false, pid=null;
  el.addEventListener("pointerdown", e=>{
    if(e.target.closest("button")) return;
    active=true; pid=e.pointerId; sx=e.clientX; sy=e.clientY; dx=0;
    try{ el.setPointerCapture(pid); }catch(err){}
  });
  el.addEventListener("pointermove", e=>{
    if(!active || e.pointerId!==pid) return;
    dx=e.clientX-sx;
    el.style.transform=`translateX(${dx}px) rotate(${dx/30}deg)`;
    el.classList.toggle("hint-yes", dx>48);
    el.classList.toggle("hint-no", dx<-48);
  });
  const end=e=>{
    if(!active) return;
    if(e && e.pointerId!=null && pid!=null && e.pointerId!==pid) return;
    active=false;
    const ady=Math.abs((e&&e.clientY!=null?e.clientY:sy)-sy);
    const adx=dx;
    el.style.transform="";
    el.classList.remove("hint-yes","hint-no");
    if(adx>88 && Math.abs(adx)>ady) handlers.yes();
    else if(adx<-88 && Math.abs(adx)>ady) handlers.no();
    else if(Math.hypot(adx, ady)<14) handlers.tap();
    dx=0; pid=null;
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

function bookSuffix(why, e){
  if(!e || /KB|AB/.test(why)) return why;
  const refs=[...String(e).matchAll(/(?:KB|AB)\s*\d+(?:\s*(?:\([^)]{0,24}\)|,\s*[A-Z]\d+[a-z]?))?/g)].map(m=>m[0].replace(/\s+/g," ").trim());
  const uniq=[...new Set(refs)];
  return uniq.length ? why+" ("+uniq.join(", ")+")" : why;
}
function mistakeHint(q, user){
  if(!user) return "";
  if(q.t==="order" && q.w){
    const mine=user.trim().split(/\s+/), corr=q.w;
    for(let i=0;i<Math.max(mine.length, corr.length);i++){
      if(mine[i]!==corr[i]){
        const got=mine[i]?"„"+mine[i]+"”":"puste miejsce";
        const need=corr[i]?"„"+corr[i]+"”":"koniec zdania";
        return "Na miejscu "+(i+1)+" jest "+got+", a powinno być "+need+".";
      }
    }
  }
  if(q.t==="type" && Array.isArray(q.a)){
    const u=user.trim(), a=q.a[0];
    const fold=s=>s.toLowerCase().replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss");
    if(fold(u)===fold(a) && u.toLowerCase()!==a.toLowerCase()) return "Brakuje umlautu (ä, ö, ü) albo ß.";
    if(u.toLowerCase()===a.toLowerCase() && u!==a) return "Zwróć uwagę na wielką lub małą literę.";
    const nu=norm(u), na=norm(a);
    if(nu && na && (na.startsWith(nu)||nu.startsWith(na))) return "Końcówka nie pasuje do osoby w zdaniu.";
  }
  return "";
}
function explainHTML(q, ok, user){
  if(q.t==="card"){
    return `<div class="blk"><div class="k">Po polsku</div><p>${esc(q.pl||"")}</p></div>`+
      (q.why?`<div class="blk"><div class="k">Notatka</div><p>${esc(q.why)}</p></div>`:"");
  }
  if(!(q.pl && q.lex && q.why)) return `<div class="blk"><p>${esc(q.e||"")}</p></div>`;
  let html=`<div class="blk"><div class="k">Po polsku</div><p>${esc(q.pl)}</p></div>`+
    `<div class="blk"><div class="k">Słówka</div><p>${esc(q.lex)}</p></div>`+
    `<div class="blk"><div class="k">Dlaczego</div><p>${esc(bookSuffix(q.why, q.e||""))}</p></div>`;
  if(!ok && (q.t==="order"||q.t==="type")){
    const h=mistakeHint(q, user);
    if(h) html+=`<div class="blk"><div class="k">Wskazówka</div><p>${esc(h)}</p></div>`;
  }
  return html;
}
function answerText(q){
  if(q.t==="order") return (q.w||[]).join(" ");
  if(Array.isArray(q.a)) return q.a.join(" / ");
  return q.a||"";
}
function promptText(q){
  if(q.t==="card") return q.word||q.q;
  return q.q;
}
function finish(ok, q, solution, userAnswer){
  session.answered=true;
  const part=q.part||"all";
  session.partStats[part]=session.partStats[part]||{c:0,t:0};
  session.partStats[part].t++;
  if(ok){ session.score+=10; session.streak++; session.correct++; session.partStats[part].c++; if(session.streak>=3) session.score+=5; }
  else session.streak=0;
  if(q.t==="card"){ /* counted in gradeSessionCard */ }
  else { session.qN++; if(ok) session.qOk++; }
  if(q.kind==="q" || (q.topic!=null && q.t!=="card")) gradeQuestion(q, ok);
  session.done.push({ok, q, solution:solution||answerText(q), user:userAnswer||"", prompt:promptText(q)});
  const scoreEl=$("score"); if(scoreEl) scoreEl.textContent=String(session.score);
  const streakEl=$("streak"); if(streakEl) streakEl.textContent=String(session.streak);
  if(q.t==="card"){
    const n=$("card-next");
    const last=session.qi>=session.questions.length-1;
    if(n){
      n.hidden=false;
      n.textContent=(session.endAfter||last)?"Zobacz wynik":"Dalej";
      n.onclick=()=>nextStep();
    }
    $("scoreline").textContent=session.correct+" dobrze";
    if(session.expired) showTimeSheet();
    return;
  }
  const fb=$("feedback");
  fb.hidden=false;
  fb.querySelector(".ic").className="ic "+(ok?"ok":"bad");
  fb.querySelector(".ic .ms").textContent=ok?"check":"close";
  $("feedback-text").textContent=ok ? (session.streak>=3 ? "Dobrze! Seria "+session.streak : "Dobrze!") : "Nie tym razem";
  $("feedback-sub").textContent=q.label||"";
  const sol=$("solution");
  if(ok && q.t==="mc") sol.innerHTML="";
  else sol.innerHTML=`<div class="blk"><div class="k">${ok?"Odpowiedź":"Poprawnie"}</div><p class="solution">${esc(solution||answerText(q))}</p></div>`;
  $("explanation").innerHTML=explainHTML(q, ok, userAnswer);
  const last=session.qi>=session.questions.length-1;
  $("next-btn").textContent=(session.endAfter || last) ? "Zobacz wynik" : "Dalej";
  $("scoreline").textContent=session.correct+" dobrze";
  try{ $("next-btn").focus({preventScroll:true}); }catch(e){}
  if(session.expired) showTimeSheet();
}
function hideFeedback(){ const fb=$("feedback"); if(fb) fb.hidden=true; }
function nextStep(){
  if(!session) return;
  hideFeedback();
  const last=session.qi>=session.questions.length-1;
  if(session.endAfter || last){ endGame(); return; }
  session.qi++;
  loadQuestion();
}
function showTimeSheet(){
  if(!session || session.timeSheet) return;
  session.timeSheet=true;
  stopTimer();
  const n=session.done.length, k=session.correct;
  $("time-copy").innerHTML="Świetna robota: "+n+" "+plNum(n,"pytanie","pytania","pytań")+", "+k+" dobrze.<br>Nie przerywamy w połowie – dokończ spokojnie.";
  $("timesheet").hidden=false;
  const b=$("timesheet").querySelector(".btn.p");
  if(b) b.focus();
}
function hideTimeSheet(){
  $("timesheet").hidden=true;
  if(session) session.timeSheet=false;
}
function finishThisQuestion(){
  if(!session) return;
  session.endAfter=true;
  hideTimeSheet();
  const q=session.questions[session.qi];
  if(session.answered){
    $("next-btn").textContent="Zobacz wynik";
    if(q && q.t==="card"){
      const n=$("card-next");
      if(n){ n.hidden=false; n.textContent="Zobacz wynik"; n.onclick=()=>endGame(); }
    }
  }
}
function addFive(){
  if(!session) return;
  session.remaining=5*60*1000;
  session.limit=5*60*1000;
  session.expired=false;
  session.endAfter=false;
  hideTimeSheet();
  renderTimer();
  startTimer();
  if(session.answered) $("next-btn").textContent = session.qi>=session.questions.length-1 ? "Zobacz wynik" : "Dalej";
}
function endNow(){ hideTimeSheet(); endGame(); }
function endGame(){
  if(!session) return;
  stopTimer();
  hideFeedback();
  hideTimeSheet();
  const done=session.done;
  if(!done.length){ go("dzis"); return; }
  const correct=done.filter(d=>d.ok).length;
  const total=done.length;
  const pct=Math.round(correct/total*100);
  const wrong=done.filter(d=>!d.ok);
  session.streakBumped=bumpStreak();
  store.lastMistakes=wrong.map(d=>({kind:d.q.t==="card"?"card":"q", prompt:d.prompt, answer:d.solution}));
  const prev=store.best[session.def.id];
  const isNew=!prev || correct>prev.correct || (correct===prev.correct && session.score>(prev.score||0));
  if(isNew) store.best[session.def.id]={correct, total, score:session.score};
  saveStore();
  queueCache=null;
  const elapsed=session.elapsed + (session.def.timed && !session.expired ? 0 : 0);
  $("sum-time").textContent=formatClock(session.elapsed);
  $("sum-streak").innerHTML = session.streakBumped
    ? `<span class="ms fill" aria-hidden="true">local_fire_department</span> ${store.streak.n} ${plNum(store.streak.n,"dzień","dni","dni")} · seria +1`
    : `<span class="ms fill" aria-hidden="true">local_fire_department</span> seria: ${store.streak.n} ${plNum(store.streak.n,"dzień","dni","dni")}`;
  $("final-score").innerHTML=correct+`<span>/${total}</span>`;
  $("sum-pct").textContent=pct+"%";
  const cards=done.filter(d=>d.q.t==="card").length;
  const grams=total-cards;
  $("sum-cards").textContent=String(cards);
  $("sum-gram").textContent=String(grams);
  $("stat-cards").hidden=!cards;
  $("stat-gram").hidden=!grams;
  let msg = pct>=90 ? "Mocna sesja. Tak trzymaj." : pct>=70 ? "Dobra robota. Jeszcze jedna runda i będzie płynnie." : pct>=50 ? "Jest postęp. Błędy wrócą w następnej sesji." : "Spokojnie. Przeczytaj przypomnienie i wróć do tych zdań.";
  if(isNew && prev) msg+=" Nowy rekord.";
  $("final-message").textContent=msg;
  let bd="";
  if(session.def.isTest){
    const face=p=>p>=0.8?"😊":p>=0.5?"😐":"☹️";
    bd=Object.keys(session.partStats).map(k=>{
      const s=session.partStats[k];
      return `<div><span>${esc(partLabel(k))}</span><span>${s.c}/${s.t} ${face(s.t?s.c/s.t:0)}</span></div>`;
    }).join("");
  }
  $("breakdown").innerHTML=bd;
  const missTitle=$("miss-title");
  if(!wrong.length){
    $("miss-wrap").hidden=true;
    $("repeat-btn").hidden=true;
  }else{
    $("miss-wrap").hidden=false;
    missTitle.textContent=wrong.length+" "+plNum(wrong.length,"błąd","błędy","błędów")+" do powtórki";
    $("mistake-list").innerHTML=wrong.map(d=>`<div class="err"><span class="ms" aria-hidden="true">replay</span><div><b>${esc(d.prompt)}</b><small><em>→ ${esc(d.solution)}</em></small></div></div>`).join("");
    $("repeat-btn").hidden=false;
    $("repeat-btn").innerHTML=`<span class="ms" aria-hidden="true">replay</span> Powtórz ${wrong.length} ${plNum(wrong.length,"błąd","błędy","błędów")}`;
  }
  const gains=[];
  for(const t of TOPICS){
    if(t.isTest) continue;
    const now=masteredCount(t.id);
    const was=session.snap[t.id]||0;
    if(now>was) gains.push({title:t.title, pl:t.pl||"", delta:now-was, now, total:t.questions.length});
  }
  if(!gains.length){ $("gains-wrap").hidden=true; }
  else{
    $("gains-wrap").hidden=false;
    $("gains").innerHTML=gains.map(g=>`<div class="gain"><div><b>${esc(g.title)}</b><span class="title-pl">${esc(g.pl)}</span></div><span class="up">+${g.delta} · ${g.now}/${g.total}</span></div>`).join("");
  }
  $("again-btn").onclick=()=>replayGame();
  showScreen("over");
  go("wynik", true);
}
function replayGame(){
  const def=session && session.def;
  if(!def){ go("dzis"); return; }
  if(def.id==="mix"){ openTopic("mix"); return; }
  if(def.daily){ startDaily(!!def.timed); return; }
  if(def.vocabMode==="meine"){
    startGame({id:def.id, title:def.title, pl:def.pl, questions:def.questions.map(q=>({...q})), ordered:false, vocabMode:"meine"});
    return;
  }
  if(def.vocabMode){ startVocabQuiz(def.vocabMode); return; }
  startGame({
    id:def.id, title:def.title, pl:def.pl,
    questions:def.questions.map(q=>({...q})),
    ordered:!!def.ordered, isTest:!!def.isTest, timed:!!def.timed, limitMs:def.limitMs, daily:!!def.daily, vocabMode:def.vocabMode
  });
}
function repeatMistakes(){
  if(!session) return;
  const wrong=session.done.filter(d=>!d.ok).map(d=>d.q);
  if(!wrong.length) return;
  startGame({
    id:(session.def.id||"rep")+"-rep",
    title:"Powtórka błędów",
    pl:"tylko to, co poszło źle",
    questions:wrong.map(q=>({...q})),
    ordered:true, timed:false, isTest:!!session.def.isTest
  });
}

function startFlash(){
  if($("only-unknown")) $("only-unknown").checked=false;
  buildFlashDeck();
  go("fiszka");
}
function buildFlashDeck(){
  const words=selectedWords();
  const only=$("only-unknown") && $("only-unknown").checked;
  deck=shuffle(only?words.filter(w=>!store.known[w.d]):words.slice());
  fi=0;
  const g=selectedGroups();
  const picked=VOCAB_GROUPS.filter(x=>g.includes(x.id));
  $("f-group").textContent=g.length===VOCAB_GROUPS.length?"Wszystkie grupy":picked.map(x=>x.name).join(" · ");
  drawCard();
}
function drawCard(){
  const el=$("flashcard");
  if(!el) return;
  el.classList.remove("flipped","hint-yes","hint-no");
  el.style.transform="";
  if(!deck.length){
    $("f-front").innerHTML=`<div class="word">Wszystko powtórzone</div><div class="forms">Odznacz filtr albo wybierz inne grupy.</div>`;
    $("f-back").innerHTML="";
    $("f-counter").textContent="";
    return;
  }
  const w=deck[fi];
  const vg=VOCAB_GROUPS.find(x=>x.id===w.g);
  $("f-counter").textContent=`Karta ${fi+1} z ${deck.length}`+(vg?" · "+vg.name:"");
  const art=articleInfo(w.d);
  const chip=art?`<span class="artchip ${art.cls}">${art.art} · ${art.label}</span>`:"";
  const word=art?`<span class="${art.cls}">${esc(art.art)}</span> ${esc(art.rest)}`:esc(w.d);
  $("f-badge").hidden=!store.known[w.d];
  $("f-front").innerHTML=`${chip}<div class="word" id="f-word">${word}</div><div class="forms" id="f-forms">${esc(formsLine(w))}</div><div class="tap-hint">Dotknij, spacja albo Enter — odwróć</div>`;
  $("f-back").innerHTML=`${chip}<div class="plbig" id="f-pl">${esc(w.p)}</div><div class="note" id="f-note">${esc(w.n||"")}</div><div class="ex" id="f-ex">${esc(w.x||"")}<i>${esc(w.xp||"")}</i></div>`;
  const knowMs=BOX_MS[nextBox((store.srs[w.d]||{box:0}).box)];
  $("know-sub").textContent="następna: "+formatAhead(knowMs);
  el.setAttribute("aria-label","Fiszka "+w.d+". Spacja odwraca.");
}
function flipCard(){ const el=$("flashcard"); if(el && deck.length) el.classList.toggle("flipped"); }
function flashMove(d){ if(!deck.length) return; fi=(fi+d+deck.length)%deck.length; drawCard(); }
function markCard(known){
  if(!deck.length) return;
  const w=deck[fi];
  gradeCard(w.d, known);
  if(known){
    deck.splice(fi,1);
    if(fi>=deck.length) fi=0;
  }else{
    const [card]=deck.splice(fi,1);
    const later=Math.min(3, deck.length);
    deck.splice(Math.min(deck.length, fi+later), 0, card);
    if(fi>=deck.length) fi=0;
  }
  drawCard();
}

function openHelp(){
  let html="";
  const inTopic=current && (document.body.dataset.screen==="game" || document.body.dataset.screen==="reminder" || document.body.dataset.screen==="over");
  if(inTopic && current.reminder){
    html+=`<h3>${esc(current.title)}</h3><div class="reminder-box prose">${current.reminder}</div>`;
  }
  for (const section of lesson.help) {
    html+=`<h3>${esc(section.title)}</h3><div class="reminder-box prose">${section.html}</div>`;
  }
  html+=`<h3>Wszystkie przypomnienia</h3>`+TOPICS.map(t=>`<details><summary>${esc(withPl(t.title, t.pl))} <span class="small">(${esc(t.src)})</span></summary><div class="prose">${t.reminder}</div></details>`).join("");
  $("help-body").innerHTML=html;
  $("help").hidden=false;
  const c=$("help").querySelector(".close-btn");
  if(c) c.focus();
}
function closeHelp(){ $("help").hidden=true; }

function onKey(e){
  if(e.key==="Escape"){
    if(!$("help").hidden){ closeHelp(); return; }
    if(session && session.timeSheet){ finishThisQuestion(); return; }
  }
  const typing=e.target && (e.target.matches("input, textarea") || e.target.isContentEditable);
  if(!typing && e.key==="Enter" && document.body.dataset.screen==="home" && !(e.target && e.target.closest && e.target.closest("button, a"))){
    const q=queueCache;
    if(q && q.counts.total){ e.preventDefault(); startDaily(true); }
    return;
  }
  if(typing) return;
  const flashOn=document.body.dataset.screen==="flash";
  const sessionCard=session && document.body.dataset.screen==="game" && session.questions[session.qi] && session.questions[session.qi].t==="card" && !session.answered;
  if(flashOn || sessionCard){
    if(e.key===" " || e.key==="Enter"){
      e.preventDefault();
      if(flashOn) flipCard();
      else { const el=$("session-card"); if(el) el.classList.toggle("flipped"); }
    }else if(e.key==="ArrowLeft"){
      e.preventDefault();
      if(flashOn) markCard(false); else gradeSessionCard(session.questions[session.qi], false);
    }else if(e.key==="ArrowRight"){
      e.preventDefault();
      if(flashOn) markCard(true); else gradeSessionCard(session.questions[session.qi], true);
    }
  }
}
function onClick(e){
  const t=e.target.closest("[data-act]");
  if(!t) return;
  const act=t.dataset.act;
  if(act==="begin") beginCurrent();
  else if(act==="start-5") startDaily(true);
  else if(act==="start-all") startDaily(false);
  else if(act==="continue" || act==="topic") openTopic(t.dataset.id);
  else if(act==="nav") go(t.dataset.go);
  else if(act==="back") goBack();
  else if(act==="info") openHelp();
  else if(act==="close-help") closeHelp();
  else if(act==="group") toggleGroup(t.dataset.id);
  else if(act==="flash") startFlash();
  else if(act==="quiz-de") startVocabQuiz("de");
  else if(act==="quiz-pl") startVocabQuiz("pl");
  else if(act==="know" && document.body.dataset.screen==="flash") markCard(true);
  else if(act==="dont" && document.body.dataset.screen==="flash") markCard(false);
  else if(act==="flip") flipCard();
  else if(act==="audio"){ const w=deck[fi]; if(w) speakGerman(w.d); }
  else if(act==="flash-prev") flashMove(-1);
  else if(act==="flash-next") flashMove(1);
  else if(act==="finish-q") finishThisQuestion();
  else if(act==="add-five") addFive();
  else if(act==="end-now") endNow();
  else if(act==="repeat") repeatMistakes();
  else if(act==="again") replayGame();
  else if(act==="home") go("dzis");
  else if(act==="reset") resetProgress();
  else if(act==="next") nextStep();
}

function mentionTok(s, tok){
  return new RegExp("(?<![\\p{L}])"+tok.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?![\\p{L}])","iu").test(s);
}
const VOCAB_FORM_PL = lesson.vocabForms;
function extraVocabGloss(text, lex){
  const bits=[];
  let acc=lex;
  for (const [tok,pl] of VOCAB_FORM_PL) {
    if (mentionTok(text, tok) && !mentionTok(acc, tok)) { const bit=tok+" = „"+pl+"”"; bits.push(bit); acc+="; "+bit; }
  }
  return bits.join("; ");
}
function meineMc(w, mode){
  const pool = VOCAB.filter(x=>x.g==="meine");
  const key = mode==="de" ? "p" : "d";
  const opts=[w[key]];
  for(const o of shuffle(pool)){
    if(opts.length>=4) break;
    if(o!==w && !opts.includes(o[key])) opts.push(o[key]);
  }
  return { t:"mc", label: mode==="de"?"🇩🇪 → 🇵🇱 Co to znaczy?":"🇵🇱 → 🇩🇪 Jak to powiedzieć po niemiecku?",
    q: mode==="de" ? w.d : w.p,
    hint: mode==="de" ? "Wybierz polskie tłumaczenie." : "Wybierz niemieckie słowo.",
    o: opts, a: w[key], pl: w.xp, lex: w.lex, why: w.why, e: REF };
}
function buildMeineQuiz(){
  const words = VOCAB.filter(w=>w.g==="meine");
  const qs=[];
  for(const w of words){ qs.push(meineMc(w,"de")); qs.push(meineMc(w,"pl")); }
  for(const g of MEINE_GAPS){
    qs.push({ t:"mc", label:"Uzupełnij zdanie", q:g.q, hint:"Wybierz słowo z grupy Moje słówka.", o:g.o.slice(), a:g.a, pl:g.pl, lex:g.lex, why:g.why, e:REF });
  }
  return qs;
}
function startVocabQuiz(mode){
  current=null;
  const words=selectedWords();
  if(words.length && words.every(w=>w.g==="meine")){
    startGame({id:"vq_meine", title:"Moje słówka", pl:"oba kierunki i luki", questions:buildMeineQuiz(), vocabMode:"meine", ordered:false});
    return;
  }
  const pool = words.length>=4 ? words : VOCAB;
  const picked = shuffle(pool).slice(0, Math.min(15,pool.length));
  const qs = picked.map(w=>{
    const key = mode==="de" ? "p" : "d";
    const others = shuffle(VOCAB.filter(x=>x!==w && x[key]!==w[key] && (x.g===w.g || Math.random()<0.4)));
    const opts=[w[key]];
    for(const o of others){ if(opts.length>=4) break; if(!opts.includes(o[key])) opts.push(o[key]); }
    for(const o of shuffle(VOCAB)){ if(opts.length>=4) break; if(!opts.includes(o[key])) opts.push(o[key]); }
    const forms = w.pl && w.pl[0]!=="(" ? " ("+w.pl+")" : "";
    const baseLex = w.d+forms+" = "+w.p;
    const extra = extraVocabGloss((w.x||"")+" "+w.d, baseLex);
    const mine = w.g==="meine" && w.lex && w.why;
    return { t:"mc", label: mode==="de"?"🇩🇪 → 🇵🇱 Co to znaczy?":"🇵🇱 → 🇩🇪 Jak to powiedzieć po niemiecku?",
      q: mode==="de" ? w.d : w.p, hint: mode==="de" ? (w.pl&&w.pl[0]!=="("?w.pl:"") || "Wybierz polskie tłumaczenie." : "Wybierz niemieckie słowo (z rodzajnikiem).",
      o: opts, a: w[key],
      pl: mine ? w.xp : (w.xp ? w.p+". Przykład: "+w.xp : w.p),
      lex: mine ? w.lex : (extra ? baseLex+"; "+extra : baseLex),
      why: mine ? w.why : (w.n || lesson.vocabFallback),
      e: mine ? REF : `${w.d}${forms} = ${w.p}. ${w.n} Przykład: ${w.x} (${w.xp})` };
  });
  startGame({id:"vq_"+mode, title: mode==="de"?"Quiz: niemiecki → polski":"Quiz: polski → niemiecki", pl:"słówka z wybranych grup", questions:qs, vocabMode:mode, ordered:true});
}

function boot(){
  store=loadStore();
  if(store._needsSave){ delete store._needsSave; saveStore(); }
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKey);
  $("only-unknown").addEventListener("change", buildFlashDeck);
  $("help").addEventListener("click", e=>{ if(e.target.id==="help") closeHelp(); });
  const card=$("flashcard");
  bindSwipe(card, {yes:()=>markCard(true), no:()=>markCard(false), tap:flipCard});
  window.addEventListener("hashchange", ()=>{ if(!applying) renderRoute(); });
  if(!location.hash) history.replaceState(null,"","#dzis");
  renderRoute();
  window.__app={
    get store(){ return store; },
    get session(){ return session; },
    expire(){
      if(!session) return;
      session.remaining=0; session.expired=true; stopTimer(); renderTimer();
      if(session.answered) showTimeSheet();
    },
    startSample(type, timed){
      let found=null, topic=null, index=0;
      for(const t of TOPICS){
        t.questions.forEach((q,i)=>{ if(!found && q.t===type){ found=q; topic=t; index=i; } });
      }
      startGame({
        id:"sample", title:topic.title, pl:topic.pl||"",
        questions:[Object.assign({}, found, {topic:topic.id, index, label:topic.title})],
        ordered:true, timed:!!timed, limitMs:5*60*1000, isTest:false
      });
    },
    showWord(de){
      const w=VOCAB.find(x=>x.d===de);
      deck=[w]; fi=0;
      if(location.hash!=="#fiszka") go("fiszka");
      else showScreen("flash");
      drawCard();
    }
  };
}
boot();

}
