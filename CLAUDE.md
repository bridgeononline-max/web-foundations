# Web Foundations — notes for Claude

- Follow study-notebook-design/GUIDELINES.md (Rishal's design advice). Built from `starter/`.
- Stand-alone (Rishal, 20 Nov 2026): no links to gradlabs.in, other courses or Gradient AI Labs
  branding on the pages. `support: false` in course.js.
- Unlisted: keep `<meta name="robots" content="noindex, nofollow">` on every page. Served at
  gradlabs.in/learn/web-foundations/ with `unlisted: true` in the site's external-courses.ts.
- Content follows a 22-day bootcamp syllabus (Foundation Topic 3: HTML/CSS; Topic 4: JavaScript,
  DOM, Bootstrap, portfolio). Eight lessons; Lesson 1 written first, the rest are "Soon".
- Live editors: `assets/live.js`. `<div class="live" data-h>` with a `<textarea>`; challenges add
  `data-check` (window.LIVE_CHECKS in the lesson), `data-answer` and `data-goal` (ids of
  `<script type="text/plain">` blocks: a `<template>` would drop `<html>`, `<head>` and `<body>`).
  The preview iframe is sandboxed without scripts. JavaScript lessons will need `allow-scripts`
  and a console panel: add that as an option, not a change to existing editors.
- Practice pages are self-ticking build challenges (not number answers like the maths courses).
- Test a page by filling every practice with "Put it in the editor": every check must tick, and
  ↺ Reset must untick them all. Check light, dark and a phone width.
