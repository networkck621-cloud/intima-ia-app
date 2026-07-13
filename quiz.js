if (!requireAge()) {
  // redirecionado pro index dentro de requireAge()
}

// SVGs usados nas escalas progressivas de ícones.
const ICON_SVGS = {
  heart: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5 0.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/></svg>`,
};

// Flexiona "pronto" conforme o userContext gravado no quiz — usado no
// diagnóstico/conclusão pra nunca soar genérico ou errado de gênero/número.
// Fallback (Neutro ou ausente) usa a forma escrita neutra "pronto(a)" — o
// mesmo padrão já usado em outras perguntas do quiz — em vez de assumir
// masculino por padrão.
function flexPronto(userContext) {
  if (userContext === "Feminino") return "pronta";
  if (userContext === "Masculino") return "pronto";
  if (userContext === "Casal") return "prontos";
  return "pronto(a)";
}

// Monta a lista de perguntas dinamicamente: se a resposta for "Eu e meu parceiro(a)",
// pula a pergunta de gênero e troca os bancos de "dor"/"pergunta" pelos exclusivos de casal.
function buildSteps(state) {
  const isCasal = state.status === "relacionamento";
  const steps = [];

  steps.push({
    key: "status",
    title: "Pra começar: isso é só pra você, ou pra você e seu parceiro(a)?",
    type: "choice",
    options: [
      { id: "solteira", label: "Só pra mim" },
      { id: "relacionamento", label: "Eu e meu parceiro(a)" },
    ],
    onAfter: (s) => {
      // Casal não passa pela pergunta de gênero, então o segmento e o
      // userContext já são definidos aqui.
      if (s.status === "relacionamento") {
        setState({ segment: computeSegment(s), userContext: "Casal" });
      }
    },
  });

  if (!isCasal) {
    const USER_CONTEXT_BY_GENDER = { mulher: "Feminino", homem: "Masculino", neutro: "Neutro" };
    steps.push({
      key: "gender",
      title: "Como você se identifica?",
      type: "choice",
      options: [
        { id: "mulher", label: "👩 Mulher" },
        { id: "homem", label: "👨 Homem" },
        { id: "neutro", label: "Prefiro não dizer" },
      ],
      onAfter: (s) =>
        setState({
          segment: computeSegment(s),
          userContext: USER_CONTEXT_BY_GENDER[s.gender] || "Neutro",
        }),
    });
  }

  steps.push({
    key: "pilar",
    type: "choice",
    title: isCasal ? "Qual área vocês mais querem melhorar agora?" : "Qual área você mais quer melhorar agora?",
    options: [
      { id: "comunicacao", label: "💬 Comunicação — brigas, falta de diálogo, dificuldade de se expressar" },
      { id: "conexao", label: "🤝 Conexão — distância emocional, rotina, frieza, falta de cumplicidade" },
      { id: "sexualidade", label: "🔥 Sexualidade — desejo, prazer, desempenho, autoconhecimento" },
    ],
  });

  // Status de relacionamento — filtra e ramifica o quiz a partir daqui.
  // Casal que respondeu junto já é implicitamente namorando/casado; a pergunta
  // só aparece para quem está respondendo sozinho.
  if (!isCasal) {
    steps.push({
      key: "relStatus",
      type: "choice",
      title: "Qual é o seu status de relacionamento atual?",
      options: [
        { id: "solteiro", label: "💫 Solteiro(a)" },
        { id: "conhecendo", label: "🌱 Conhecendo alguém" },
        { id: "namorando_casado", label: "❤️ Namorando / Casado(a)" },
      ],
    });
  }

  // Branching: quem tem parceiro vê perguntas de relacionamento;
  // quem é solteiro/conhecendo vê perguntas de autoconfiança e conexão nova.
  const comParceiro = isCasal || (state.relStatus === "namorando_casado");

  if (comParceiro) {
    steps.push({
      key: "qualidade_tempo",
      type: "icon-scale",
      icon: "heart",
      title: isCasal
        ? "Como vocês avaliam a qualidade do tempo que passam juntos?"
        : "Como você avalia a qualidade do tempo que passa com seu parceiro(a)?",
      minLabel: "Distante",
      maxLabel: "Conectado(a)",
    });

    steps.push({
      key: "conflito",
      type: "choice",
      title: isCasal
        ? "Quando surgem divergências, como vocês costumam reagir?"
        : "Quando surgem divergências com seu parceiro(a), como vocês costumam reagir?",
      options: [
        { id: "abertura", label: "🗣️ Conversamos abertamente" },
        { id: "evitamos", label: "🤐 Evitamos o assunto" },
        { id: "discussao", label: "😤 Acabamos discutindo" },
      ],
    });
  } else {
    // Solteiro(a) ou conhecendo alguém → autoconfiança e desafios de conexão nova.
    steps.push({
      key: "autoconfianca",
      type: "icon-scale",
      icon: "heart",
      title: "Como você avalia sua confiança quando se trata de se abrir com alguém?",
      minLabel: "Inseguro(a)",
      maxLabel: "Confiante",
    });

    steps.push({
      key: "desafio_conexao",
      type: "choice",
      title: "Quando se trata de conectar com alguém novo, o que mais te desafia?",
      options: [
        { id: "primeiro_passo", label: "🚀 Ter coragem de dar o primeiro passo" },
        { id: "fluir_conversa", label: "💬 Manter a conversa fluindo de forma genuína" },
        { id: "vulnerabilidade", label: "💜 Abrir meu coração e ser vulnerável" },
      ],
    });
  }

  steps.push({
    key: "expressao",
    type: "icon-scale",
    icon: "flame",
    title: isCasal
      ? "O quanto vocês conseguem expressar seus desejos e necessidades com clareza?"
      : "O quanto você consegue expressar seus desejos e necessidades com clareza?",
    minLabel: "Travado(a)",
    maxLabel: "Com clareza",
  });

  steps.push({
    key: "termometro",
    type: "icon-scale",
    icon: "flame",
    title: isCasal ? "Como está a energia sexual entre vocês hoje?" : "Como está a sua energia sexual hoje?",
    minLabel: "Apagada",
    maxLabel: "Incrível",
  });

  steps.push({
    key: "dor",
    type: "choice-dynamic",
    title: isCasal ? "O que mais frustra vocês hoje?" : "O que mais te frustra hoje?",
    optionsFn: (s) =>
      s.status === "relacionamento" ? DOR_OPTIONS_CASAL : DOR_OPTIONS[s.segment] || DOR_OPTIONS.neutro_solteiro,
  });

  steps.push({
    key: "fonte",
    type: "choice",
    title: isCasal ? "De onde vocês aprenderam o que sabem sobre sexo?" : "De onde você aprendeu o que sabe sobre sexo?",
    options: [
      { id: "porno", label: "Pornô" },
      { id: "google", label: "Google" },
      { id: "amigos", label: "Amigos" },
      { id: "ninguem", label: isCasal ? "Ninguém nunca ensinou a gente" : "Ninguém nunca me ensinou nada" },
    ],
  });

  steps.push({
    key: "vergonha",
    type: "choice",
    title: isCasal
      ? "Vocês já tiveram vergonha de falar sobre sexo um com o outro?"
      : "Você já teve vergonha de perguntar algo sobre sexo — pro médico, pro parceiro, ou pra um amigo?",
    options: [
      { id: "varias", label: "Sim, várias vezes" },
      { id: "ja_sim", label: "Já sim" },
      { id: "nunca", label: "Nunca" },
    ],
  });

  steps.push({
    key: "pergunta",
    type: "choice-dynamic",
    title: isCasal
      ? "O que vocês mais gostariam de poder perguntar sem medo de julgamento?"
      : "O que você mais gostaria de poder perguntar sem medo de ser julgado(a)?",
    optionsFn: (s) =>
      s.status === "relacionamento" ? PERGUNTA_OPTIONS_CASAL : PERGUNTA_OPTIONS[s.segment] || PERGUNTA_OPTIONS.neutro_solteiro,
  });

  steps.push({
    key: "gap",
    type: "choice",
    title: isCasal
      ? "Se vocês tivessem uma resposta certeira agora, sem julgamento — isso mudaria a relação de vocês com o sexo?"
      : "Se você tivesse uma resposta certeira agora, sem julgamento — isso mudaria sua relação com o sexo?",
    options: [
      { id: "sim", label: "Sim, completamente" },
      { id: "provavelmente", label: "Provavelmente" },
      { id: "talvez", label: "Talvez" },
    ],
  });

  steps.push({
    key: "nome",
    type: "text",
    title: isCasal ? "Como vocês querem ser chamados(as)?" : "Como você quer ser chamado(a)?",
    placeholder: isCasal ? "Ex: Ana & Pedro" : "Seu nome ou apelido",
  });

  steps.push({
    key: "compromisso",
    type: "choice-dynamic",
    title: (s) => {
      const pronto = flexPronto(s.userContext);
      return isCasal
        ? `Última coisa, ${s.nome || ""}: vocês estão ${pronto} pra parar de ter vergonha de perguntar?`
        : `Última coisa, ${s.nome || ""}: você está ${pronto} pra parar de ter vergonha de perguntar?`;
    },
    optionsFn: (s) => [
      { id: "sim", label: `Sim, estou ${flexPronto(s.userContext)}!` },
      { id: "acho", label: "Acho que sim, vamos lá!" },
    ],
  });

  return steps;
}

let stepIndex = 0;
const root = document.getElementById("quiz-root");
const progressFill = document.getElementById("progress-fill");

function resolveTitle(step, state) {
  return typeof step.title === "function" ? step.title(state) : step.title;
}

function selectOption(step, optionId) {
  setState({ [step.key]: optionId });
  if (step.onAfter) step.onAfter(getState());
  goNext();
}

function renderStep() {
  const state = getState();
  const steps = buildSteps(state);

  if (stepIndex >= steps.length) {
    progressFill.style.width = "100%";
    window.location.href = "/vsl.html";
    return;
  }

  const step = steps[stepIndex];
  progressFill.style.width = `${(stepIndex / steps.length) * 100}%`;

  root.innerHTML = "";

  // Container com animação de entrada — recriado a cada pergunta, então o
  // slide-in roda de novo automaticamente sem precisar forçar reflow.
  const stepWrap = document.createElement("div");
  stepWrap.className = "quiz-step";
  root.appendChild(stepWrap);

  const title = document.createElement("div");
  title.className = "title";
  title.style.fontSize = "20px";
  title.textContent = resolveTitle(step, state);
  stepWrap.appendChild(title);

  if (step.type === "choice" || step.type === "choice-dynamic") {
    const options = step.type === "choice" ? step.options : step.optionsFn(state);
    const list = document.createElement("div");
    list.className = "option-list";
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = opt.image ? "option-btn option-btn-photo" : "option-btn";
      btn.addEventListener("click", () => selectOption(step, opt.id));

      if (opt.image) {
        const bg = document.createElement("div");
        bg.className = "option-btn-bg";
        btn.appendChild(bg);
        preloadImage(opt.image).then((ok) => {
          if (ok) bg.style.backgroundImage = `url(${opt.image})`;
        });
      }

      const label = document.createElement("span");
      label.className = "option-btn-label";
      label.textContent = opt.label;
      btn.appendChild(label);

      list.appendChild(btn);
    });
    stepWrap.appendChild(list);
  }

  if (step.type === "icon-scale") {
    const ICON_COUNT = 5;
    let selectedValue = null;
    const svgHtml = ICON_SVGS[step.icon] || ICON_SVGS.flame;
    const iconBtns = [];

    const row = document.createElement("div");
    row.className = "icon-scale-row";
    stepWrap.appendChild(row);

    const labels = document.createElement("div");
    labels.className = "icon-scale-labels";
    labels.innerHTML = `<span>${step.minLabel}</span><span>${step.maxLabel}</span>`;
    stepWrap.appendChild(labels);

    const continueBtn = document.createElement("button");
    continueBtn.className = "btn btn-primary";
    continueBtn.textContent = "Continuar";
    continueBtn.style.marginTop = "16px";
    continueBtn.disabled = true;
    continueBtn.addEventListener("click", () => {
      if (selectedValue === null) return;
      setState({ [step.key]: selectedValue });
      goNext();
    });

    for (let i = 1; i <= ICON_COUNT; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "icon-scale-btn";
      btn.innerHTML = `<span class="icon-scale-icon-wrap">${svgHtml}</span>`;
      btn.addEventListener("click", () => {
        selectedValue = i;
        iconBtns.forEach((b, idx) => {
          b.classList.remove("active", "filled");
          if (idx + 1 < i) b.classList.add("filled");
          if (idx + 1 === i) b.classList.add("active");
        });
        continueBtn.disabled = false;
      });
      row.appendChild(btn);
      iconBtns.push(btn);
    }

    stepWrap.appendChild(continueBtn);
  }

  if (step.type === "text") {
    const input = document.createElement("input");
    input.className = "text-input";
    input.placeholder = step.placeholder || "";
    input.id = "text-input";
    stepWrap.appendChild(input);

    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = "Continuar";
    btn.style.marginTop = "12px";
    btn.disabled = true; // obrigatório: só libera com 2+ caracteres

    input.addEventListener("input", () => {
      btn.disabled = input.value.trim().length < 2;
    });

    btn.addEventListener("click", () => {
      const val = input.value.trim();
      if (val.length < 2) return;
      setState({ [step.key]: val });
      goNext();
    });
    stepWrap.appendChild(btn);
  }
}

function goNext() {
  stepIndex += 1;
  renderStep();
}

renderStep();
