/* 
=================================================================
LAB TITLE: Basic JavaScript
INSTRUCTIONS:
• Read the TODO description.
• Use the Console (F12 → Console) to view outputs.
=================================================================
*/

// ==========================
// TODO-1: Embedded Script    
// ==========================
// Write a <script> tag directly in the index.html file.
// Inside that script, use console.log("Hello from embedded JS!").
// This helps you understand the difference between inline/embedded JS and external JS.
// After testing, keep using this external JS for the rest of the tasks.
 
// ==========================
// TODO-2: Connect JS file
// ==========================
// Link the js file with index.html file.
// make a script tag inside the head tag of the index.html file.
 


// ==========================
// TODO-3: SYNTAX & VARIABLES
// ==========================

// Task 3.1 — declare & reassign
// Create let course variable and assign "CIS101" as value; display it usinng console.log(VARIABLE_NAME).
// Reassign the value "CIS102" to course variable; display it again.
// write code here
console.log("JS Lab Connected — Start completing the TODOs!");
let course = "CIS101";
console.log(course);
course = "CIS102";
console.log(course);
 
// Task 3.2 — const safety
// Create a const SCHOOL variable and assign a value "MyCollege"; then TRY to reassign it and observe the Console error. Add a comment explaining why reassignment fails.
// NOTE: After reassignment, keep the reassignment line commented so the file runs without errors.
// write code here

const SCHOOL = "MyCollege";
console.log(SCHOOL);
 // SCHOOL = "NewCollege";
// This causes an error because const variables cannot be reassigned once they are declared.


// ==========================
// TODO-4 ARITHMETIC & TYPES
// ==========================
 
// Task 4.1 — arithmetic basics
// Given let x = 8, y = 3;
// Perform the operations on variable x and y: addition, subtraction, multiplication, division, and remainder. Display the result of each operation using console.log().
// write code here
let x = 8, y = 3;
console.log("x + y =", x + y);
console.log("x - y =", x - y);
console.log("x * y =", x * y);
console.log("x / y =", x / y);
console.log("x % y =", x % y);


 
// Task 4.2 — number vs string
// Display the results of "2" + 3, 2 + "3", and 2 + 3 using console.log() function. Add a short comment: why do the first two concatenate?
// write code here
// When one operand is a string, + performs string concatenation (implicit type conversion to string).
console.log('"2" + 3 =', "2" + 3);
console.log('2 + "3" =', 2 + "3");
console.log("2 + 3 =", 2 + 3);
 
// ==========================
// TODO-5: CONDITIONALS (CORE)
// ==========================
 
// Task 5.1 — else-if ladder
// Write a program that checks a user's age (take age input from user).
//       Use if–else if–else statements to categorize and log:
//         - "Child" if age < 13
//         - "Young" if age is between 13 and 35
//         - "Aged" if age > 35
// write code here
let age = Number(prompt("Enter your age:"));

if (age < 13) {
  console.log("Child");
} else if (age >= 13 && age <= 35) {
  console.log("Young");
} else {
  console.log("Aged");
}

 
// Task 5.2 — Switch statement
// Create a variable let day = "Mon".
//       Use a switch statement to check the value of day.
//         - If it is "Mon", "Tue", "Wed", "Thu", or "Fri", log "weekday".
//         - If it is "Sat" or "Sun", log "weekend".
//         - For any other value, log "unknown".
// write code here
let day = "Mon";
switch (day) {
  case "Mon":
  case "Tue":
  case "Wed":
  case "Thu":
  case "Fri":
    console.log("weekday");
    break;
  case "Sat":
  case "Sun":
    console.log("weekend");
    break;
  default:
    console.log("unknown");
}
 
// ===============
// TODO-6: LOOPS
// ===============
 
// Task 6.1 — for loop sum
// TODO: Sum integers from 1 to 10 with a for loop; display the result of the total sum.
// write code here
let sum = 0;
for (let i = 1; i <= 10; i++) {
  sum += i;
}
console.log(sum);  
 
// Task 6.2 — while loop
// Declare let t = 3.
// Use a while loop with condition (t > 0).
// INSIDE the loop:
//   1) Log the current value of t using console.log(t)
//   2) Decrement t using t--
// NOTE: The decrement must be inside the while loop body.
// write your code here
let t = 3;
while (t > 0) {
  console.log(t);
  t--;
}
 
// =============================
// TODO-7: FUNCTIONS (DECL, RETURN, ARROW)
// =============================
 
// Task 7.1 — pure function + return
// Make a function add(a,b){ return a+b; } display the result of add(2,5).
// write code here
function add(a, b) {
    return a + b;
  }
console.log("add(2,5) =", add(2, 5));
  

// Task 7.2 — Arrow functions
// Make an arrow function; const cube = n => n*n*n; and display the result of the cube.
// write code here
 
const cube = (n) => n * n * n;
console.log("cube(3) =", cube(3));
  
 
// =================================
// TODO-8: SCOPE & GLOBAL OBJECT (ESSENTIALS)
// =================================
 
// Task 8.1 — var vs let scope
// Declare var a = 1 and let b = 2 inside a block { }.
// Then, OUTSIDE the block:
//   - Log a using console.log(a)
//   - Attempt to log b using console.log(b)
// NOTE: console.log(b) is expected to throw a ReferenceError:
// try {
//    console.log("let b outside block =", b);
//  } catch (err) {
//    console.log("let b outside block error:", err.message);
//  }
// write code here
{
    var a = 1;
    let b = 2;
  }
  console.log("var a outside block =", a);
  
  try {
    console.log("let b outside block =", b);
  } catch (err) {
    console.log("let b outside block error:", err.message);
  }
 
// ==================
// TODO-9: ARRAYS (CORE)
// ==================
 
// Task 9.1 — create & mutate
// TODO: let nums = [3,1,4]; then push(1), unshift(9), pop(); log final array and its length.
let nums = [3, 1, 4];
nums.push(1);
nums.unshift(9);
nums.pop();
console.log("nums =", nums);
console.log("nums length =", nums.length);


// Task 9.2 - You are given the following array of numbers:
// const scores = [45, 82, 67, 90, 38, 76, 55];
// Perform the following tasks:
// Use filter() to keep only scores that are 60 or higher
// Use map() to add 5 bonus points to each remaining score
// Use sort() to sort the scores in descending order
// write code here
 // Task 9.2 — filter/map/sort
const scores = [45, 82, 67, 90, 38, 76, 55];

const result = scores
  .filter((s) => s >= 60)
  .map((s) => s + 5)
  .sort((a, b) => b - a);

console.log("scores result =", result);
 
// End of manual — great job! Keep this file open and work task by task.