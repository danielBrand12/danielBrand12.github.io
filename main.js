(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Language & theme ---------- */
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  let lang = store.get("lang") || ((navigator.language || "es").startsWith("en") ? "en" : "es");
  const setLang = (l) => {
    lang = l;
    root.classList.remove("lang-es", "lang-en");
    root.classList.add(`lang-${l}`);
    root.lang = l;
    store.set("lang", l);
    renderArch();
    restartTyping();
  };
  const setTheme = (t) => { root.dataset.theme = t; store.set("theme", t); };
  setTheme(store.get("theme") || "dark");
  $("#langBtn").addEventListener("click", () => setLang(lang === "es" ? "en" : "es"));
  $("#themeBtn").addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Typing roles ---------- */
  const roles = {
    es: ["Ingeniero de software", "Sistemas agénticos con LangGraph + MCP", "Arquitecto cloud en AWS y GCP", "Evaluación y seguridad de LLMs", "Docente de computación en la nube"],
    en: ["Software Engineer", "Agentic systems with LangGraph + MCP", "Cloud architect on AWS & GCP", "LLM evaluation & safety", "Cloud computing instructor"],
  };
  const typedEl = $("#typed");
  let typingTimer;
  function restartTyping() {
    clearTimeout(typingTimer);
    const list = roles[lang];
    if (reduce) { typedEl.textContent = list[0]; return; }
    let i = 0, j = 0, del = false;
    const tick = () => {
      const word = list[i];
      typedEl.textContent = word.slice(0, j);
      if (!del && j < word.length) { j++; typingTimer = setTimeout(tick, 55); }
      else if (!del) { del = true; typingTimer = setTimeout(tick, 1700); }
      else if (j > 0) { j--; typingTimer = setTimeout(tick, 25); }
      else { del = false; i = (i + 1) % list.length; typingTimer = setTimeout(tick, 300); }
    };
    tick();
  }

  /* ---------- Architecture pipeline ---------- */
  const arch = {
    es: [
      ["Contrato primero", "Esquemas de entrada y salida, y un puerto hacia el sistema que llama al agente. Lo que no está en el contrato no existe."],
      ["Grafo de turno", "Un nodo principal con salida estructurada, clasificación de errores del modelo y un proveedor de respaldo si el primero falla."],
      ["Trabajo durable", "Lo que no debe vivir en la petición HTTP pasa a una cola y a un worker que ejecuta el mismo caso de uso que la API."],
      ["Conocimiento recuperable", "Índices con metadata para filtrar, reordenar y marcar ejemplos few-shot, editables sin reindexar todo."],
      ["Seguridad aparte del código", "Políticas de modelo compartidas, consumidas por identificador, más evaluación automática de toxicidad y relevancia."],
      ["Operación", "Healthchecks, logs por turno, trazas, contenedor sin root y un pipeline que publica la imagen."],
    ],
    en: [
      ["Contract first", "Input and output schemas, plus a port toward the system that calls the agent. If it's not in the contract, it doesn't exist."],
      ["Turn graph", "One main node with structured output, model-error classification and a fallback provider if the first one fails."],
      ["Durable work", "Anything that shouldn't live in the HTTP request goes to a queue and a worker running the same use case as the API."],
      ["Retrievable knowledge", "Indexes with metadata to filter, rerank and tag few-shot examples, editable without a full reindex."],
      ["Safety outside the code", "Shared model policies consumed by ID, plus automated toxicity and relevance evaluation."],
      ["Operations", "Healthchecks, per-turn logs, traces, non-root containers and a pipeline that publishes the image."],
    ],
  };
  let archIdx = 0;
  const archDetail = $("#archDetail");
  function renderArch() {
    const [t, d] = arch[lang][archIdx];
    archDetail.innerHTML = `<span class="big-n">0${archIdx + 1}</span><h4>${t}</h4><p>${d}</p>`;
    archDetail.classList.remove("swap"); void archDetail.offsetWidth; archDetail.classList.add("swap");
  }
  $$(".node").forEach((n) => n.addEventListener("click", () => {
    $$(".node").forEach((x) => x.classList.toggle("active", x === n));
    archIdx = +n.dataset.i; renderArch();
  }));

  /* ---------- Reveal on scroll + counters ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const delay = (el.dataset.d = el.dataset.d || [...el.parentElement.children].indexOf(el) % 6 * 70);
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add("in");
      $$(".count", el).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));
  function countUp(el) {
    const to = +el.dataset.to, suf = el.dataset.suffix || "";
    if (reduce) { el.textContent = to + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$(".nav-links a");
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("section[id]").forEach((s) => secIO.observe(s));

  /* ---------- Spotlight + tilt ---------- */
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest?.(".spot");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, { passive: true });
  if (!reduce && matchMedia("(hover: hover)").matches) {
    const tilt = (el, max) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    };
    $$(".tilt").forEach((el) => tilt(el, 6));
    tilt($("#photoCard"), 10);
  }

  /* ---------- Project filters ---------- */
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#filters .chip").forEach((c) => c.classList.toggle("active", c === b));
    const f = b.dataset.f;
    $$("#repos .repo").forEach((r) => r.classList.toggle("hide", f !== "all" && r.dataset.cat !== f));
  });

  /* ---------- Copy email ---------- */
  const toast = $("#toast");
  const showToast = (msg) => { toast.textContent = msg; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1800); };
  $("#copyEmail").addEventListener("click", async (e) => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); showToast(lang === "es" ? "Email copiado ✓" : "Email copied ✓"); }
    catch { location.href = `mailto:${email}`; }
  });

  /* ---------- Terminal ---------- */
  const body = $("#termBody"), input = $("#termIn"), form = $("#termForm");
  const print = (html, cls = "") => {
    const p = document.createElement("div"); p.className = `ln ${cls}`; p.innerHTML = html; body.appendChild(p);
    body.scrollTop = body.scrollHeight;
  };
  const T = (es, en) => (lang === "es" ? es : en);
  const cmds = {
    help: () => T(
      `<span class="m">comandos disponibles:</span>\n  <span class="k">whoami</span>      quién soy\n  <span class="k">skills</span>      stack técnico\n  <span class="k">experience</span>  trayectoria\n  <span class="k">projects</span>    repos destacados\n  <span class="k">contact</span>     cómo encontrarme\n  <span class="k">cv</span>          descargar hoja de vida\n  <span class="k">lang</span>        cambiar idioma (es/en)\n  <span class="k">theme</span>       claro / oscuro\n  <span class="k">clear</span>       limpiar`,
      `<span class="m">available commands:</span>\n  <span class="k">whoami</span>      who I am\n  <span class="k">skills</span>      tech stack\n  <span class="k">experience</span>  career\n  <span class="k">projects</span>    featured repos\n  <span class="k">contact</span>     how to reach me\n  <span class="k">cv</span>          download resume\n  <span class="k">lang</span>        switch language (es/en)\n  <span class="k">theme</span>       light / dark\n  <span class="k">clear</span>       clear screen`),
    whoami: () => T(
      `<span class="k">Daniel Brand Taborda</span> — Ingeniero de software · IA · Cloud\n<span class="m">ubicación:</span> Medellín, Colombia\n<span class="m">foco:</span> sistemas agénticos, extracción documental, evaluación de LLMs, FinOps\n<span class="m">idiomas:</span> español (nativo), inglés (B2)`,
      `<span class="k">Daniel Brand Taborda</span> — Software Engineer · AI · Cloud\n<span class="m">location:</span> Medellín, Colombia\n<span class="m">focus:</span> agentic systems, document extraction, LLM evaluation, FinOps\n<span class="m">languages:</span> Spanish (native), English (B2)`),
    skills: () =>
      `<span class="b">ai_backend</span>   Python · FastAPI · LangGraph · LangChain · Strands · MCP · RAG · Celery\n<span class="b">cloud</span>        AWS (Bedrock, S3, Textract, ECS, Lambda) · GCP (Vertex AI, Cloud Run) · K8s · Terraform\n<span class="b">data</span>         PostgreSQL · DynamoDB · OpenSearch · Redis · pgvector\n<span class="b">quality</span>      Pytest · Ragas · Promptfoo · LangSmith`,
    experience: () => T(
      `<span class="v">2025–2026</span>  Ingeniero de software  <span class="k">@ itti</span>\n<span class="v">2025</span>       Ingeniero de software  <span class="k">@ 150 POR CIENTO</span>\n<span class="v">2022–2025</span>  Desarrollador backend  <span class="k">@ guane Enterprises</span>`,
      `<span class="v">2025–2026</span>  Software Engineer  <span class="k">@ itti</span>\n<span class="v">2025</span>       Software Engineer  <span class="k">@ 150 POR CIENTO</span>\n<span class="v">2022–2025</span>  Backend Developer  <span class="k">@ guane Enterprises</span>`),
    projects: () => {
      setTimeout(() => $("#projects").scrollIntoView({ behavior: "smooth" }), 600);
      return `FastAPI-Celery-NotificationService · sentiment-analysis (BiLSTM, 86.6%) · space-objects-classification (0.96)\n<span class="m">${T("→ desplazando a proyectos…", "→ scrolling to projects…")}</span>`;
    },
    contact: () =>
      `<span class="m">email</span>     <a href="mailto:danielbrandtaborda@gmail.com">danielbrandtaborda@gmail.com</a>\n<span class="m">linkedin</span>  <a href="https://www.linkedin.com/in/daniel-brand-taborda/" target="_blank" rel="noopener">/in/daniel-brand-taborda</a>\n<span class="m">github</span>    <a href="https://github.com/danielBrand12" target="_blank" rel="noopener">@danielBrand12</a>\n<span class="m">whatsapp</span>  <a href="https://wa.me/573023857796" target="_blank" rel="noopener">${T("escríbeme", "message me")}</a>`,
    cv: () => {
      const href = lang === "es" ? "assets/cv-daniel-brand-taborda-es.pdf" : "assets/resume-daniel-brand-taborda-en.pdf";
      return T(`<span class="k">✓</span> <a href="${href}" download>descargar hoja de vida (PDF)</a>`, `<span class="k">✓</span> <a href="${href}" download>download resume (PDF)</a>`);
    },
    lang: (arg) => { setLang(arg === "en" || arg === "es" ? arg : lang === "es" ? "en" : "es"); return T("idioma: español", "language: english"); },
    theme: () => { setTheme(root.dataset.theme === "dark" ? "light" : "dark"); return `theme: ${root.dataset.theme}`; },
    clear: () => { body.innerHTML = ""; return null; },
    sudo: (arg) => arg && arg.startsWith("hire")
      ? T(`<span class="k">[sudo]</span> acceso concedido. Escríbeme: <a href="mailto:danielbrandtaborda@gmail.com">danielbrandtaborda@gmail.com</a> 🚀`, `<span class="k">[sudo]</span> access granted. Reach me at <a href="mailto:danielbrandtaborda@gmail.com">danielbrandtaborda@gmail.com</a> 🚀`)
      : T("nice try 😏 prueba: sudo hire-me", "nice try 😏 try: sudo hire-me"),
    ls: () => `about/  work/  experience/  stack/  projects/  contact/  <span class="k">cv.pdf</span>`,
  };
  const aliases = { "?": "help", ayuda: "help", quien: "whoami", habilidades: "skills", experiencia: "experience", proyectos: "projects", contacto: "contact", hv: "cv", resume: "cv" };
  const history = []; let hIdx = 0;
  function run(raw) {
    const line = raw.trim(); if (!line) return;
    history.push(line); hIdx = history.length;
    print(escapeHtml(line), "cmd");
    const [c0, ...rest] = line.split(/\s+/);
    const c = aliases[c0.toLowerCase()] || c0.toLowerCase();
    const fn = cmds[c];
    const out = fn ? fn(rest.join(" ").toLowerCase()) : T(`comando no encontrado: ${escapeHtml(c0)} — escribe <span class="k">help</span>`, `command not found: ${escapeHtml(c0)} — type <span class="k">help</span>`);
    if (out) print(out);
  }
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  form.addEventListener("submit", (e) => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hIdx > 0) { input.value = history[--hIdx]; e.preventDefault(); }
    else if (e.key === "ArrowDown") { hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; e.preventDefault(); }
    else if (e.key === "Tab") {
      const m = Object.keys(cmds).find((k) => k.startsWith(input.value.toLowerCase()) && input.value);
      if (m) { input.value = m; e.preventDefault(); }
    }
  });
  $("#terminal").addEventListener("click", (e) => { if (!e.target.closest("a,button")) input.focus({ preventScroll: true }); });
  const sug = $("#termSuggest");
  ["whoami", "skills", "experience", "projects", "contact", "cv", "sudo hire-me"].forEach((c) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = c;
    b.addEventListener("click", () => run(c)); sug.appendChild(b);
  });
  // Boot sequence
  const boot = () => {
    print(`<span class="m">${T("conectando con el agente de Daniel…", "connecting to Daniel's agent…")}</span>`);
    setTimeout(() => run("whoami"), reduce ? 0 : 500);
    setTimeout(() => print(`<span class="m">${T("escribe <span class=\"k\">help</span> o toca un comando ↓", "type <span class=\"k\">help</span> or tap a command ↓")}</span>`), reduce ? 0 : 900);
  };

  /* ---------- Background: animated agent graph ---------- */
  const cvs = $("#graph"), ctx = cvs.getContext("2d");
  let W, H, DPR, nodes = [], pulses = [], mouse = { x: -9999, y: -9999 }, raf;
  const LINK = 150;
  function resize() {
    DPR = Math.min(2, devicePixelRatio || 1);
    W = cvs.width = innerWidth * DPR; H = cvs.height = innerHeight * DPR;
    const count = Math.round(Math.min(90, (innerWidth * innerHeight) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25 * DPR, vy: (Math.random() - 0.5) * 0.25 * DPR,
      r: (Math.random() * 1.6 + 0.8) * DPR, hub: Math.random() < 0.12,
    }));
  }
  const colors = () => {
    const cs = getComputedStyle(root);
    return { a: cs.getPropertyValue("--accent").trim(), b: cs.getPropertyValue("--accent-2").trim(), light: root.dataset.theme === "light" };
  };
  let col = colors();
  new MutationObserver(() => (col = colors())).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  function frame() {
    ctx.clearRect(0, 0, W, H);
    const L = LINK * DPR, mx = mouse.x * DPR, my = mouse.y * DPR;
    const baseA = col.light ? 0.16 : 0.13;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dx = mx - n.x, dy = my - n.y, d = Math.hypot(dx, dy);
      if (d < 180 * DPR) { n.x += dx * 0.004; n.y += dy * 0.004; }
    }
    ctx.lineWidth = DPR;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < L) {
          const near = Math.hypot((a.x + b.x) / 2 - mx, (a.y + b.y) / 2 - my) < 200 * DPR;
          ctx.strokeStyle = near ? col.a : col.b;
          ctx.globalAlpha = (1 - d / L) * (near ? 0.55 : baseA);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (!reduce && pulses.length < 14 && Math.random() < 0.0004) pulses.push({ a, b, t: 0 });
        }
      }
    }
    ctx.globalAlpha = 1;
    for (const n of nodes) {
      ctx.fillStyle = n.hub ? col.a : col.b;
      ctx.globalAlpha = n.hub ? 0.8 : 0.45;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.hub ? n.r * 1.8 : n.r, 0, 7); ctx.fill();
    }
    // message pulses travelling along edges
    pulses = pulses.filter((p) => (p.t += 0.012) < 1);
    ctx.fillStyle = col.a;
    for (const p of pulses) {
      const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.globalAlpha = Math.sin(p.t * Math.PI);
      ctx.shadowColor = col.a; ctx.shadowBlur = 12 * DPR;
      ctx.beginPath(); ctx.arc(x, y, 2.2 * DPR, 0, 7); ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }
  addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); reduce ? frame1() : frame(); });
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) frame();
  });
  const frame1 = () => { frame(); cancelAnimationFrame(raf); };

  /* ---------- Init ---------- */
  setLang(lang);
  resize();
  reduce ? frame1() : frame();
  boot();
})();
