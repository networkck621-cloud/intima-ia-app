// Estado compartilhado do app, salvo em localStorage.
const STORAGE_KEY = "intimaIA";

const defaultState = {
  ageConfirmed: false,
  status: null, // "solteira" | "relacionamento"
  gender: null, // "mulher" | "homem" | "neutro"
  segment: null, // ex: "mulher_relacionamento"
  termometro: null,
  dor: null,
  fonte: null,
  vergonha: null,
  pergunta: null,
  gap: null,
  nome: null,
  subscribed: false,
  plan: null,
  partnerCode: null,
  chatMessages: [], // histórico da conversa do Chat, pra sobreviver à troca de abas
  theme: "roxo", // "roxo" | "rosa" | "verde" | "azul"
  userContext: null, // "Masculino" | "Feminino" | "Casal" | "Neutro" — setado no Quiz, lido pelo Quiz e pela IA
  pilar: null, // "comunicacao" | "conexao" | "sexualidade" — pilar principal escolhido no Quiz
  relStatus: null, // "solteiro" | "conhecendo" | "namorando_casado" — filtro que ramifica o quiz
  qualidade_tempo: null,
  conflito: null,
  autoconfianca: null, // substitui qualidade_tempo para solteiro/conhecendo
  desafio_conexao: null, // substitui conflito para solteiro/conhecendo
  expressao: null,
};

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch (e) {
    return { ...defaultState };
  }
}

function setState(patch) {
  const current = getState();
  const next = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

// "Eu e meu parceiro(a)" pula a pergunta de gênero e vira o segmento "casal"
// (banco de perguntas próprio, em content.js). "Só pra mim" sempre pergunta gênero.
function computeSegment(state) {
  if (state.status === "relacionamento") return "casal";
  const g = state.gender === "homem" ? "homem" : state.gender === "mulher" ? "mulher" : "neutro";
  return `${g}_solteiro`;
}

const SEGMENT_LABELS = {
  mulher_solteiro: "mulheres solteiras",
  mulher_relacionamento: "mulheres em relacionamento",
  homem_solteiro: "homens solteiros",
  homem_relacionamento: "homens em relacionamento",
  neutro_solteiro: "pessoas solteiras",
  neutro_relacionamento: "pessoas em relacionamento",
  casal: "casais",
};

const THEMES = ["roxo", "rosa", "verde", "azul"];

// Aplica a classe de tema no <body>. Roda automaticamente no final deste arquivo,
// e como state.js é carregado em todas as páginas, a troca de tema é global
// sem precisar tocar nas outras telas.
function applyTheme(state) {
  const theme = THEMES.includes(state.theme) ? state.theme : "roxo";
  THEMES.forEach((t) => document.body.classList.remove(`tema-${t}`));
  document.body.classList.add(`tema-${theme}`);
}

function requireAge() {
  const st = getState();
  if (!st.ageConfirmed) {
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

function requireSubscription() {
  const st = getState();
  if (!st.subscribed) {
    window.location.href = "/paywall.html";
    return false;
  }
  return true;
}

const NAV_ICONS = {
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
  perfil:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
};

// App simplificado pra só Chat + Perfil — Ideia, Casal e Conteúdo saíram da
// navegação (arquivos seguem no servidor, só não são mais alcançáveis pelo menu).
function renderBottomNav(active) {
  const items = [
    { id: "chat", href: "/app.html", label: "Chat", icon: NAV_ICONS.chat },
    { id: "perfil", href: "/perfil.html", label: "Perfil", icon: NAV_ICONS.perfil },
  ];

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.innerHTML = items
    .map(
      (item) => `
      <a href="${item.href}" class="nav-item ${item.id === active ? "active" : ""}">
        <span class="nav-icon">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
      </a>`
    )
    .join("");
  document.body.appendChild(nav);

  // Conteúdo real só aparece (fade suave) quando chegamos aqui — ou seja,
  // depois que a checagem de acesso já liberou a tela (otimista ou confirmada).
  const appEl = document.querySelector(".app");
  if (appEl) appEl.classList.add("app-ready");
}

applyTheme(getState());
