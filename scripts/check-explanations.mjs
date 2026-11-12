/**
 * Reads each lesson's data.json directly (JSON.parse, no eval) and checks
 * that explanations mention the Konjunktiv II forms and connectors that
 * appear in the question or the vocab example.
 */
import fs from "node:fs";

const KII_ALT = "würdest|würden|würdet|würde|wärst|wären|wäret|wärt|wäre|hättest|hätten|hättet|hätte|könntest|könnten|könntet|könnte|müsstest|müssten|müsstet|müsste|solltest|sollten|solltet|sollte|dürftest|dürften|dürftet|dürfte|möchtest|möchten|möchtet|möchte|wüsstest|wüssten|wüsstet|wüsste";
const KII_RE = new RegExp("\\b((?:vor|ab|an|auf|aus|ein|mit|los|hin|her)?(?:" + KII_ALT + "))\\b", "giu");
const CONN_RE = /\b(obwohl|deshalb|deswegen|trotzdem|weswegen|weshalb|darum|daher|wegen|wenn|weil|dass|denn|aber|oder|ob)\b/giu;

const EXPECTED = [
  {
    file: new URL("../lektion4/data.json", import.meta.url),
    page: new URL("../lektion4/index.html", import.meta.url),
    questions: 179,
    topics: 11,
    vocab: 111,
    groups: 7,
    gaps: 6,
    storeKey: "schritteB1_L4_v1",
    zurich: true
  },
  {
    file: new URL("../lektion5/data.json", import.meta.url),
    page: new URL("../lektion5/index.html", import.meta.url),
    questions: 208,
    topics: 12,
    vocab: 103,
    groups: 7,
    gaps: 0,
    storeKey: "schritteB1_L5_v1",
    zurich: false
  }
];

function mentions(lex, token) {
  return new RegExp("(?<![\\p{L}])" + token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![\\p{L}])", "iu").test(lex);
}
function uniqForms(text, re) {
  const out = [], seen = new Set();
  for (const m of String(text).matchAll(re)) {
    const k = m[1].toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m[1]);
  }
  return out;
}
function sourceOf(r) {
  const answers = Array.isArray(r.a) ? r.a.map(String) : [String(r.a ?? "")];
  const primary = answers[0];
  const blanks = r.q.split("___");
  let filled;
  if (blanks.length === 1) filled = r.q;
  else if (blanks.length === 2) filled = blanks[0] + primary + blanks[1];
  else {
    const parts = primary.split(/\s*[–—]\s*/);
    if (parts.length === blanks.length - 1) {
      filled = blanks[0];
      parts.forEach((p, i) => { filled += p + blanks[i + 1]; });
    } else filled = blanks.join(primary);
  }
  filled = filled.replace(/\s*\((?:haben|sein|werden|können|müssen|sollen|dürfen|mögen|wissen|wolniej|przeklinać\/kląć, KB 53)\)/gi, " ");
  let extra = "";
  if (primary.split(/\s+/).length >= 4 && !filled.includes(primary)) extra += " " + primary;
  for (const a of answers.slice(1)) if (!filled.includes(a)) extra += " " + a;
  return (filled + " " + extra).replace(/\s+/g, " ").trim();
}
function extraVocabGloss(text, lex, forms) {
  const bits = [];
  let acc = lex;
  for (const [tok, pl] of forms) {
    if (mentions(text, tok) && !mentions(acc, tok)) {
      const bit = tok + " = „" + pl + "”";
      bits.push(bit);
      acc += "; " + bit;
    }
  }
  return bits.join("; ");
}

/**
 * Lektion 4 was written against this heuristic and must mention every hit.
 * Lektion 5 predates the check. These tokens already appear in a prompt or
 * example without a gloss; the learner-facing text stays as it was, and any
 * new miss outside this list still fails.
 */
const KNOWN_GAPS = {
  lektion5: {
    questions: {
      "folge:2": ["aber"],
      "folge:3": ["dass"],
      "anzeigen:6": ["aber"],
      "beratung:1": ["möchte", "oder"]
    },
    vocab: {
      "die Branche": ["möchten"],
      "sammeln": ["möchte"],
      "sich orientieren": ["möchten"],
      "die Verantwortung": ["möchten"],
      "übernehmen": ["möchte"],
      "künstlerisch": ["möchte"],
      "entwickeln": ["möchte"],
      "der Tierpfleger": ["möchte"],
      "der Weg": ["wegen"],
      "verlieren": ["sollten"]
    }
  }
};

const fails = [];
function fail(msg) { fails.push(msg); }
function unexplained(tokens, lex, allowed) {
  const skip = new Set(allowed || []);
  return tokens.filter((tok) => !mentions(lex || "", tok) && !skip.has(tok.toLowerCase()));
}

const engineUrl = new URL("../shared/engine.js", import.meta.url);
const engineSrc = fs.readFileSync(engineUrl, "utf8");
for (const hook of ['id="r-pl"', "title-pl", "chip-pl"]) {
  if (!engineSrc.includes(hook)) fail("shared engine missing polish UI hook " + hook);
}
if (!engineSrc.includes("lesson.storeKey")) fail("engine does not read the lesson storage key");

