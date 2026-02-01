#!/usr/bin/env node

/**
 * Lab Autograder — 4-1-js-fundamentals-main
 *
 * Marking:
 * - 80 marks for TODOs (JS + HTML script checks)
 * - 20 marks for submission timing (deadline-based)
 *   - On/before deadline => 20/20
 *   - After deadline     => 10/20
 *
 * Deadline: 03 Feb 2026 11:59 PM (Asia/Riyadh, UTC+03:00)
 *
 * Notes:
 * - Ignores HTML comments and JS comments (so examples inside comments do NOT count).
 * - Light checks only (not strict): looks for top-level structure and key constructs.
 * - Accepts common equivalents (e.g., cube via n**3 / Math.pow / n*n*n).
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ARTIFACTS_DIR = "artifacts";
const FEEDBACK_DIR = path.join(ARTIFACTS_DIR, "feedback");
fs.mkdirSync(FEEDBACK_DIR, { recursive: true });

/* -----------------------------
   Deadline (Asia/Riyadh)
   03 Feb 2026, 11:59 PM
-------------------------------- */
const DEADLINE_RIYADH_ISO = "2026-02-03T23:59:00+03:00";
const DEADLINE_MS = Date.parse(DEADLINE_RIYADH_ISO);

// Submission marks policy
const SUBMISSION_MAX = 20;
const SUBMISSION_LATE = 10;

/* -----------------------------
   TODO marks (out of 80)
-------------------------------- */
const tasks = [
  { id: "todo1", name: 'TODO 1: Embedded <script> in HTML (Hello log)', marks: 6 },
  { id: "todo2", name: "TODO 2: Link external JS file in <head>", marks: 6 },
  { id: "todo3", name: "TODO 3: Syntax & Variables (Task 3.1 only)", marks: 6 },
  { id: "todo4", name: "TODO 4: Arithmetic & Types (4.1 ops + 4.2 logs)", marks: 10 },
  { id: "todo5", name: "TODO 5: Conditionals (if/else-if ladder + switch)", marks: 14 },
  { id: "todo6", name: "TODO 6: Loops (for sum + while decrement)", marks: 10 },
  { id: "todo7", name: "TODO 7: Functions (decl/return + arrow cube)", marks: 10 },
  { id: "todo8", name: "TODO 8: Scope (var vs let block)", marks: 6 },
  { id: "todo9", name: "TODO 9: Arrays (mutations + filter/map/sort)", marks: 12 },
];

const STEPS_MAX = tasks.reduce((sum, t) => sum + t.marks, 0); // 80
const TOTAL_MAX = STEPS_MAX + SUBMISSION_MAX; // 100

