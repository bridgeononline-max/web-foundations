// live.js — live editors for this course (load after common.js).
//
// An HTML editor: type HTML on the left, see the page on the right as you type.
//   <div class="live" data-h="200"><textarea aria-label="Your HTML">…html…</textarea></div>
//   data-h       height in pixels of the code box and the page (default 180)
//   data-tab     show a browser tab above the page, with the page's <title>
//   data-resize  a slider above the page that changes its width (for media queries)
//   data-tree    under the page, the page drawn as a tree of elements (the DOM)
//   data-serp    under the page, a search-result preview made from its <title> and <meta name="description">
//
// A JavaScript editor: press ▶ Run (or Ctrl + Enter) to run the code; console.log shows in a console.
//   data-js="console"  the textarea holds only JavaScript; only the console is shown
//   data-js="page"     the textarea holds a whole HTML page with <script>; the page and the console are shown
//   data-manual        don't run the starting code by itself (for code with alert or prompt)
//
// A challenge: any editor plus a checklist that ticks itself.
//   data-check   name of a list in window.LIVE_CHECKS: [{ say, hint, test(doc, code, logs, probe) → true/false }]
//                (logs: the lines the console showed on the last run; probe() → Promise of a hidden fresh copy
//                of the page, for checks that click things; a test may return a Promise)
//   data-answer  id of a <script type="text/plain"> holding one possible answer ("Show an answer")
//   data-goal    id of a <script type="text/plain"> holding the page to copy (shown above the page)
//
// Files: src="notebook.svg" (or clip.mp4, chime.mp3, site.css) loads from assets/img/ (a <base> is added).
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
    .live.has-goal .live-grid > div:last-child { order: -1; }
  }
  .live.stacked .live-grid { grid-template-columns: 1fr; }
  .live.stacked textarea { height: var(--short); }
  .live-label { font-family: var(--head); font-size: 1.05rem; color: var(--pencil); margin: 0 0 3px; display: flex; gap: 8px; align-items: center; min-height: 1.6em; }
  .live-label .live-run { margin-left: auto; padding: 2px 12px; font: 600 0.85rem var(--body); }
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
  .live-frame .live-stage { flex: 1; background: repeating-linear-gradient(45deg, #EEF0F5 0 8px, #F6F7FA 8px 16px); display: flex; }
  .live iframe { display: block; width: 100%; border: 0; background: #fff; flex: none; }
  .live-size { display: flex; gap: 8px; align-items: center; font-size: 0.88rem; color: var(--pencil); margin: 0 0 4px; }
  .live-size input { flex: 1; }
  .live-size b { font-family: var(--mono); color: var(--ink); min-width: 4.5em; }
  .live-msg { font-size: 0.88rem; margin-top: 5px; min-height: 1.3em; color: var(--pencil); }
  .live-msg a { color: var(--pen); }
  .live-console { margin-top: 8px; }
  .live-console:first-child { margin-top: 0; }
  .live-out { background: var(--code-bg); color: var(--code-ink); border: 2px solid var(--ink); border-radius: var(--radius, 8px);
    font: 0.88rem/1.5 var(--mono); padding: 8px 12px; overflow: auto; white-space: pre-wrap; word-break: break-word; box-sizing: border-box; }
  .live-out div { border-bottom: 1px solid rgba(255,255,255,.08); padding: 1px 0; }
  .live-out .err { color: #FF8A96; }
  .live-out .warn { color: #FFD479; }
  .live-out .info { color: #A9B6DA; font-style: italic; }
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
  .live-tree { margin-top: 8px; font: 0.85rem/1.55 var(--mono); background: var(--card); border: 1px dashed var(--pencil); border-radius: var(--radius, 8px); padding: 6px 10px; max-height: 200px; overflow: auto; }
  .live-tree ul { list-style: none; margin: 0; padding-left: 16px; border-left: 1px solid var(--rule); }
  .live-tree > ul { padding-left: 0; border: 0; }
  .live-tree .tg { color: var(--pen); font-weight: 600; }
  .live-tree .tx { color: var(--pencil); }
  `;
  document.head.appendChild(st);

  // Remove the shared indent and the first/last empty lines, so the code can be indented in the page source
  function tidy(s) {
    const lines = s.replace(/\t/g, "  ").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    if (!lines.length) return "";
    const pad = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(pad)).join("\n");
  }
  // A <script type="text/plain"> keeps a whole page as typed (a <template> would drop <html>, <head> and <body>)
  const raw = el => el.tagName === "SCRIPT" ? el.textContent : el.innerHTML;

  // Runs first inside a JavaScript page: sends console lines and errors back to this page.
  // Kept on one line, so line numbers in error messages match the student's code.
  const shim = (id, offset) => `<script>(function(){var I=${JSON.stringify(id)};function f(v,d){if(typeof v==="string")return d?JSON.stringify(v):v;if(v===null)return"null";if(v===undefined)return"undefined";if(typeof v==="function")return"ƒ "+(v.name||"")+"()";if(typeof v==="bigint")return v+"n";if(typeof v==="symbol")return v.toString();if(typeof v!=="object")return String(v);if(v.nodeType===1){return"<"+v.tagName.toLowerCase()+(v.id?' id="'+v.id+'"':"")+(v.className?' class="'+v.className+'"':"")+">"}if(d>2)return Array.isArray(v)?"[…]":"{…}";if(Array.isArray(v))return"["+v.map(function(x){return f(x,d+1)}).join(", ")+"]";var k=Object.keys(v);return k.length?"{ "+k.map(function(x){return x+": "+f(v[x],d+1)}).join(", ")+" }":"{}"}function s(kind,a){try{parent.postMessage({__live:I,kind:kind,text:Array.prototype.map.call(a,function(x){return f(x,0)}).join(" ")},"*")}catch(e){}}["log","info","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){s(k,arguments);return o.apply(console,arguments)}});window.addEventListener("error",function(e){s("error",["⚠ "+(e.message||"Error")+(e.lineno?"  (line "+(e.lineno-${offset})+")":"")])})})();<\/script>`;

  let nextId = 1;

  // The page the student wrote: a <base> so files load from assets/img/, and (for JavaScript) the console shim
  function pageFor(code, js, id) {
    const base = `<base href="${IMG}">`;
    if (js === "console") return base + shim(id, 1) + "<script>\n" + code + "\n<\/script>";
    const pre = base + (js ? shim(id, 0) : "");
    const m = code.match(/<!doctype[^>]*>/i);
    return m ? code.replace(m[0], m[0] + pre) : pre + code;
  }

  function frameBox(h, tab) {
    const box = document.createElement("div");
    box.className = "live-frame";
    box.innerHTML = (tab ? '<div class="live-bar"><i></i><i></i><i></i><span class="live-tab"></span></div>' : "") +
      `<div class="live-stage"><iframe title="The page" style="height:${h}px"></iframe></div>`;
    return box;
  }

  function build(box) {
    const ta = box.querySelector("textarea");
    if (!ta) return;
    const js = box.dataset.js || "";           // "", "console" or "page"
    const id = "live" + nextId++;
    const start = tidy(ta.value);
    ta.value = start;
    ta.spellcheck = false;
    ta.setAttribute("autocapitalize", "off");
    ta.setAttribute("autocomplete", "off");
    const h = Number(box.dataset.h) || 180;
    const conH = js === "console" ? h : Math.max(70, Math.round(h * 0.45));
    const short = h + (box.dataset.tab ? 26 : 0) + 4;
    ta.style.setProperty("--short", (js === "console" ? Math.min(h, 220) : short) + "px");
    ta.style.setProperty("--tall", (js === "page" ? short + conH + 36 : short) + "px");
    box.setAttribute("data-no-swipe", "");
    if (box.dataset.resize) { box.classList.add("stacked"); ta.style.setProperty("--short", Math.min(h, 190) + "px"); }   // the page gets the full width, so the slider can reach laptop sizes

    const grid = document.createElement("div");
    grid.className = "live-grid";
    const left = document.createElement("div");
    left.innerHTML = `<div class="live-label">✎ Your ${js === "console" ? "JavaScript" : "HTML"}${js ? '<button type="button" class="primary live-run" title="Run the code (Ctrl + Enter)">▶ Run</button>' : ""}</div>`;
    const right = document.createElement("div");
    const msg = document.createElement("div");
    msg.className = "live-msg";
    msg.setAttribute("aria-live", "polite");

    let serp, tree;
    const frame = frameBox(js === "console" ? 0 : h, box.dataset.tab);
    const iframe = frame.querySelector("iframe");
    iframe.setAttribute("sandbox", js ? "allow-scripts allow-same-origin allow-modals allow-forms" : "allow-same-origin");
    if (js === "console") {
      frame.hidden = true;                      // still runs the code, just not shown
      right.appendChild(frame);
    } else {
      right.innerHTML = '<div class="live-label">👀 The page</div>';
      if (box.dataset.resize) {
        const size = document.createElement("label");
        size.className = "live-size";
        size.innerHTML = 'Screen width <input type="range" min="280" max="900" step="10" value="900" aria-label="Screen width"> <b></b>';
        const range = size.querySelector("input"), outW = size.querySelector("b");
        const setW = () => { iframe.style.width = range.value + "px"; outW.textContent = range.value + "px"; };
        range.addEventListener("input", setW);
        right.appendChild(size);
        let first = true;
        const fit = () => {
          const w = Math.floor(frame.clientWidth - 4);
          if (w < 100) return;                  // hidden page: wait until it is shown
          range.max = Math.max(320, w);
          if (first || Number(range.value) > Number(range.max)) { range.value = range.max; first = false; }
          setW();
        };
        new ResizeObserver(fit).observe(frame);
      }
      right.append(frame, msg);
      if (box.dataset.tree) {
        tree = document.createElement("div");
        tree.className = "live-tree";
        tree.setAttribute("aria-label", "The page as a tree");
        right.appendChild(tree);
        ta.style.setProperty("--tall", short + 230 + "px");
      }
      if (box.dataset.serp) {
        serp = document.createElement("div");
        serp.className = "serp";
        serp.innerHTML = '<div class="u">example.com › my-page</div><div class="t"></div><div class="d"></div>';
        right.appendChild(serp);
        ta.style.setProperty("--tall", short + 118 + "px");
      }
    }

    // Console
    let out;
    if (js) {
      const con = document.createElement("div");
      con.className = "live-console";
      con.innerHTML = '<div class="live-label">🖥 Console</div><div class="live-out" aria-live="polite"></div>';
      out = con.querySelector(".live-out");
      out.style.height = conH + "px";
      right.appendChild(con);
      if (js === "console") right.appendChild(msg);
    }
    box.insertBefore(grid, ta);
    left.appendChild(ta);
    grid.append(left, right);

    // The page to copy, for challenges
    if (box.dataset.goal) {
      const tpl = document.getElementById(box.dataset.goal);
      const goal = document.createElement("div");
      goal.className = "live-goal";
      goal.innerHTML = '<div class="live-label">🎯 The goal</div>';
      const gh = Number(box.dataset.goalH) || 150;
      const gf = frameBox(gh, false);
      gf.querySelector("iframe").setAttribute("sandbox", "allow-same-origin");
      goal.appendChild(gf);
      right.insertBefore(goal, right.firstChild);
      ta.style.setProperty("--tall", short + gh + 42 + "px");
      box.classList.add("has-goal");
      gf.querySelector("iframe").srcdoc = pageFor(tidy(raw(tpl)), "", id);
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
      ansBox.innerHTML = '<button type="button">Show an answer</button><div hidden><pre><code></code></pre><button type="button" class="live-use">Put it in the editor</button></div>';
      const show = ansBox.querySelector("button"), use = ansBox.querySelector(".live-use");
      const inner = ansBox.querySelector("div");
      const answer = tidy(raw(tpl));
      ansBox.querySelector("code").textContent = answer;
      show.onclick = () => { inner.hidden = !inner.hidden; show.textContent = inner.hidden ? "Show an answer" : "Hide the answer"; };
      use.onclick = () => { ta.value = answer; render(); };
      box.appendChild(ansBox);
    }

    let logs = [];
    let ran = false;
    // probe(): a hidden, fresh copy of the student's page, for checks that click buttons
    // (so the checks never change the page the student is looking at)
    function probe() {
      return new Promise(res => {
        const f = document.createElement("iframe");
        f.setAttribute("sandbox", iframe.getAttribute("sandbox"));
        f.style.cssText = "position:absolute;left:-9999px;top:0;width:600px;height:400px;";
        f.setAttribute("aria-hidden", "true");
        f.addEventListener("load", () => { setTimeout(() => { res(f.contentDocument); setTimeout(() => f.remove(), 50); }, 30); }, { once: true });
        f.srcdoc = pageFor(ta.value, js, id + "-probe");
        document.body.appendChild(f);
      });
    }
    let checkRun = 0;
    function check() {
      if (!checks) return;
      let doc;
      try { doc = iframe.contentDocument; } catch (e) { return; }
      if (!doc || !doc.body) return;
      const changed = ta.value !== start;
      const run = ++checkRun;
      const results = checks.map(c => {
        try { return ran ? c.test(doc, ta.value, logs.slice(), probe) : false; } catch (e) { return false; }
      });
      Promise.all(results.map(r => Promise.resolve(r).catch(() => false))).then(vals => {
        if (run !== checkRun) return;           // a newer check started meanwhile
        let all = true;
        vals.forEach((ok, i) => {
          ok = !!ok;
          const li = list.children[i];
          li.classList.toggle("ok", ok);
          li.querySelector(".tick").textContent = ok ? "✓" : "○";
          li.querySelector(".hint").hidden = ok || !changed || !checks[i].hint;
          if (!ok) all = false;
        });
        done.hidden = !all;
      });
    }
    let checkTimer;
    const checkSoon = () => { clearTimeout(checkTimer); checkTimer = setTimeout(check, 80); };

    function line(kind, text) {
      if (!out) return;
      const info = out.querySelector(".info");
      if (info) info.remove();
      const d = document.createElement("div");
      if (kind === "error") d.className = "err"; else if (kind === "warn") d.className = "warn";
      d.textContent = text;
      out.appendChild(d);
      out.scrollTop = out.scrollHeight;
    }
    if (js) window.addEventListener("message", e => {
      if (!e.data || e.data.__live !== id || e.source !== iframe.contentWindow) return;
      logs.push(e.data.text);
      line(e.data.kind, e.data.text);
      checkSoon();
    });

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
      if (tree) {
        const esc = t => t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
        const node = el => {
          if (el.tagName === "HEAD") return '<li><span class="tg">head</span> <span class="tx">(facts about the page)</span></li>';
          const kids = [...el.childNodes].map(n => n.nodeType === 1 ? node(n) : (n.nodeType === 3 && n.textContent.trim() ? `<li class="tx">"${esc(n.textContent.trim().slice(0, 30))}"</li>` : "")).join("");
          const id = el.id ? `#${esc(el.id)}` : "", cl = el.classList.length ? "." + [...el.classList].map(esc).join(".") : "";
          return `<li><span class="tg">${el.tagName.toLowerCase()}</span>${id}${cl}${kids ? `<ul>${kids}</ul>` : ""}</li>`;
        };
        tree.innerHTML = '<ul><li><span class="tg">document</span><ul>' + node(doc.documentElement) + "</ul></li></ul>";
      }
      if (serp) {
        const t = doc.title.trim(), m = doc.querySelector('meta[name="description" i]'), d = m ? (m.getAttribute("content") || "").trim() : "";
        const st = serp.querySelector(".t"), sd = serp.querySelector(".d");
        st.textContent = t || "(no title)"; st.classList.toggle("empty", !t);
        sd.textContent = d || "(no description: search engines pick some text from the page)"; sd.classList.toggle("empty", !d);
      }
      // Links would load inside the little page: say where they go instead
      doc.addEventListener("click", e => {
        const a = e.target.closest && e.target.closest("a[href]");
        if (!a || e.defaultPrevented) return;
        const href = a.getAttribute("href");
        if (href.startsWith("#")) return;       // a jump within the page works as usual
        e.preventDefault();
        const tabNote = a.getAttribute("target") === "_blank" ? " in a new tab" : "";
        msg.textContent = "";
        msg.append(`This link goes to ${href}${tabNote}. `);
        if (/^https?:\/\//i.test(href)) {
          const go = document.createElement("a");
          go.href = href; go.target = "_blank"; go.rel = "noopener"; go.textContent = "Open it ↗";
          msg.appendChild(go);
        }
      });
      // Forms would reload the little page: show what would be sent instead
      doc.addEventListener("submit", e => {
        if (e.defaultPrevented) return;
        e.preventDefault();
        const data = [...new FormData(e.target).entries()].map(([k, v]) => `${k} = ${typeof v === "string" ? (v || "(empty)") : v.name}`);
        msg.textContent = data.length ? "The form would send: " + data.join(" · ") : "The form would send nothing: give each field a name.";
      });
      if (js && ran && out) setTimeout(() => { if (!out.children.length) out.innerHTML = '<div class="info">(nothing printed)</div>'; }, 150);
      checkSoon();
    });

    let timer;
    function render() {
      clearTimeout(timer);
      msg.textContent = "";
      logs = [];
      if (out) out.innerHTML = "";
      ran = true;
      iframe.srcdoc = pageFor(ta.value, js, id);
    }
    if (!js) ta.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 250); });
    else left.querySelector(".live-run").addEventListener("click", render);
    ta.addEventListener("keydown", e => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && js) { e.preventDefault(); render(); return; }
      if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        ta.setRangeText("  ", ta.selectionStart, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input"));
      } else if (e.key === "Escape") {
        ta.blur();   // so Tab can leave the editor again
      }
    });

    const waiting = () => {
      ran = false; logs = [];
      iframe.srcdoc = "<!-- not run yet -->";
      if (out) out.innerHTML = '<div class="info">Press ▶ Run to run the code.</div>';
    };
    const reset = () => {
      ta.value = start;
      if (ansBox) { ansBox.querySelector("div").hidden = true; ansBox.querySelector("button").textContent = "Show an answer"; }
      if (js && box.hasAttribute("data-manual")) waiting(); else render();
    };
    if (typeof addReset === "function" && box.closest(".activity") && !box.closest(".activity").querySelector(".reset")) addReset(box, reset);
    if (js && box.hasAttribute("data-manual")) waiting(); else render();
  }

  document.querySelectorAll(".live").forEach(build);
})();
