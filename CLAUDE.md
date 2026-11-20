# Web Foundations — notes for Claude

- Follow study-notebook-design/GUIDELINES.md (Rishal's design advice). Built from `starter/`.
- Stand-alone (Rishal, 20 Nov 2026): no links to gradlabs.in, other courses or Gradient AI Labs
  branding on the pages. `support: false` in course.js.
- Unlisted: keep `<meta name="robots" content="noindex, nofollow">` on every page. Served at
  gradlabs.in/learn/web-foundations/ with `unlisted: true` in the site's external-courses.ts.
- Content follows a 22-day bootcamp syllabus (Foundation Topic 3: HTML/CSS; Topic 4: JavaScript,
  DOM, Bootstrap, portfolio). Eight lessons, all written (20 Nov 2026).
- Live editors: `assets/live.js`. `<div class="live" data-h>` with a `<textarea>`; challenges add
  `data-check` (window.LIVE_CHECKS in the lesson), `data-answer` and `data-goal` (ids of
  `<script type="text/plain">` blocks: a `<template>` would drop `<html>`, `<head>` and `<body>`).
  HTML editors are sandboxed without scripts. `data-js="console"` / `data-js="page"` run JavaScript on
  ▶ Run (Ctrl + Enter) with a console; `data-manual` for code with alert/prompt. Also `data-resize`
  (width slider, stacked layout), `data-tab`, `data-serp`, `data-tree`. Checks get (doc, code, logs, probe);
  use probe() (a hidden fresh copy) for checks that click buttons, so the student's page never changes.
  A page-mode answer holding `</script>` must be a `<template>`, not a `<script type="text/plain">`.
  A `</textarea>` inside an editor must be written `&lt;/textarea&gt;`.
- Bootstrap 5.3.3 from jsDelivr in Lesson 8; its checks look at class names, not computed styles.
- course.js `test:` numbers count every page, practice pages included.
- Practice pages are self-ticking build challenges (not number answers like the maths courses).
- Test a page by filling every practice with "Put it in the editor": every check must tick, and
  ↺ Reset must untick them all. Check light, dark and a phone width.
