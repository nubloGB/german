/**
 * Locks the shared schedule and opens both lessons in headless Chrome:
 * routes, one correct quiz answer, and the historical localStorage key.
 *
 * Set SCREENSHOT_DIR to write PNGs (and a short video) of the run.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { SRS, nextBox, plNum, renderShell } from "../shared/engine.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotDir = process.env.SCREENSHOT_DIR || "";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function checkSchedule() {
  assert(SRS.DAY === 86400000, "DAY");
  assert(SRS.NEW_WORDS === 12, "NEW_WORDS");
  assert(SRS.NEW_QS === 5, "NEW_QS");
  assert(SRS.FAIL_MS === 10 * 60 * 1000, "FAIL_MS");
  const box = { 1: SRS.FAIL_MS, 2: SRS.DAY, 3: 4 * SRS.DAY, 4: 8 * SRS.DAY, 5: 21 * SRS.DAY };
  assert(box[1] === 600000 && box[5] === 21 * 86400000, "box intervals");
  assert(nextBox(0) === 2 && nextBox(1) === 2 && nextBox(4) === 5 && nextBox(5) === 5, "nextBox");
  assert(plNum(1, "karta", "karty", "kart") === "karta", "pl 1");
  assert(plNum(4, "karta", "karty", "kart") === "karty", "pl 4");
  assert(plNum(5, "karta", "karty", "kart") === "kart", "pl 5");
  assert(plNum(12, "karta", "karty", "kart") === "kart", "pl 12");
  assert(plNum(22, "karta", "karty", "kart") === "karty", "pl 22");
  for (const dir of ["lektion4", "lektion5"]) {
    const lesson = JSON.parse(fs.readFileSync(path.join(root, dir, "data.json"), "utf8"));
    const html = renderShell(lesson);
    assert(html.includes(lesson.crumb), dir + " crumb");
    assert(html.includes(lesson.topicsLabel), dir + " topics label");
    assert(html.includes(lesson.footerNote), dir + " footer");
    assert(html.includes('id="r-pl"'), dir + " polish reminder hook");
  }
  console.log("schedule and shell ok");
}

function contentType(file) {
  const ext = path.extname(file);
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.normalize(path.join(root, rel));
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "content-type": contentType(file), "cache-control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function chromePath() {
  if (process.env.CHROME_PATH === "bundled") return undefined;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  for (const candidate of ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium-browser", "/usr/bin/chromium"]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return undefined;
}

async function shot(page, name) {
  if (!shotDir) return;
  fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, name), fullPage: false });
}

async function answerCurrent(page) {
  const q = await page.evaluate(() => {
    const session = window.__app.session;
    const question = session.questions[session.qi];
    return {
      t: question.t,
      a: question.a,
      w: question.w || null,
      topic: question.topic,
      index: question.index
    };
  });
  if (q.t === "mc") {
    const buttons = page.locator("#answer-zone .opt");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).locator("span").nth(1).innerText();
      if (text === q.a) {
        await buttons.nth(i).click();
        return q;
      }
    }
    throw new Error("mc option not found: " + q.a);
  }
  if (q.t === "order") {
    for (const word of q.w) {
      const bank = page.locator("#answer-zone .order-bank .tile");
      const count = await bank.count();
      let clicked = false;
      for (let i = 0; i < count; i++) {
        if ((await bank.nth(i).innerText()) === word) {
          await bank.nth(i).click();
          clicked = true;
          break;
        }
      }
      if (!clicked) throw new Error("order tile not found: " + word);
    }
    await page.locator("#answer-zone .check").click();
    return q;
  }
  if (q.t === "type") {
    const value = Array.isArray(q.a) ? q.a[0] : q.a;
    await page.locator("#answer-zone .type-input").fill(value);
    await page.locator("#answer-zone .check").click();
    return q;
  }
  throw new Error("unsupported question type " + q.t);
}

async function openLesson(page, origin, dir) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto(origin + "/" + dir + "/", { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#greet");
  await page.waitForSelector("#h-topics button");
  if (errors.length) throw new Error(dir + " page errors: " + errors.join(" | "));
  const lesson = JSON.parse(fs.readFileSync(path.join(root, dir, "data.json"), "utf8"));
  const title = await page.title();
  assert(title === lesson.title, dir + " title " + title);
  const crumb = await page.locator(".crumb a").innerText();
  assert(crumb === lesson.crumb, dir + " crumb " + crumb);
  const grammarTopics = lesson.topics.filter((t) => !t.isTest);
  const grammarN = grammarTopics.reduce((n, t) => n + t.questions.length, 0);
  const meta = await page.locator("#h-topic-meta").innerText();
  assert(meta === grammarTopics.length + " tematów · " + grammarN + " pytań", dir + " meta " + meta);
  assert((await page.evaluate(() => location.hash)) === "#dzis", dir + " default hash");
  return lesson;
}

async function openHelp(page, needle) {
  await page.locator("#grammar [data-act='info']").click();
  await page.waitForSelector("#help:not([hidden])");
  const text = await page.locator("#help-body").innerText();
  assert(text.includes(needle), "help missing " + needle);
  assert(text.includes("Wszystkie przypomnienia"), "help missing topic list");
  await page.locator("[data-act='close-help']").click();
  await page.waitForFunction(() => document.getElementById("help").hidden);
}

async function walkRoutes(page) {
  const clicks = [
    ["fiszki", "vocabHome"],
    ["gramatyka", "grammar"],
    ["test", "tests"],
    ["postep", "progress"],
    ["dzis", "home"]
  ];
  for (const [hash, id] of clicks) {
    await page.locator("aside [data-nav='" + hash + "']").click();
    await page.waitForSelector("#" + id + ".active");
    assert((await page.evaluate(() => location.hash)) === "#" + hash, "hash " + hash);
  }
}

async function answerAndPersist(page, lesson) {
  await page.locator("#h-topics button").first().click();
  await page.waitForSelector("#reminder.active");
  assert((await page.evaluate(() => location.hash)).startsWith("#temat/"), "topic route");
  await page.locator("#r-start").click();
  await page.waitForSelector("#game.active");
  assert((await page.evaluate(() => location.hash)) === "#quiz", "quiz route");
  const q = await answerCurrent(page);
  await page.waitForSelector("#feedback:not([hidden])");
  const feedback = await page.locator("#feedback-text").innerText();
  assert(feedback.startsWith("Dobrze"), "feedback " + feedback);
  const saved = await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, lesson.storeKey);
  assert(saved, "missing storage " + lesson.storeKey);
  assert(saved.mastered[q.topic] && saved.mastered[q.topic][q.index] === true, "mastered not recorded");
  const card = saved.gsrs[q.topic + ":" + q.index];
  assert(card && card.box === 2, "srs box " + (card && card.box));
  const ahead = card.due - Date.now();
  assert(Math.abs(ahead - SRS.DAY) < 20000, "srs due in " + ahead + " ms");
  return q;
}

async function main() {
  checkSchedule();
  const server = await startServer();
  const port = server.address().port;
  const origin = "http://127.0.0.1:" + port;
  const executablePath = chromePath();
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      recordVideo: shotDir ? { dir: shotDir, size: { width: 1280, height: 800 } } : undefined
    });
    const page = await context.newPage();
    const l4 = await openLesson(page, origin, "lektion4");
    await shot(page, "l4-home.png");
    await walkRoutes(page);
    await page.locator("aside [data-nav='gramatyka']").click();
    await page.waitForSelector("#grammar.active");
    await openHelp(page, "wäre");
    await page.locator("aside [data-nav='dzis']").click();
    await page.waitForSelector("#home.active");
    const answered = await answerAndPersist(page, l4);
    await shot(page, "l4-quiz.png");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector("#h-topics button");
    const cnt = await page.locator("#h-topics button[data-id='" + answered.topic + "'] .cnt").innerText();
    assert(cnt.startsWith("1/"), "persisted count " + cnt + " for " + answered.topic);
    const still = await page.evaluate((key) => localStorage.getItem(key), l4.storeKey);
    assert(still && JSON.parse(still).mastered[answered.topic][answered.index] === true, "progress lost on reload");
    assert(await page.evaluate((key) => localStorage.getItem(key), "schritteB1_L5_v1") === null, "L4 wrote the L5 key");
    await shot(page, "l4-persisted.png");

    const l5 = await openLesson(page, origin, "lektion5");
    await shot(page, "l5-home.png");
    await page.locator("aside [data-nav='gramatyka']").click();
    await page.waitForSelector("#grammar.active");
    assert((await page.evaluate(() => location.hash)) === "#gramatyka", "l5 grammar hash");
    await openHelp(page, "Infinitiv mit zu");
    await shot(page, "l5-grammar.png");
    await page.locator("aside [data-nav='dzis']").click();
    await answerAndPersist(page, l5);
    await shot(page, "l5-quiz.png");
    const l4after = await page.evaluate((key) => localStorage.getItem(key), l4.storeKey);
    assert(JSON.parse(l4after).mastered[answered.topic][answered.index] === true, "L5 cleared L4 progress");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin + "/lektion4/#dzis", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#home.active");
    await page.waitForSelector(".tabbar");
    await shot(page, "l4-mobile-home.png");
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(wide < 2, "mobile horizontal overflow " + wide);

    const video = page.video();
    await context.close();
    if (video && shotDir) {
      const src = await video.path();
      const dest = path.join(shotDir, "lessons-smoke.webm");
      fs.copyFileSync(src, dest);
      if (src !== dest) fs.unlinkSync(src);
      console.log("video", dest);
    }
    console.log("browser smoke ok", executablePath || "playwright-chromium");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
