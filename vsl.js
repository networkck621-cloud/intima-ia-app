if (!requireAge()) {
  // redirecionado pro index dentro de requireAge()
}

// Duração fixa da transição — a barra não depende do vídeo carregar/tocar,
// só do tempo real decorrido (via performance.now()), pra não travar a
// pessoa numa tela quebrada se o arquivo de vídeo falhar.
const VSL_DURATION_MS = 189000; // 3min09s — duração real da VSL

const state = getState();
const segment = state.segment || "neutro_solteiro";
const gender = getSegmentBaseGender(segment);

const headlineEl = document.getElementById("vsl-headline");
const subtitleEl = document.getElementById("vsl-subtitle");
const fillEl = document.getElementById("vsl-progress-fill");
const labelEl = document.getElementById("vsl-progress-label");

headlineEl.textContent = VSL_HOOKS[segment] || VSL_HOOKS.neutro_solteiro;
subtitleEl.textContent = VSL_VILAO[gender] || VSL_VILAO.neutro;

const startTime = performance.now();
let redirected = false;

function tick(now) {
  const elapsed = now - startTime;
  const pct = Math.min(100, Math.floor((elapsed / VSL_DURATION_MS) * 100));

  fillEl.style.width = `${pct}%`;
  labelEl.textContent = `${pct}%`;

  if (pct >= 100) {
    if (!redirected) {
      redirected = true;
      window.location.href = "/analysis.html";
    }
    return;
  }

  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);

// ── Toque para ouvir ─────────────────────────────────────────────────────
// Autoplay só funciona mudo (exigência dos navegadores). O player fica
// mudo até a pessoa tocar na camada sobre o vídeo; desmutar usa a API do
// YouTube diretamente no player já em execução — não recarrega o iframe,
// então não desincroniza da barra de progresso.
const unmuteLayer = document.getElementById("vsl-unmute-layer");
const unmuteHint = document.getElementById("vsl-unmute-hint");
let ytPlayer = null;
let pendingUnmute = false;

function unmuteNow() {
  if (!ytPlayer || typeof ytPlayer.unMute !== "function") {
    pendingUnmute = true; // API ainda não carregou; aplica assim que ficar pronta
    return;
  }
  ytPlayer.unMute();
  ytPlayer.setVolume(100);
  ytPlayer.playVideo();
}

// Nome exigido pela YouTube IFrame API — precisa ser uma função global.
function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("vsl-video", {
    events: {
      onReady: function () {
        if (pendingUnmute) unmuteNow();
      },
    },
  });
}

if (unmuteLayer) {
  unmuteLayer.addEventListener("click", () => {
    unmuteNow();
    if (unmuteHint) unmuteHint.classList.add("hidden");
  });
}
