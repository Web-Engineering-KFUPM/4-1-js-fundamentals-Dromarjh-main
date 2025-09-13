/*
  JS Console Lab — Solutions
  --------------------------------------------
  • Console-only; open DevTools to view output.
  • Each solution corresponds to the TODO numbering in the student file.
  • Use this as an instructor key or to self-check after attempting the tasks.

  NOTE: Where a task might intentionally throw (e.g., reassigning const),
  the solution demonstrates the behavior safely with try/catch.
*/

// ==========================
// TODO-2: Connect JS file — (HTML example in comments)
// ==========================
// In index.html <head> (or at the end of <body>):
// <script src="lab.js" defer></script>

console.log("%cJS Lab Connected — Solutions Running", "font-weight:bold; font-size:14px");

// ==========================
// TODO-3: SYNTAX & VARIABLES
// ==========================

// Task 3.1 — declare & reassign
let course = "CIS101";
console.log("[3.1] course (initial):", course);
course = "CIS102";
console.log("[3.1] course (updated):", course);

// Task 3.2 — const safety
const SCHOOL = "MyCollege";
console.log("[3.2] SCHOOL (const):", SCHOOL);
try {
  // Attempting to reassign a const throws a TypeError
  // This shows the error without crashing the whole script
  // (remove try/catch to see it stop execution)
  // eslint-disable-next-line no-const-assign
  // SCHOOL = "OtherCollege"; // direct reassignment (kept commented in student file)
  // For demonstration, we'll actually try it here:
  // eslint-disable-next-line no-const-assign
  SCHOOL = "OtherCollege";
} catch (e) {
  console.log("[3.2] Reassigning const error:", e.message);
}

// ==========================
// TODO-4: ARITHMETIC & TYPES
// ==========================

// Task 4.1 — arithmetic basics
let x = 8, y = 3;
console.log("[4.1] x + y =", x + y);
console.log("[4.1] x - y =", x - y);
console.log("[4.1] x * y =", x * y);
console.log("[4.1] x / y =", x / y);
console.log("[4.1] x % y =", x % y);

// Task 4.2 — number vs string +
console.log('[4.2] "2" + 3 =', "2" + 3);   // "23" (string concatenation)
console.log('[4.2] 2 + "3" =', 2 + "3");   // "23" (string concatenation)
console.log("[4.2] 2 + 3 =", 2 + 3);        // 5 (numeric addition)
// Explanation: If either operand to + is a string, JS concatenates strings.

// ==========================
// TODO-5: CONDITIONALS (CORE)
// ==========================

// Task 5.1 — else-if ladder
// Take age input; if input is invalid, fall back to a default
let ageInput = (typeof prompt === "function") ? prompt("Enter your age (number):") : "25";
let age = Number(ageInput);
if (Number.isNaN(age)) {
  age = 25;
  console.log("[5.1] Invalid age input; defaulting to:", age);
}
if (age < 13) {
  console.log("[5.1] Child");
} else if (age <= 35) {
  console.log("[5.1] Young");
} else {
  console.log("[5.1] Aged");
}

// Task 5.2 — Switch statement
let day = "Mon";
switch (day) {
  case "Mon":
  case "Tue":
  case "Wed":
  case "Thu":
  case "Fri":
    console.log("[5.2] weekday");
    break;
  case "Sat":
  case "Sun":
    console.log("[5.2] weekend");
    break;
  default:
    console.log("[5.2] unknown");
}

// (Reading only) — Ternary operator referenced in zyBooks
// Example, if desired:
// let temp = 31;
// console.log("[5.x]", temp >= 30 ? "hot" : "mild");

// ===============
// TODO-6: LOOPS
// ===============

// Task 6.1 — for loop sum (1..10)
let total = 0;
for (let i = 1; i <= 10; i++) {
  total += i;
}
console.log("[6.1] Sum 1..10 =", total);

// Task 6.2 — while loop countdown
let t = 3;
while (t > 0) {
  console.log("[6.2]", t);
  t--;
}
console.log("[6.2] Go!");

// (Optional) Do-While — referenced in zyBooks, included here minimally
let tries = 0;
let ok = false;
do {
  tries++;
  // Simulate a condition becoming true on first iteration
  ok = (tries === 1);
} while (!ok);
console.log("[6.x] do/while ran", tries, "time(s)");

// =============================
// TODO-7: FUNCTIONS (DECL, RETURN, ARROW)
// =============================

// Task 7.1 — pure function + return
function add(a, b) {
  return a + b;
}
console.log("[7.1] add(2, 5) =", add(2, 5));

// Task 7.2 — Arrow functions
const cube = (n) => n * n * n;
console.log("[7.2] cube(3) =", cube(3));

// =================================
// TODO-8: SCOPE & GLOBAL OBJECT (ESSENTIALS)
// =================================

// Task 8.1 — var vs let scope
{
  var a = 1;
  let b = 2;
}
console.log("[8.1] a (var outside block) =", a);
try {
  console.log("[8.1] b (let outside block) =", b);
} catch (e) {
  console.log("[8.1] b not accessible outside block:", e.message);
}

// ==================
// TODO-9: ARRAYS (CORE)
// ==================

// Task 9.1 — create & mutate
let nums = [3, 1, 4];
nums.push(1);
nums.unshift(9);
nums.pop();
console.log("[9.1] nums:", nums, "length:", nums.length);

// End of solutions