/* -----------------------------
   Helpers
-------------------------------- */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function mdEscape(s) {
  return String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function splitMarks(stepMarks, missingCount, totalChecks) {
  if (missingCount <= 0) return stepMarks;
  const perItem = stepMarks / totalChecks;
  const deducted = perItem * missingCount;
  return Math.max(0, round2(stepMarks - deducted));
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Strip JS comments while trying to preserve strings/templates.
 * Not a full parser, but good enough for beginner labs and avoids
 * counting commented-out code.
 */
function stripJsComments(code) {
  if (!code) return code;

  let out = "";
  let i = 0;

  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;

  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];

    // Handle string/template boundaries (with escapes)
    if (!inDouble && !inTemplate && ch === "'" && !inSingle) {
      inSingle = true;
      out += ch;
      i++;
      continue;
    }
    if (inSingle && ch === "'") {
      // end single string if not escaped
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inSingle = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inTemplate && ch === '"' && !inDouble) {
      inDouble = true;
      out += ch;
      i++;
      continue;
    }
    if (inDouble && ch === '"') {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inDouble = false;
      out += ch;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && ch === "`" && !inTemplate) {
      inTemplate = true;
      out += ch;
      i++;
      continue;
    }
    if (inTemplate && ch === "`") {
      let backslashes = 0;
      for (let k = i - 1; k >= 0 && code[k] === "\\"; k--) backslashes++;
      if (backslashes % 2 === 0) inTemplate = false;
      out += ch;
      i++;
      continue;
    }

    // If not inside a string/template, strip comments
    if (!inSingle && !inDouble && !inTemplate) {
      // line comment
      if (ch === "/" && next === "/") {
        i += 2;
        while (i < code.length && code[i] !== "\n") i++;
        continue;
      }
      // block comment
      if (ch === "/" && next === "*") {
        i += 2;
        while (i < code.length) {
          if (code[i] === "*" && code[i + 1] === "/") {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    out += ch;
    i++;
  }

  return out;
}

function findAnyHtmlFile() {
  const preferred = path.join(process.cwd(), "index.html");
  if (fs.existsSync(preferred)) return preferred;

  const ignoreDirs = new Set(["node_modules", ".git", ARTIFACTS_DIR]);
  const stack = [process.cwd()];

  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const e of entries) {
      const full = path.join(dir, e.name);

      if (e.isDirectory()) {
        if (!ignoreDirs.has(e.name)) stack.push(full);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".html")) {
        return full;
      }
    }
  }
  return null;
}

function findStudentJsFile() {
  // Prefer common names
  const preferredNames = ["script.js", "app.js", "main.js", "index.js"];
  for (const name of preferredNames) {
    const p = path.join(process.cwd(), name);
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }

  const ignoreDirs = new Set(["node_modules", ".git", ARTIFACTS_DIR]);
  const ignoreFiles = new Set(["grade.cjs", "grade.js"]);

  const stack = [process.cwd()];
  while (stack.length) {
    const dir = stack.pop();
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const e of entries) {
      const full = path.join(dir, e.name);

      if (e.isDirectory()) {
        if (!ignoreDirs.has(e.name)) stack.push(full);
      } else if (e.isFile()) {
        const lower = e.name.toLowerCase();
        if (ignoreFiles.has(lower)) continue;
        if (lower.endsWith(".js")) return full;
      }
    }
  }
  return null;
}

function normalizeHead(html) {
  const m = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : "";
}

/* Extract <script> tags; return array of { attrs, content } */
function extractScriptTags(html) {
  const scripts = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    scripts.push({ attrs: m[1] || "", content: m[2] || "" });
  }
  return scripts;
}

function scriptHasSrc(attrs) {
  return /\bsrc\s*=\s*["'][^"']+["']/i.test(attrs || "");
}

