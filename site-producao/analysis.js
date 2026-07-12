requireAge();

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

showDiagnosis();

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

  const diagnosisIntroSuffix = isCasal
    ? ", o diagnóstico de vocês está pronto."
    : ", o seu diagnóstico está pronto.";

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
        <strong id="diag-nome"></strong><span id="diag-intro-suffix"></span>
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

      <div class="pricing-cards">
        <div class="pricing-card pricing-card-featured">
          <span class="badge pricing-card-badge">Melhor Custo-Benefício</span>
          <span class="pricing-card-label">Plano Anual</span>
          <span class="pricing-card-price">R$ 297,00<span class="pricing-card-period">/ano</span></span>
          <a href="https://pay.cakto.com.br/wxwt4uw" target="_blank" id="checkout-btn-annual"
             class="btn btn-primary pricing-card-btn">
            Desbloquear plano anual
          </a>
        </div>

        <div class="pricing-card">
          <span class="pricing-card-label">Plano Mensal</span>
          <span class="pricing-card-price">R$ 29,90<span class="pricing-card-period">/mês</span></span>
          <a href="https://pay.cakto.com.br/ind7nbo_944530" target="_blank" id="checkout-btn-monthly"
             class="btn btn-secondary pricing-card-btn">
            Desbloquear plano mensal
          </a>
        </div>
      </div>
    </div>
  `;

  document.getElementById("diag-nome").textContent = nome;
  document.getElementById("diag-intro-suffix").textContent = diagnosisIntroSuffix;
}
