// live.js — live HTML editors for this course (load after common.js).
//
// An editor: type HTML on the left, see the page on the right as you type.
//   <div class="live" data-h="200"><textarea aria-label="Your HTML">…html…</textarea></div>
//   data-h      height in pixels of the code box and the page (default 180)
//   data-tab    show a browser tab above the page, with the page's <title>
//
// A challenge: the same editor with a checklist that ticks itself as you type.
//   <div class="live" data-check="aboutMe" data-answer="aboutMeAnswer" data-goal="goalTpl">…</div>
//   data-check  name of a list in window.LIVE_CHECKS: [{ say, hint, test(doc, code) → true/false }]
//   data-answer id of a <script type="text/plain"> (or <template>) holding one possible answer (a "Show an answer" button)
//   data-goal   id of a <script type="text/plain"> (or <template>) holding the page to copy (shown small, above the editor)
//
// Pictures: src="notebook.svg" loads from assets/img/ (a <base> is added to every page).
(function () {
  const here = document.currentScript && document.currentScript.src;
  const IMG = here ? new URL("img/", here).href : "assets/img/";

  const st = document.createElement("style");
  st.textContent = `
  .live { margin: 4px 0 0; container-type: inline-size; }
  .live-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .live textarea { height: var(--tall); }
  @container (max-width: 560px) {
    .live-grid { grid-template-columns: 1fr; }
    .live textarea { height: var(--short); }
    .live.has-goal .live-grid > div:last-child { order: -1; }   /* goal and page first, then the code */
  }
  .live-label { font-family: var(--head); font-size: 1.05rem; color: var(--pencil); margin: 0 0 3px; display: flex; gap: 8px; align-items: center; }
  .live textarea { display: block; width: 100%; box-sizing: border-box; resize: vertical; font: 0.9rem/1.5 var(--mono);
    background: var(--code-bg); color: var(--code-ink); caret-color: var(--hl-yellow); border: 2px solid var(--ink);
    border-radius: var(--radius, 8px); padding: 10px 12px; tab-size: 2; white-space: pre; overflow: auto; }
  .live textarea:focus { outline: 3px solid var(--hl-blue); outline-offset: 1px; }
  .live-frame { border: 2px solid var(--ink); border-radius: var(--radius, 8px); overflow: hidden; background: #fff; display: flex; flex-direction: column; }
  .live-bar { display: flex; align-items: center; gap: 6px; padding: 5px 8px 0; background: #E9ECF2; border-bottom: 1px solid #C9CED8; }
  .live-bar i { width: 9px; height: 9px; border-radius: 50%; background: #C3C8D2; display: inline-block; }
  .live-tab { margin-left: 8px; background: #fff; color: #1D2238; font: 0.8rem var(--body); padding: 4px 12px; border-radius: 7px 7px 0 0;
    max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .live-tab.empty { color: #8A90A0; font-style: italic; }
  .live iframe { display: block; width: 100%; border: 0; background: #fff; flex: 1; }
  .live-msg { font-size: 0.88rem; margin-top: 5px; min-height: 1.3em; color: var(--pencil); }
  .live-msg a { color: var(--pen); }
  .live-checks { list-style: none; padding: 0; margin: 10px 0 0; display: grid; gap: 3px; }
  .live-checks li { display: flex; gap: 8px; align-items: baseline; }
  .live-checks .tick { font-weight: 700; width: 1.2em; text-align: center; color: var(--pencil); flex: none; }
  .live-checks li.ok .tick { color: var(--good); }
  .live-checks li.ok .what { text-decoration: line-through; text-decoration-color: var(--good); text-decoration-thickness: 2px; }
  .live-checks .hint { color: var(--pencil); font-size: 0.88rem; }
  .live-done { margin-top: 8px; font-family: var(--head); font-size: 1.2rem; color: var(--good); }
  .live-answer { margin-top: 8px; }
  .live-answer pre { margin: 6px 0 0; }
  .live-goal { margin: 0 0 10px; }
  `;
  document.head.appendChild(st);

  // Remove the shared indent and the first/last empty lines, so the code can be indented in the page source
  function tidy(s) {
    const lines = s.replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    const pad = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(pad)).join("\n");
  }

  // The page the student wrote, with a <base> so pictures load from assets/img/
  function pageFor(code) {
    const base = `<base href="${IMG}">`;
    const m = code.match(/<!doctype[^>]*>/i);
    return m ? code.replace(m[0], m[0] + base) : base + code;
  }

  // A <script type="text/plain"> keeps a whole page as typed (a <template> would drop <html>, <head> and <body>)
  const raw = el => el.tagName === "SCRIPT" ? el.textContent : el.innerHTML;

  function frameBox(h, tab) {
    const box = document.createElement("div");
    box.className = "live-frame";
    box.innerHTML = (tab ? '<div class="live-bar"><i></i><i></i><i></i><span class="live-tab"></span></div>' : "") +
      `<iframe sandbox="allow-same-origin" title="The page" style="height:${h}px"></iframe>`;
    return box;
  }

  function build(box) {
    const ta = box.querySelector("textarea");
    if (!ta) return;
    const start = tidy(ta.value);
    ta.value = start;
    ta.spellcheck = false;
    ta.setAttribute("autocapitalize", "off");
    ta.setAttribute("autocomplete", "off");
    const h = Number(box.dataset.h) || 180;
    const short = h + (box.dataset.tab ? 26 : 0) + 4;
    ta.style.setProperty("--short", short + "px");
    ta.style.setProperty("--tall", short + "px");
    box.setAttribute("data-no-swipe", "");

    const grid = document.createElement("div");
    grid.className = "live-grid";
    const left = document.createElement("div");
    left.innerHTML = '<div class="live-label">✎ Your HTML</div>';
    const right = document.createElement("div");
    right.innerHTML = '<div class="live-label">👀 The page</div>';
    const frame = frameBox(h, box.dataset.tab);
    const iframe = frame.querySelector("iframe");
    const msg = document.createElement("div");
    msg.className = "live-msg";
    msg.setAttribute("aria-live", "polite");
    right.append(frame, msg);
    box.insertBefore(grid, ta);
    left.appendChild(ta);
    grid.append(left, right);

    // The page to copy, for challenges
    if (box.dataset.goal) {
      const tpl = document.getElementById(box.dataset.goal);
      const goal = document.createElement("div");
      goal.className = "live-goal";
      goal.innerHTML = '<div class="live-label">🎯 The goal</div>';
      const gf = frameBox(Number(box.dataset.goalH) || 150, false);
      goal.appendChild(gf);
      right.insertBefore(goal, right.firstChild);
      ta.style.setProperty("--tall", short + (Number(box.dataset.goalH) || 150) + 42 + "px");
      box.classList.add("has-goal");
      gf.querySelector("iframe").srcdoc = pageFor(tidy(raw(tpl)));
    }

    // Checklist
    const checks = (window.LIVE_CHECKS || {})[box.dataset.check];
    let list, done;
    if (checks) {
      list = document.createElement("ul");
      list.className = "live-checks";
      list.innerHTML = checks.map(c => `<li><span class="tick">○</span><span><span class="what">${c.say}</span> <span class="hint" hidden>${c.hint || ""}</span></span></li>`).join("");
      done = document.createElement("div");
      done.className = "live-done";
      done.hidden = true;
      done.textContent = "🎉 All done! Nicely built.";
      box.append(list, done);
    }

    // One possible answer
    let ansBox;
    if (box.dataset.answer) {
      const tpl = document.getElementById(box.dataset.answer);
      ansBox = document.createElement("div");
      ansBox.className = "live-answer";
      ansBox.innerHTML = '<button type="button">Show an answer</button><div hidden><pre><code></code></pre><button type="button">Put it in the editor</button></div>';
      const [show, use] = ansBox.querySelectorAll("button");
      const inner = ansBox.querySelector("div");
      const answer = tidy(raw(tpl));
      ansBox.querySelector("code").textContent = answer;
      show.onclick = () => { inner.hidden = !inner.hidden; show.textContent = inner.hidden ? "Show an answer" : "Hide the answer"; };
      use.onclick = () => { ta.value = answer; render(); };
      box.appendChild(ansBox);
    }

    function check() {
      if (!checks) return;
      let doc;
      try { doc = iframe.contentDocument; } catch (e) { return; }
      if (!doc || !doc.body) return;
      const changed = ta.value !== start;
      let all = true;
      checks.forEach((c, i) => {
        let ok = false;
        try { ok = !!c.test(doc, ta.value); } catch (e) { ok = false; }
        const li = list.children[i];
        li.classList.toggle("ok", ok);
        li.querySelector(".tick").textContent = ok ? "✓" : "○";
        li.querySelector(".hint").hidden = ok || !changed || !c.hint;
        if (!ok) all = false;
      });
      done.hidden = !all;
    }

    iframe.addEventListener("load", () => {
      let doc;
      try { doc = iframe.contentDocument; } catch (e) { return; }
      if (!doc) return;
      const tab = frame.querySelector(".live-tab");
      if (tab) {
        const t = doc.title.trim();
        tab.textContent = t || "(no title yet)";
        tab.classList.toggle("empty", !t);
      }
      // Links would load inside the little page: say where they go instead
      doc.addEventListener("click", e => {
        const a = e.target.closest && e.target.closest("a[href]");
        if (!a) return;
        e.preventDefault();
        const raw = a.getAttribute("href");
        const tabNote = a.getAttribute("target") === "_blank" ? " in a new tab" : "";
        const safe = /^https?:\/\//i.test(raw);
        msg.textContent = "";
        msg.append(`This link goes to ${raw}${tabNote}. `);
        if (safe) {
          const go = document.createElement("a");
          go.href = raw; go.target = "_blank"; go.rel = "noopener"; go.textContent = "Open it ↗";
          msg.appendChild(go);
        }
      });
      check();
    });

    let timer;
    function render() {
      clearTimeout(timer);
      msg.textContent = "";
      iframe.srcdoc = pageFor(ta.value);
    }
    ta.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 250); });
    ta.addEventListener("keydown", e => {
      if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        ta.setRangeText("  ", s, en, "end");
        ta.dispatchEvent(new Event("input"));
      } else if (e.key === "Escape") {
        ta.blur();   // so Tab can leave the editor again
      }
    });

    const reset = () => {
      ta.value = start;
      if (ansBox) { ansBox.querySelector("div").hidden = true; ansBox.querySelector("button").textContent = "Show an answer"; }
      render();
    };
    if (typeof addReset === "function" && box.closest(".activity") && !box.closest(".activity").querySelector(".reset")) addReset(box, reset);
    render();
  }

  document.querySelectorAll(".live").forEach(build);
})();
