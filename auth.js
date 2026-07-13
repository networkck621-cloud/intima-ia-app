// auth.js — controle de acesso do Intima IA
//
// Fluxo pra usuários novos:
//   index.html (landing) → quiz.html → analysis.html → Cakto (pagamento) → login.html → app.html (chat)
//
// Fluxo pra usuários que já têm sessão:
//   qualquer página → app.html → chat direto (sem pedir login de novo)
//
// Modelo otimista: se já existe e-mail salvo e validado, libera na hora e
// confirma com o Supabase em paralelo. Só redireciona se a confirmação vier
// NEGATIVA de forma definitiva — null (falha técnica) não desloga o usuário.

const AUTH_EMAIL_KEY = "intimaIA_email";

// Cache de 60s da última checagem positiva — evita bater no Supabase a cada
// troca rápida de aba (Chat ↔ Perfil etc.).
const SUBSCRIBER_CACHE_KEY = "intimaIA_subCheckCache";
const SUBSCRIBER_CACHE_TTL_MS = 60 * 1000;

function readSubscriberCache(email) {
  try {
    const raw = sessionStorage.getItem(SUBSCRIBER_CACHE_KEY);
    if (!raw) return false;
    const cache = JSON.parse(raw);
    return cache.email === email && Date.now() - cache.ts < SUBSCRIBER_CACHE_TTL_MS;
  } catch (e) {
    return false;
  }
}

function writeSubscriberCache(email) {
  try {
    sessionStorage.setItem(SUBSCRIBER_CACHE_KEY, JSON.stringify({ email, ts: Date.now() }));
  } catch (e) {}
}

// true/false = resposta real do Supabase. null = falha técnica (não desloga).
async function checkSubscriber(email) {
  try {
    const res = await fetch("/api/check-subscriber", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Boolean(data.authorized);
  } catch (e) {
    return null;
  }
}

// Pra Perfil (e outras páginas protegidas sem splash própria): libera na hora
// se houver e-mail salvo e revalida em segundo plano.
async function requireActiveSubscriber() {
  const email = (localStorage.getItem(AUTH_EMAIL_KEY) || "").trim().toLowerCase();

  if (!email) {
    window.location.href = "/index.html";
    return false;
  }

  if (readSubscriberCache(email)) return true;

  checkSubscriber(email).then((authorized) => {
    if (authorized === true) {
      writeSubscriberCache(email);
    } else if (authorized === false) {
      localStorage.removeItem(AUTH_EMAIL_KEY);
      window.location.href = "/index.html";
    }
  });

  return true;
}

// Porta de entrada do Chat (app.html):
// - Confirma idade primeiro.
// - Se tiver e-mail → chat imediato (+ revalida em paralelo).
// - Se NÃO tiver e-mail → redireciona pra /login.html (não mostra formulário aqui).
function initAccessGate(onReady) {
  const ageGate = document.getElementById("gate-age");
  const ageConfirmBtn = document.getElementById("gate-age-confirm");

  function proceedOptimistically(email) {
    if (ageGate) ageGate.style.display = "none";
    onReady();

    if (readSubscriberCache(email)) return;

    checkSubscriber(email).then((authorized) => {
      if (authorized === true) {
        writeSubscriberCache(email);
      } else if (authorized === false) {
        localStorage.removeItem(AUTH_EMAIL_KEY);
        window.location.href = "/index.html";
      }
    });
  }

  function afterAgeConfirmed() {
    const email = (localStorage.getItem(AUTH_EMAIL_KEY) || "").trim().toLowerCase();
    if (email) {
      proceedOptimistically(email);
    } else {
      // Usuário novo sem sessão → manda pro login, não mostra formulário aqui.
      window.location.href = "/index.html";
    }
  }

  if (ageConfirmBtn) {
    ageConfirmBtn.addEventListener("click", () => {
      setState({ ageConfirmed: true });
      afterAgeConfirmed();
    });
  }

  if (getState().ageConfirmed) {
    afterAgeConfirmed();
  }
}

// Formulário de login — usado em login.html.
// Lê e-mail, valida no Supabase; sucesso → /app.html.
function initLoginForm() {
  // Se já tem sessão válida, pula o formulário direto pro chat.
  const cachedEmail = (localStorage.getItem(AUTH_EMAIL_KEY) || "").trim().toLowerCase();
  if (cachedEmail && readSubscriberCache(cachedEmail)) {
    window.location.replace("/app.html");
    return;
  }

  const emailInput = document.getElementById("auth-email-input");
  const loginBtn = document.getElementById("auth-login-btn");
  const errorEl = document.getElementById("auth-error");

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  }

  function hideError() {
    errorEl.style.display = "none";
  }

  async function attemptLogin(email) {
    hideError();
    loginBtn.disabled = true;
    loginBtn.textContent = "Verificando...";

    const authorized = await checkSubscriber(email);

    loginBtn.disabled = false;
    loginBtn.textContent = "Entrar";

    if (authorized === true) {
      const previousEmail = (localStorage.getItem(AUTH_EMAIL_KEY) || "").trim().toLowerCase();
      if (previousEmail && previousEmail !== email) {
        resetState();
        setState({ ageConfirmed: true });
      }
      localStorage.setItem(AUTH_EMAIL_KEY, email);
      writeSubscriberCache(email);
      window.location.href = "/app.html";
    } else if (authorized === false) {
      localStorage.removeItem(AUTH_EMAIL_KEY);
      showError("Acabou de assinar? Pode levar alguns minutos para a confirmação. Tente novamente em instantes.");
    } else {
      showError("Não consegui verificar agora. Confere sua internet e tenta de novo em instantes.");
    }
  }

  loginBtn.addEventListener("click", () => {
    const email = (emailInput.value || "").trim().toLowerCase();
    if (!email) {
      showError("Digite seu e-mail pra continuar.");
      return;
    }
    attemptLogin(email);
  });

  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });
}

