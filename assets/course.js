// course.js — everything that belongs to this course only.
// The shared look and features come from study-notebook-design (loaded after this file).
// Live HTML editors and challenges come from assets/live.js (this course only).

const COURSE_LESSONS = [
  // n: lesson number · step: short word for the step row · file: the page in lessons/
  // ready: false shows "Soon" on the home page · leaves: the question that leads to the next lesson
  // test: the page (counting every page) that holds the lesson test
  { part: "Part 1 · HTML & CSS", n: 1, step: "first page", title: "Your first web page", file: "lesson1.html", ready: true, test: 16,
    summary: "Tags, headings, paragraphs, links, images and lists. Write real HTML from the first minute.",
    leaves: "How do we lay out tables, forms and boxes?" },
  { n: 2, step: "structure", title: "Tables, forms and boxes", file: "lesson2.html", ready: false,
    summary: "Tables, forms, div, id and class, video and audio, meta tags, semantic elements.",
    leaves: "The page works, but it looks plain. How do we style it?" },
  { n: 3, step: "CSS", title: "Styling with CSS", file: "lesson3.html", ready: false,
    summary: "Three ways to add CSS, selectors, colours, borders, margin, padding, the box model and position.",
    leaves: "How do we put things side by side, and make the page fit a phone?" },
  { n: 4, step: "layout", title: "Layout: Flexbox and Grid", file: "lesson4.html", ready: false,
    summary: "Display, Flexbox, Grid, pseudo-classes, specificity, transitions, animations and media queries.",
    leaves: "The page looks right. How do we make it do things?" },
  { part: "Part 2 · JavaScript", n: 5, step: "JS basics", title: "JavaScript basics", file: "lesson5.html", ready: false,
    summary: "Variables, data types, operators, and making decisions with if, switch and the ternary.",
    leaves: "How do we repeat work without copying it out again?" },
  { n: 6, step: "loops", title: "Loops, functions and strings", file: "lesson6.html", ready: false,
    summary: "for, while, functions, objects, for…in and for…of, and string methods.",
    leaves: "How do we work with a whole list of things, and change the page itself?" },
  { n: 7, step: "arrays + DOM", title: "Arrays and the DOM", file: "lesson7.html", ready: false,
    summary: "Array methods, searching and sorting. Then the DOM: change the page and react to clicks.",
    leaves: "How do we build a complete, good-looking site quickly?" },
  { part: "Part 3 · Your site", n: 8, step: "portfolio", title: "Bootstrap and your portfolio", file: "lesson8.html", ready: false,
    summary: "Bootstrap's ready-made styles, then build your own portfolio site and put it online with GitHub.",
    leaves: null },
];

window.COURSE = {
  id: "web-foundations",
  pathLabel: "The course",
  lessons: COURSE_LESSONS,
  support: false,                  // stand-alone course: no support note
  setup: [],
};