for (const spec of EXPECTED) {
  const lesson = JSON.parse(fs.readFileSync(spec.file, "utf8"));
  const page = fs.readFileSync(spec.page, "utf8");
  const where = lesson.id || spec.file.pathname;
  if (lesson.storeKey !== spec.storeKey) fail(where + " storeKey " + lesson.storeKey);
  if (!page.includes("<title>" + lesson.title + "</title>")) fail(where + " page title does not match data.title");
  if (!page.includes('href="../shared/lesson.css"')) fail(where + " page does not use the shared stylesheet");
  if (!page.includes('from "../shared/engine.js"')) fail(where + " page does not load the shared engine");
  if (!page.includes('new URL("./data.json"')) fail(where + " page does not load ./data.json");
  if (!Array.isArray(lesson.topics) || lesson.topics.length !== spec.topics) fail(where + " topics " + lesson.topics.length);
  if (!Array.isArray(lesson.vocab) || lesson.vocab.length !== spec.vocab) fail(where + " vocab " + lesson.vocab.length);
  if (!Array.isArray(lesson.vocabGroups) || lesson.vocabGroups.length !== spec.groups) fail(where + " groups " + lesson.vocabGroups.length);
  if ((lesson.customGaps || []).length !== spec.gaps) fail(where + " gaps " + (lesson.customGaps || []).length);
  if (!lesson.mix || typeof lesson.mix.reminder !== "string" || typeof lesson.mix.src !== "string") fail(where + " mix block missing");
  if (!Array.isArray(lesson.help) || !lesson.help.length) fail(where + " help sections missing");
  if (!Array.isArray(lesson.vocabForms) || !lesson.vocabForms.length) fail(where + " vocabForms missing");

  const gaps = (KNOWN_GAPS[lesson.id] || {}).questions || {};
  const vocabGaps = (KNOWN_GAPS[lesson.id] || {}).vocab || {};
  let n = 0;
  let zurich = null;
  for (const t of lesson.topics) {
    if (!t.id || !t.pl || typeof t.reminder !== "string") fail(where + " topic incomplete " + (t.id || "?"));
    if (!Array.isArray(t.questions)) { fail(where + " topic without questions " + t.id); continue; }
    t.questions.forEach((q, qIndex) => {
      n++;
      const label = where + " #" + n + " " + t.id;
      if (q.t === "order") {
        if (!Array.isArray(q.w) || !q.w.length) fail(label + " order without words");
      } else if (q.t === "mc") {
        if (!Array.isArray(q.o) || !q.o.includes(q.a)) fail(label + " mc answer not in options");
      } else if (q.t === "type") {
        if (q.a == null || q.a === "") fail(label + " type without answer");
      } else fail(label + " unknown type " + q.t);
      if (typeof q.q !== "string") fail(label + " missing prompt");
      const text = sourceOf(q);
      const need = [...uniqForms(text, KII_RE), ...uniqForms(text, CONN_RE)];
      const miss = unexplained(need, q.lex || "", gaps[t.id + ":" + qIndex]);
      if (miss.length) fail(label + " missing " + miss.join(",") + " :: " + (q.lex || "").slice(0, 140));
      if (/Zürich keine Arbeit/.test(text)) zurich = q;
    });
  }
  if (n !== spec.questions) fail(where + " question count " + n);
  if (spec.zurich) {
    if (!zurich) fail(where + " zürich question missing");
    else {
      if (!mentions(zurich.lex, "hätte") || !mentions(zurich.lex, "würden") || !mentions(zurich.lex, "wenn")) fail(where + " zürich lex " + zurich.lex);
      if (!/hätte/.test(zurich.why) || !/würden/.test(zurich.why) || !/zurückgehen/.test(zurich.why)) fail(where + " zürich why " + zurich.why);
    }
  }
  for (const g of lesson.vocabGroups) if (!g.pl || !g.id) fail(where + " vocab group without pl " + (g && g.id));
  for (const w of lesson.vocab) {
    const forms = w.pl && w.pl[0] !== "(" ? " (" + w.pl + ")" : "";
    const base = w.d + forms + " = " + w.p;
    const extra = extraVocabGloss((w.x || "") + " " + w.d, base, lesson.vocabForms);
    const lex = extra ? base + "; " + extra : base;
    const text = (w.x || "") + " " + w.d;
    const miss = unexplained([...uniqForms(text, KII_RE), ...uniqForms(text, CONN_RE)], lex, vocabGaps[w.d]);
    if (miss.length) fail(where + " vocab " + w.d + " missing " + miss.join(","));
  }
  console.log("OK", where, "questions", n, "vocab", lesson.vocab.length, "topics", lesson.topics.length);
}

if (fails.length) {
  console.log(fails.slice(0, 40).join("\n"));
  console.log("FAILS", fails.length);
  process.exit(1);
}
