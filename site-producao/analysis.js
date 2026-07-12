requireAge();

const LOADING_MESSAGES = [
  "Analisando seu perfil para traçar o melhor plano de ação...",
  "Identificando seu pilar principal...",
  "Personalizando sua jornada de transformação...",
];

const PILAR_LABELS = {
  comunicacao: "Comunicação",
  conexao: "Conexão Emocional",
  sexualidade: "Sexualidade",
};

const PILAR_ICONS = { comunicacao: "💬", conexao: "🤝", sexualidade: "🔥" };

function findLabel(list, id) {
  const found = (list || []).find((o) => o.id === id);
  return found ? found.label.toLowerCase() : "um bloqueio em comum";
}

const root = document.getElementById("analysis-root");
const messageEl = document.getElementById("loading-message");
const barFill = document.getElementById("bar-fill");

let msgIndex = 0;
const msgInterval = setInterval(() => {
  msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
  messageEl.style.opacity = "0";
  setTimeout(() => {
    messageEl.textContent = LOADING_MESSAGES[msgIndex];
    messageEl.style.opacity = "1";
  }, 150);
}, 800);

setTimeout(() => {
  clearInterval(msgInterval);
  showDiagnosis();
}, 2600);

function showDiagnosis() {
  const state = getState();
  const segment = state.segment || "neutro_solteiro";
  const isCasal = segment === "casal";
  const pilar = state.pilar || null;
  const pilarLabel = pilar ? PILAR_LABELS[pilar] : null;
  const pilarIcon = pilar ? PILAR_ICONS[pilar] : "💡";
  const dorList = isCasal ? DOR_OPTIONS_CASAL : DOR_OPTIONS[segment];
  const dorLabel = findLabel(dorList, state.dor);
  const nome = state.nome || "Você";

  const diagnosisIntro = isCasal
    ? `<strong>${nome}</strong>, o diagnóstico de vocês está pronto.`
    : `<strong>${nome}</strong>, o seu diagnóstico está pronto.`;

  const diagnosisBody = pilarLabel
    ? `O pilar que mais precisa de atenção agora é <strong>${pilarIcon} ${pilarLabel}</strong>.
       A dor principal identificada: <em>${dorLabel}</em>.`
    : `A dor principal identificada foi: <em>${dorLabel}</em>.`;

  const diagnosisFim = isCasal
    ? "Isso não é falta de esforço, é falta de direcionamento. A Intima IA vai traçar um plano de ação personalizado só para vocês."
    : "Isso não é falta de esforço, é falta de direcionamento. A Intima IA vai traçar um plano de ação personalizado só para você.";

  root.innerHTML = `
    <div class="reveal-card" style="animation-delay: 0s;">
      <div class="reveal-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.7 8.3L20 10L13.7 11.7L12 18L10.3 11.7L4 10L10.3 8.3L12 2Z" fill="currentColor"/>
        </svg>
      </div>
      <span class="badge">Seu Diagnóstico</span>
    </div>

    <div class="reveal-card" style="animation-delay: 0.25s;">
      <div class="diagnosis-card gradient-border">
        ${diagnosisIntro}
        <br /><br />
        ${diagnosisBody}
        <br /><br />
        ${diagnosisFim}
      </div>
    </div>

    <div class="reveal-card" style="animation-delay: 0.5s;">
      <p class="subtitle" style="font-size: 14px;">
        Desbloqueie a Intima IA e tenha acesso ao seu plano de ação personalizado.
      </p>
      <a href="https://pay.cakto.com.br/ind7nbo_944530" target="_blank" class="btn btn-primary" id="checkout-btn"
         style="margin-top: 10px; text-decoration: none;">
        Desbloquear por R$ 29,90/mês
      </a>
    </div>
  `;
}