function getScriptSrc(attrs) {
  const m = (attrs || "").match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function hasEmbeddedHelloScript(html) {
  const scripts = extractScriptTags(html);
  for (const s of scripts) {
    if (scriptHasSrc(s.attrs)) continue; // embedded = no src
    const content = stripJsComments(s.content || "");
    const okLog = /console\.log\s*\(\s*["']Hello\s+from\s+embedded\s+JS!\s*["']\s*\)/i.test(content);
    if (okLog) return true;
  }
  return false;
}

function hasExternalScriptInHead(headHtml) {
  // must be in <head> and have <script src="...js">
  const scripts = extractScriptTags(headHtml);
  for (const s of scripts) {
    if (!scriptHasSrc(s.attrs)) continue;
    const src = getScriptSrc(s.attrs) || "";
    if (/\.js(\?|#|$)/i.test(src)) return true;
  }
  return false;
}

function jsLinkedInHeadMatchesStudentFile(headHtml, studentJsPath) {
  if (!studentJsPath) return false;
  const studentBase = path.basename(studentJsPath).toLowerCase();

  const scripts = extractScriptTags(headHtml);
  for (const s of scripts) {
    if (!scriptHasSrc(s.attrs)) continue;
    const src = (getScriptSrc(s.attrs) || "").toLowerCase();
    // allow ./script.js, script.js, js/script.js, etc
    if (src.endsWith("/" + studentBase) || src === studentBase || src.endsWith(studentBase)) {
      return true;
    }
  }
  return false;
}

/* -----------------------------
   Determine submission time
-------------------------------- */
let lastCommitISO = null;
let lastCommitMS = null;

try {
  lastCommitISO = execSync("git log -1 --format=%cI", { encoding: "utf8" }).trim();
  lastCommitMS = Date.parse(lastCommitISO);
} catch {
  lastCommitISO = new Date().toISOString();
  lastCommitMS = Date.now();
}

/* -----------------------------
   Submission marks
-------------------------------- */
const isLate = Number.isFinite(lastCommitMS) ? lastCommitMS > DEADLINE_MS : true;
const submissionScore = isLate ? SUBMISSION_LATE : SUBMISSION_MAX;

/* -----------------------------
   Load student files
-------------------------------- */
const htmlFile = findAnyHtmlFile();
const jsFile = findStudentJsFile();

const htmlRaw = htmlFile ? safeRead(htmlFile) : null;
const jsRaw = jsFile ? safeRead(jsFile) : null;

const html = htmlRaw ? stripHtmlComments(htmlRaw) : null;
const js = jsRaw ? stripJsComments(jsRaw) : null;

const results = []; // { id, name, max, score, checklist[], deductions[] }

/* -----------------------------
   Result helpers
-------------------------------- */
function addResult(task, required, missing) {
  const score = splitMarks(task.marks, missing.length, required.length);
  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score,
    checklist: required.map(r => `${r.ok ? "✅" : "❌"} ${r.label}`),
    deductions: missing.length ? missing.map(m => `Missing: ${m.label}`) : [],
  });
}

function failTask(task, reason) {
  results.push({
    id: task.id,
    name: task.name,
    max: task.marks,
    score: 0,
    checklist: [],
    deductions: [reason],
  });
}

/* -----------------------------
   Grade TODOs
-------------------------------- */

// If HTML missing, TODO1/2 fail, but JS-based TODOs can still be graded if JS exists.
if (!html) {
  failTask(
    tasks[0],
    htmlFile ? `Could not read HTML file at: ${htmlFile}` : "No .html file found (expected index.html or any .html file)."
  );
  failTask(
    tasks[1],
    htmlFile ? `Could not read HTML file at: ${htmlFile}` : "No .html file found (expected index.html or any .html file)."
  );
}

// If JS missing, JS TODOs become zero (TODO3..TODO9). TODO2 can still partially score for having a script tag.
if (!js) {
  for (const t of tasks) {
    if (t.id === "todo1" || t.id === "todo2") continue;
    failTask(t, jsFile ? `Could not read JS file at: ${jsFile}` : "No student .js file found.");
  }
}

/* TODO1: Embedded script in HTML */
if (html) {
  const required = [
    { label: "Has at least one embedded <script> tag (no src)", ok: extractScriptTags(html).some(s => !scriptHasSrc(s.attrs)) },
    { label: 'Embedded script logs: console.log("Hello from embedded JS!")', ok: hasEmbeddedHelloScript(html) },
  ];
  const missing = required.filter(r => !r.ok);
  addResult(tasks[0], required, missing);
}

/* TODO2: External JS linked in <head> */
if (html) {
  const head = normalizeHead(html);
  const hasHead = head && head.length > 0;

  const required = [
    { label: "Has <head> section", ok: !!hasHead },
    { label: 'Has <script src="..."> inside <head>', ok: !!hasHead && hasExternalScriptInHead(head) },
    { label: "Student .js file exists in submission", ok: !!jsFile },
    {
      label: "Linked src matches a student .js filename (flexible)",
      ok: !!hasHead && !!jsFile && jsLinkedInHeadMatchesStudentFile(head, jsFile),
    },
  ];

  const missing = required.filter(r => !r.ok);
  addResult(tasks[1], required, missing);
}

/* From here: JS TODO checks */
if (js) {
  // small helpers
  const has = re => re.test(js);

  /* TODO3: Task 3.1 — declare & reassign course + logs */
  {
    const required = [
      { label: 'Declares: let course = "CIS101" (or \'CIS101\')', ok: has(/\blet\s+course\s*=\s*["']CIS101["']\s*;?/i) },
      { label: 'Reassigns: course = "CIS102" (or \'CIS102\')', ok: has(/\bcourse\s*=\s*["']CIS102["']\s*;?/i) },
      { label: "Logs course using console.log(course) (at least once)", ok: has(/console\.log\s*\(\s*course\s*\)/i) },
    ];
    const missing = required.filter(r => !r.ok);
    addResult(tasks[2], required, missing);
  }

  /* TODO4: Arithmetic & Types */
  {
    // 4.1 operations: just detect operator usage somewhere (not strict on variable names)
    const opPlus = /\b[\w\]\)]\s*\+\s*[\w\[\(]/.test(js);
    const opMinus = /\b[\w\]\)]\s*-\s*[\w\[\(]/.test(js);
    const opMul = /\b[\w\]\)]\s*\*\s*[\w\[\(]/.test(js);
    const opDiv = /\b[\w\]\)]\s*\/\s*[\w\[\(]/.test(js);
    const opMod = /\b[\w\]\)]\s*%\s*[\w\[\(]/.test(js);

    // 4.2 expressions: check they logged results (structure presence)
    const expr1 = /["']2["']\s*\+\s*3/.test(js);
    const expr2 = /2\s*\+\s*["']3["']/.test(js);
    const expr3 = /(^|[^\w"'])2\s*\+\s*3([^\w]|$)/.test(js); // avoid matching "2"+3 etc too much

    const required = [
      { label: "Uses addition (+) somewhere", ok: opPlus },
      { label: "Uses subtraction (-) somewhere", ok: opMinus },
      { label: "Uses multiplication (*) somewhere", ok: opMul },
      { label: "Uses division (/) somewhere", ok: opDiv },
      { label: "Uses remainder (%) somewhere", ok: opMod },

      { label: 'Includes expression like "2" + 3 (logged or present)', ok: expr1 },
      { label: 'Includes expression like 2 + "3" (logged or present)', ok: expr2 },
      { label: "Includes expression like 2 + 3 (logged or present)", ok: expr3 },
      { label: "Uses console.log() at least once in TODO4 area (not strict)", ok: has(/console\.log\s*\(/i) },
    ];

    const missing = required.filter(r => !r.ok);
    addResult(tasks[3], required, missing);
  }

  /* TODO5: Conditionals */
  {
    // 5.1 ladder: look for if + else if + else + conditions and the three labels
    const hasIf = /(^|\s)if\s*\(/.test(js);
    const hasElseIf = /else\s+if\s*\(/.test(js);
    const hasElse = /else\b/.test(js);

    const condChild = /if\s*\([\s\S]*?<\s*13[\s\S]*?\)/i.test(js);
    const condYoung = /else\s+if\s*\([\s\S]*(>=\s*13[\s\S]*(<=\s*35|<\s*36)|<=\s*35[\s\S]*>=\s*13|<\s*36[\s\S]*>=\s*13)[\s\S]*?\)/i.test(js);
    const condAged = /(else\s+if\s*\([\s\S]*>\s*35[\s\S]*?\))|(else\b[\s\S]*?(Aged|aged))/i.test(js);

    const logChild = /console\.log\s*\(\s*["']Child["']\s*\)/i.test(js);
    const logYoung = /console\.log\s*\(\s*["']Young["']\s*\)/i.test(js);
    const logAged = /console\.log\s*\(\s*["']Aged["']\s*\)/i.test(js);

    // 5.2 switch: day cases
    const hasSwitch = /switch\s*\(\s*day\s*\)/i.test(js) || /switch\s*\(\s*[\w$]+\s*\)/.test(js);
    const hasCaseMon = /case\s*["']Mon["']\s*:/.test(js);
    const hasCaseTue = /case\s*["']Tue["']\s*:/.test(js);
    const hasCaseWed = /case\s*["']Wed["']\s*:/.test(js);
    const hasCaseThu = /case\s*["']Thu["']\s*:/.test(js);
    const hasCaseFri = /case\s*["']Fri["']\s*:/.test(js);
    const hasCaseSat = /case\s*["']Sat["']\s*:/.test(js);
    const hasCaseSun = /case\s*["']Sun["']\s*:/.test(js);
    const hasDefault = /default\s*:/.test(js);

    const logWeekday = /console\.log\s*\(\s*["']weekday["']\s*\)/i.test(js);
    const logWeekend = /console\.log\s*\(\s*["']weekend["']\s*\)/i.test(js);
    const logUnknown = /console\.log\s*\(\s*["']unknown["']\s*\)/i.test(js);

    const required = [
      { label: "Has if (...) statement", ok: hasIf },
      { label: "Has else if (...) (ladder structure)", ok: hasElseIf },
      { label: "Has else (ladder structure)", ok: hasElse },
      { label: "Has condition for Child (age < 13)", ok: condChild },
      { label: "Has condition for Young (13 to 35)", ok: condYoung },
      { label: "Has condition for Aged (age > 35) or equivalent handling", ok: condAged },
      { label: 'Logs "Child"', ok: logChild },
      { label: 'Logs "Young"', ok: logYoung },
      { label: 'Logs "Aged"', ok: logAged },

      { label: "Has a switch statement", ok: hasSwitch },
      { label: 'Has cases covering weekdays (at least "Mon" and one more)', ok: hasCaseMon && (hasCaseTue || hasCaseWed || hasCaseThu || hasCaseFri) },
      { label: 'Has cases covering weekend (Sat or Sun)', ok: hasCaseSat || hasCaseSun },
      { label: "Has default case", ok: hasDefault },
      { label: 'Logs "weekday"', ok: logWeekday },
      { label: 'Logs "weekend"', ok: logWeekend },
      { label: 'Logs "unknown"', ok: logUnknown },
    ];

    const missing = required.filter(r => !r.ok);
    addResult(tasks[4], required, missing);
  }

  /* TODO6: Loops */
  {
    // 6.1 for sum 1..10
    const hasFor = /for\s*\(/.test(js);
    const hasRange10 = /(<=\s*10|<\s*11)/.test(js) && /(=\s*1|=\s*0)/.test(js);
    const hasSumUpdate = /(\btotal\b|\bsum\b)\s*(\+=|=)\s*/i.test(js) || /\+=\s*\w+/.test(js);

    // 6.2 while loop with t > 0 and decrement
    const hasWhile = /while\s*\(/.test(js);
    const hasTCond = /\bt\s*>\s*0\b/.test(js);
    const hasTDec = /\bt\s*--\b/.test(js) || /\bt\s*-\=\s*1\b/.test(js) || /\bt\s*=\s*t\s*-\s*1\b/.test(js);
    const hasLogInWhile = /while\s*\([\s\S]*?\)\s*\{[\s\S]*?console\.log\s*\(/i.test(js);

    const required = [
      { label: "Has a for loop", ok: hasFor },
      { label: "For loop looks like summing up to 10 (mentions 10/11 and start 0/1)", ok: hasRange10 },
      { label: "Updates a sum/total variable (+= or similar)", ok: hasSumUpdate },

      { label: "Has a while loop", ok: hasWhile },
      { label: "While condition uses t > 0", ok: hasTCond },
      { label: "Decrements t each iteration (t-- / t -= 1 / t = t - 1)", ok: hasTDec },
      { label: "Logs inside the while loop (not strict)", ok: hasLogInWhile || /console\.log\s*\(\s*t\s*\)/i.test(js) },
    ];

    const missing = required.filter(r => !r.ok);
    addResult(tasks[5], required, missing);
  }

  /* TODO7: Functions */
  {
    // 7.1 add(a,b) return a+b; and call add(2,5)
    const hasAddDecl = /function\s+add\s*\(\s*a\s*,\s*b\s*\)/i.test(js);
    const hasReturnSum = /return\s+[^;]*\ba\s*\+\s*b\b/i.test(js) || /return\s+[^;]*\bb\s*\+\s*a\b/i.test(js);
    const hasCallAdd = /\badd\s*\(\s*2\s*,\s*5\s*\)/.test(js);

    // 7.2 arrow cube
    const hasArrow = /=>/.test(js);
    const hasCubeName = /\bcube\b/.test(js);
    const hasCubeLogic =
      /\bn\s*\*\s*n\s*\*\s*n\b/.test(js) ||
      /\bn\s*\*\*\s*3\b/.test(js) ||
      /Math\.pow\s*\(\s*n\s*,\s*3\s*\)/i.test(js);

    const required = [
      { label: "Declares function add(a, b)", ok: hasAddDecl },
      { label: "Returns a + b inside add()", ok: hasReturnSum },
      { label: "Calls add(2,5)", ok: hasCallAdd },

      { label: "Uses an arrow function (=>)", ok: hasArrow },
      { label: "Defines/uses cube identifier (flexible)", ok: hasCubeName },
      { label: "Cube logic present (n*n*n OR n**3 OR Math.pow(n,3))", ok: hasCubeLogic },
    ];

    const missing = required.filter(r => !r.ok);
    addResult(tasks[6], required, missing);
  }

  /* TODO8: Scope & global object essentials (var vs let in block) */
  {
    const hasVarA = /\bvar\s+a\s*=\s*1\b/.test(js) || /\bvar\s+a\b/.test(js);
    const hasLetB = /\blet\s+b\s*=\s*2\b/.test(js) || /\blet\s+b\b/.test(js);

    // Look for a block that contains both declarations (very light)
    const hasBlockWithBoth = /\{[\s\S]*?\bvar\s+a\b[\s\S]*?\blet\s+b\b[\s\S]*?\}/.test(js);

    const required = [
      { label: "Declares var a (inside a block)", ok: hasVarA },
      { label: "Declares let b (inside a block)", ok: hasLetB },
      { label: "Has a block { } that contains both var a and let b (light check)", ok: hasBlockWithBoth },
      { label: "Attempts to log a or b outside the block (not strict)", ok: /console\.log\s*\(\s*a\s*\)/.test(js) || /console\.log\s*\(\s*b\s*\)/.test(js) },
    ];

    const missing = required.filter(r => !r.ok);
    addResult(tasks[7], required, missing);
  }

  /* TODO9: Arrays */
  {
    // 9.1 nums = [3,1,4] + push + unshift + pop + log final + length
    const hasNumsArray = /\b(nums)\s*=\s*\[\s*3\s*,\s*1\s*,\s*4\s*\]/i.test(js) || /\[\s*3\s*,\s*1\s*,\s*4\s*\]/.test(js);
    const hasPush = /\.push\s*\(/.test(js);
    const hasUnshift = /\.unshift\s*\(/.test(js);
    const hasPop = /\.pop\s*\(\s*\)/.test(js);
    const hasLength = /\.length\b/.test(js);

    // 9.2 filter/map/sort descending
    const hasScoresArray = /\bconst\s+scores\s*=\s*\[\s*45\s*,\s*82\s*,\s*67\s*,\s*90\s*,\s*38\s*,\s*76\s*,\s*55\s*\]/i.test(js) || /\bscores\b/.test(js);
    const hasFilter = /\.filter\s*\(/.test(js);
    const hasMap = /\.map\s*\(/.test(js);
    const hasSort = /\.sort\s*\(/.test(js);
    const hasDescComparator = /sort\s*\(\s*\(\s*\w+\s*,\s*\w+\s*\)\s*=>\s*\w+\s*-\s*\w+\s*\)/.test(js) || /sort\s*\(\s*function\s*\(\s*\w+\s*,\s*\w+\s*\)\s*\{\s*return\s+\w+\s*-\s*\w+;?\s*\}\s*\)/.test(js);

    const required = [
      { label: "Creates nums array [3,1,4] (or equivalent)", ok: hasNumsArray },
      { label: "Uses push()", ok: hasPush },
      { label: "Uses unshift()", ok: hasUnshift },
      { label: "Uses pop()", ok: hasPop },
      { label: "Logs array length (.length)", ok: hasLength },

      { label: "Has scores array (or uses scores variable)", ok: hasScoresArray },
      { label: "Uses filter()", ok: hasFilter },
      { label: "Uses map()", ok: hasMap },
      { label: "Uses sort()", ok: hasSort },
      { label: "Sort appears descending (b - a comparator) OR equivalent", ok: hasDescComparator || hasSort },
    ];

    const missing = required.filter(r => !r.ok);
    addResult(tasks[8], required, missing);
  }
}

/* -----------------------------
   Final scoring
-------------------------------- */
const stepsScore = results.reduce((sum, r) => sum + r.score, 0);
const totalScore = round2(stepsScore + submissionScore);

/* -----------------------------
   Build summary + feedback
-------------------------------- */
const submissionLine = `- **Lab:** 4-1-js-fundamentals-main
- **Deadline (Riyadh / UTC+03:00):** ${DEADLINE_RIYADH_ISO}
- **Last commit time (from git log):** ${lastCommitISO}
- **Submission marks:** **${submissionScore}/${SUBMISSION_MAX}** ${isLate ? "(Late submission)" : "(On time)"}
`;

let summary = `# 4-1-js-fundamentals-main — Autograding Summary

## Submission

${submissionLine}

## Files Checked

- HTML: ${htmlFile ? `✅ ${htmlFile}` : "❌ No HTML file found"}
- JS: ${jsFile ? `✅ ${jsFile}` : "❌ No student .js file found"}

## Marks Breakdown

| Component | Marks |
|---|---:|
`;

for (const r of results) summary += `| ${r.name} | ${r.score}/${r.max} |\n`;
summary += `| Submission (timing) | ${submissionScore}/${SUBMISSION_MAX} |\n`;

summary += `
## Total Marks

**${totalScore} / ${TOTAL_MAX}**

## Detailed Checks (What you did / missed)
`;

for (const r of results) {
  const done = (r.checklist || []).filter(x => x.startsWith("✅"));
  const missed = (r.checklist || []).filter(x => x.startsWith("❌"));

  summary += `
<details>
  <summary><strong>${mdEscape(r.name)}</strong> — ${r.score}/${r.max}</summary>

  <br/>

  <strong>✅ Found</strong>
  ${done.length ? "\n" + done.map(x => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing detected)"}

  <br/><br/>

  <strong>❌ Missing</strong>
  ${missed.length ? "\n" + missed.map(x => `- ${mdEscape(x)}`).join("\n") : "\n- (Nothing missing)"}

  <br/><br/>

  <strong>❗ Deductions / Notes</strong>
  ${
    r.deductions && r.deductions.length
      ? "\n" + r.deductions.map(d => `- ${mdEscape(d)}`).join("\n")
      : "\n- No deductions."
  }

</details>
`;
}

summary += `
> Full feedback is also available in: \`artifacts/feedback/README.md\`
`;

let feedback = `# 4-1-js-fundamentals-main — Feedback

## Submission

${submissionLine}

## Files Checked

- HTML: ${htmlFile ? `✅ ${htmlFile}` : "❌ No HTML file found"}
- JS: ${jsFile ? `✅ ${jsFile}` : "❌ No student .js file found"}

---

## TODO-by-TODO Feedback
`;

for (const r of results) {
  feedback += `
### ${r.name} — **${r.score}/${r.max}**

**Checklist**
${r.checklist.length ? r.checklist.map(x => `- ${x}`).join("\n") : "- (No checks available)"}

**Deductions / Notes**
${r.deductions.length ? r.deductions.map(d => `- ❗ ${d}`).join("\n") : "- ✅ No deductions. Good job!"}
`;
}

feedback += `
---

## How marks were deducted (rules)

- HTML comments are ignored (so examples in comments do NOT count).
- JS comments are ignored (so examples in comments do NOT count).
- Checks are intentionally light: they look for key constructs and basic structure.
- Code can be in ANY order; repeated code is allowed.
- Common equivalents are accepted (e.g., cube via \`n*n*n\`, \`n**3\`, or \`Math.pow(n,3)\`).
- Missing required items reduce marks proportionally within that TODO.
`;

/* -----------------------------
   Write outputs
-------------------------------- */
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);

const csv = `student,score,max_score
all_students,${totalScore},${TOTAL_MAX}
`;

fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACTS_DIR, "grade.csv"), csv);
fs.writeFileSync(path.join(FEEDBACK_DIR, "README.md"), feedback);

console.log(
  `✔ Lab graded: ${totalScore}/${TOTAL_MAX} (Submission: ${submissionScore}/${SUBMISSION_MAX}, TODOs: ${stepsScore}/${STEPS_MAX}).`
);
