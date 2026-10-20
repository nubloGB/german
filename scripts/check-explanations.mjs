import fs from "node:fs";
import { execSync } from "node:child_process";

const html = fs.readFileSync(new URL("../lektion4/index.html", import.meta.url), "utf8");
const start = html.indexOf("const KONJ_TABLE");
const end = html.indexOf("const STORE_KEY");
eval(html.slice(start, end) + "\nglobalThis.TOPICS=TOPICS; globalThis.VOCAB=VOCAB; globalThis.VOCAB_GROUPS=VOCAB_GROUPS;");
const fnStart = html.indexOf("function mentionTok");
const fnEnd = html.indexOf("function startVocabQuiz");
eval(html.slice(fnStart, fnEnd) + "\nglobalThis.extraVocabGloss=extraVocabGloss;");

const KII_ALT = "würdest|würden|würdet|würde|wärst|wären|wäret|wärt|wäre|hättest|hätten|hättet|hätte|könntest|könnten|könntet|könnte|müsstest|müssten|müsstet|müsste|solltest|sollten|solltet|sollte|dürftest|dürften|dürftet|dürfte|möchtest|möchten|möchtet|möchte|wüsstest|wüssten|wüsstet|wüsste";
const KII_RE = new RegExp("\\b((?:vor|ab|an|auf|aus|ein|mit|los|hin|her)?(?:" + KII_ALT + "))\\b","giu");
const CONN_RE = /\b(obwohl|deshalb|deswegen|trotzdem|weswegen|weshalb|darum|daher|wegen|wenn|weil|dass|denn|aber|oder|ob)\b/giu;

function mentions(lex, token){
  return new RegExp("(?<![\\p{L}])" + token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "(?![\\p{L}])","iu").test(lex);
}
function uniqForms(text, re){
  const out=[], seen=new Set();
  for (const m of String(text).matchAll(re)) {
    const k=m[1].toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k); out.push(m[1]);
  }
  return out;
}
function sourceOf(r){
  const answers = Array.isArray(r.a) ? r.a.map(String) : [String(r.a??"")];
  const primary = answers[0];
  const blanks = r.q.split("___");
  let filled;
  if (blanks.length===1) filled=r.q;
  else if (blanks.length===2) filled=blanks[0]+primary+blanks[1];
  else {
    const parts = primary.split(/\s*[–—]\s*/);
    if (parts.length===blanks.length-1) {
      filled=blanks[0];
      parts.forEach((p,i)=>{ filled += p + blanks[i+1]; });
    } else filled = blanks.join(primary);
  }
  filled = filled.replace(/\s*\((?:haben|sein|werden|können|müssen|sollen|dürfen|mögen|wissen|wolniej|przeklinać\/kląć, KB 53)\)/gi," ");
  let extra="";
  if (primary.split(/\s+/).length>=4 && !filled.includes(primary)) extra += " "+primary;
  for (const a of answers.slice(1)) if (!filled.includes(a)) extra += " "+a;
  return (filled+" "+extra).replace(/\s+/g," ").trim();
}

const fails=[];
let n=0, zurich=null;
for (const t of TOPICS) {
  if (!t.pl) fails.push("topic without pl: "+t.id);
  for (const q of t.questions) {
    n++;
    const text = sourceOf(q);
    const need = [...uniqForms(text, KII_RE), ...uniqForms(text, CONN_RE)];
    const miss = need.filter(tok => !mentions(q.lex||"", tok));
    if (miss.length) fails.push("#"+n+" "+t.id+" missing "+miss.join(",")+" :: "+(q.lex||"").slice(0,140));
    if (/Zürich keine Arbeit/.test(text)) zurich=q;
  }
}
if (n!==179) fails.push("question count "+n);
if (!zurich) fails.push("zürich question missing");
else {
  if (!mentions(zurich.lex, "hätte") || !mentions(zurich.lex, "würden") || !mentions(zurich.lex, "wenn")) fails.push("zürich lex "+zurich.lex);
  if (!/hätte/.test(zurich.why) || !/würden/.test(zurich.why) || !/zurückgehen/.test(zurich.why)) fails.push("zürich why "+zurich.why);
}
for (const g of VOCAB_GROUPS) if (!g.pl) fails.push("vocab group without pl "+g.id);
for (const w of VOCAB) {
  const forms = w.pl && w.pl[0]!=="(" ? " ("+w.pl+")" : "";
  const base = w.d+forms+" = "+w.p;
  const extra = extraVocabGloss((w.x||"")+" "+w.d, base);
  const lex = extra ? base+"; "+extra : base;
  const text = (w.x||"")+" "+w.d;
  const miss = [...uniqForms(text, KII_RE), ...uniqForms(text, CONN_RE)].filter(tok => !mentions(lex, tok));
  if (miss.length) fails.push("vocab "+w.d+" missing "+miss.join(","));
}
if (!html.includes('id="r-pl"') || !html.includes("title-pl") || !html.includes("chip-pl")) fails.push("polish UI hooks missing");

let changed=null;
try {
  const old = execSync("git show main:lektion4/index.html", {encoding:"utf8"});
  const os = old.indexOf("const EXPLAIN = ");
  const oe = old.indexOf("\n(function attachExplain");
  eval(old.slice(os, oe).replace("const EXPLAIN","var OLD_EXPLAIN") + "\nglobalThis.OLD_EXPLAIN=OLD_EXPLAIN;");
  changed = 0;
  let i=0;
  for (const t of TOPICS) for (const q of t.questions) {
    const o = OLD_EXPLAIN[i++];
    if (!o || o.lex!==q.lex || o.why!==q.why) changed++;
  }
} catch (e) { fails.push("diff count failed "+e.message); }

if (fails.length) {
  console.log(fails.slice(0, 30).join("\n"));
  console.log("FAILS", fails.length);
  process.exit(1);
}
console.log("OK questions", n, "changed", changed, "vocab", VOCAB.length, "topics", TOPICS.length);
