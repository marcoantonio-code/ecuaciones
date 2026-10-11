/* =========================================================
   CONFIGURACIÓN
   Pega aquí el enlace de tu video de YouTube (público u oculto).
   Sirven formatos como:
     https://www.youtube.com/watch?v=XXXXXXXXXXX
     https://youtu.be/XXXXXXXXXXX
     https://www.youtube.com/shorts/XXXXXXXXXXX
   ========================================================= */
const YOUTUBE_URL = "https://youtu.be/wsyOzRcLfT0";

/* Página del video (antepenúltima). Índice base 0. */
const PAGE_W = 500, PAGE_H = 700;

(function () {
  const bookEl = document.getElementById("book");
  const pages = Array.from(bookEl.querySelectorAll(".page"));
  const TOTAL = pages.length;
  const VIDEO_INDEX = TOTAL - 3; // antepenúltima

  /* ---------- Portadas generativas ---------- */
  function drawCover(canvas, seed) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    ctx.fillStyle = "#0b1e3f"; ctx.fillRect(0, 0, W, H);

    // halo
    const cx = W * 0.72, cy = H * 0.38;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, W * 0.75);
    g.addColorStop(0, "rgba(31,111,235,0.6)");
    g.addColorStop(0.5, "rgba(24,184,212,0.18)");
    g.addColorStop(1, "rgba(11,30,63,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // campo de caracteres hexadecimales
    ctx.font = "500 18px 'Montserrat', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const hex = "0123456789ABCDEF";
    for (let y = 30; y < H; y += 34) {
      for (let x = 24; x < W; x += 28) {
        const d = Math.hypot(x - cx, y - cy) / (W * 0.9);
        const a = Math.max(0, 0.32 - d * 0.32) * (0.4 + rnd() * 0.8);
        if (a < 0.02) continue;
        ctx.fillStyle = `rgba(238,240,247,${a.toFixed(3)})`;
        ctx.fillText(hex[Math.floor(rnd() * 16)], x, y);
      }
    }

    // anillos tipo dial de cerradura
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const r = 120 + i * 70;
      ctx.strokeStyle = i === 2 ? "rgba(245,184,61,0.75)" : "rgba(238,240,247,0.14)";
      ctx.setLineDash(i % 2 ? [3, 14] : []);
      ctx.beginPath();
      const start = rnd() * Math.PI * 2;
      ctx.arc(cx, cy, r, start, start + Math.PI * (1.2 + rnd() * 0.7));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // marcas del dial
    ctx.strokeStyle = "rgba(238,240,247,0.35)";
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, r1 = 255, r2 = i % 5 ? 266 : 280;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    // ojo de cerradura
    ctx.fillStyle = "rgba(245,184,61,0.9)";
    ctx.beginPath(); ctx.arc(cx, cy - 14, 22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy); ctx.lineTo(cx + 18, cy + 50); ctx.lineTo(cx - 18, cy + 50); ctx.closePath(); ctx.fill();

    // viñeta inferior para legibilidad
    const v = ctx.createLinearGradient(0, H * 0.45, 0, H);
    v.addColorStop(0, "rgba(11,30,63,0)"); v.addColorStop(1, "rgba(11,30,63,0.92)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
  const drawAllCovers = () => document.querySelectorAll(".cover-canvas").forEach((c, i) => drawCover(c, 7919 + i * 104729));
  drawAllCovers();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAllCovers);

  /* ---------- YouTube ---------- */
  function parseYouTubeId(url) {
    if (!url) return null;
    url = url.trim();
    if (/^[\w-]{11}$/.test(url)) return url;
    const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  const frame = document.getElementById("videoFrame");
  const ytLink = document.getElementById("ytLink");
  let iframe = null;

  // El reproductor de YouTube se coloca directamente en la página (sin casillas ni pasos extra)
  function renderVideo(id) {
    frame.innerHTML = "";
    iframe = null;
    if (!id) {
      ytLink.hidden = true;
      frame.innerHTML = '<div class="yt-setup"><p>Video de la presentación oral</p></div>';
      return;
    }
    ytLink.href = "https://www.youtube.com/watch?v=" + id;
    ytLink.hidden = false;
    iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    iframe.title = "Presentación oral — YouTube";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    frame.appendChild(iframe);
  }

  function pauseVideo() {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: "pauseVideo", args: "" }), "*");
    }
  }

  renderVideo(parseYouTubeId(YOUTUBE_URL));

  // Evita que la revista se pase de página al tocar el reproductor o el formulario
  document.querySelectorAll(".no-flip").forEach((el) => {
    ["mousedown", "touchstart", "pointerdown"].forEach((ev) =>
      el.addEventListener(ev, (e) => e.stopPropagation(), { passive: true })
    );
  });

  /* ---------- Sonido de página (sintetizado) ---------- */
  let soundOn = true, audioCtx = null;
  function flipSound() {
    if (!soundOn) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const dur = 0.35, n = audioCtx.sampleRate * dur;
      const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) {
        const t = i / n;
        d[i] = (Math.random() * 2 - 1) * Math.pow(Math.sin(Math.PI * t), 2) * (1 - t);
      }
      const src = audioCtx.createBufferSource(); src.buffer = buf;
      const bp = audioCtx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 0.6;
      const gain = audioCtx.createGain(); gain.gain.value = 0.22;
      src.connect(bp).connect(gain).connect(audioCtx.destination);
      src.start();
    } catch (e) {}
  }

  /* ---------- Libro ---------- */
  const pageFlip = new St.PageFlip(bookEl, {
    width: PAGE_W,
    height: PAGE_H,
    size: "stretch",
    minWidth: 240,
    maxWidth: 1000,
    minHeight: 336,
    maxHeight: 1400,
    showCover: true,
    maxShadowOpacity: 0.45,
    flippingTime: 900,
    mobileScrollSupport: false,
    usePortrait: true,
    autoSize: true,
  });
  pageFlip.loadFromHTML(pages);

  // Ajusta el tamaño del libro al espacio disponible manteniendo la proporción
  const wrap = document.querySelector(".book-wrap");
  function fitBook() {
    const availW = wrap.clientWidth, availH = wrap.clientHeight;
    const portrait = availW < 760;
    const spreadRatio = (portrait ? PAGE_W : PAGE_W * 2) / PAGE_H;
    let w = availW, h = w / spreadRatio;
    if (h > availH) { h = availH; w = h * spreadRatio; }
    bookEl.style.width = Math.floor(w) + "px";
    bookEl.style.height = Math.floor(h) + "px";
  }

  function updateScale() {
    const rect = pageFlip.getBoundsRect && pageFlip.getBoundsRect();
    const pw = rect ? rect.pageWidth : bookEl.clientWidth / 2;
    if (pw > 0) document.documentElement.style.setProperty("--k", (pw / PAGE_W).toFixed(4));
  }

  const info = document.getElementById("pageInfo");
  function updateInfo() {
    const i = pageFlip.getCurrentPageIndex();
    const portrait = pageFlip.getOrientation() === "portrait";
    let label;
    if (portrait || i === 0 || i === TOTAL - 1) label = `${i + 1} / ${TOTAL}`;
    else {
      const left = i % 2 === 1 ? i : i - 1;
      label = `${left + 1}–${Math.min(left + 2, TOTAL)} / ${TOTAL}`;
    }
    info.textContent = label;
  }

  pageFlip.on("init", () => { updateScale(); updateInfo(); });
  pageFlip.on("changeOrientation", () => { updateScale(); updateInfo(); });
  pageFlip.on("flip", () => { updateInfo(); });
  pageFlip.on("changeState", (e) => {
    if (e.data === "flipping" || e.data === "user_fold") { pauseVideo(); }
    if (e.data === "flipping") flipSound();
  });

  fitBook();
  pageFlip.update();
  updateScale(); updateInfo();

  let rT;
  window.addEventListener("resize", () => {
    clearTimeout(rT);
    rT = setTimeout(() => { fitBook(); pageFlip.update(); updateScale(); }, 80);
  });

  /* ---------- Controles ---------- */
  document.getElementById("btnPrev").onclick = () => pageFlip.flipPrev();
  document.getElementById("btnNext").onclick = () => pageFlip.flipNext();
  document.getElementById("btnFirst").onclick = () => pageFlip.flip(0);
  document.getElementById("btnLast").onclick = () => pageFlip.flip(TOTAL - 1);
  const btnSound = document.getElementById("btnSound");
  btnSound.onclick = () => { soundOn = !soundOn; btnSound.setAttribute("aria-pressed", String(soundOn)); };
  document.getElementById("btnFull").onclick = () => {
    const el = document.documentElement;
    try {
      if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      else document.exitFullscreen();
    } catch (e) {}
  };

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") pageFlip.flipNext();
    if (e.key === "ArrowLeft" || e.key === "PageUp") pageFlip.flipPrev();
    if (e.key === "Home") pageFlip.flip(0);
    if (e.key === "End") pageFlip.flip(TOTAL - 1);
  });

  // Índice clicable
  document.querySelectorAll(".toc li[data-goto]").forEach((li) => {
    li.addEventListener("mousedown", (e) => e.stopPropagation());
    li.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    li.addEventListener("click", () => pageFlip.flip(parseInt(li.dataset.goto, 10)));
  });

  // Acceso directo: revista.html#video abre en la página del video
  if (location.hash === "#video") setTimeout(() => pageFlip.flip(VIDEO_INDEX), 400);
})();
