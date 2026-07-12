function initChat() {
  renderBottomNav("chat");

  const chatEl = document.getElementById("chat");
  const composer = document.getElementById("composer");
  const input = document.getElementById("input");
  const welcomeMsg = document.getElementById("welcome-msg");
  const sendBtn = composer.querySelector('button[type="submit"]');

  // Sidebar
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const newChatBtn = document.getElementById("new-chat-btn");
  const sidebarList = document.getElementById("sidebar-list");
  const sidebarSearch = document.getElementById("sidebar-search");
  const sidebarEmailEl = document.getElementById("sidebar-email");

  const email = localStorage.getItem("intimaIA_email") || "";
  const MAX_HISTORY = 20; // mensagens enviadas pra IA como contexto
  const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB

  let currentConvId = null;
  let history = []; // contexto em memória pra IA
  let isFirstMessage = true;

  // Estado da imagem selecionada
  let selectedImageBase64 = null;
  let selectedImageType = null;

  // ── Upload de imagem ─────────────────────────────────────────────────────
  const imgInput = document.getElementById("img-input");
  const imgPreviewBar = document.getElementById("img-preview-bar");
  const imgPreview = document.getElementById("img-preview");
  const imgRemove = document.getElementById("img-remove");

  function clearImage() {
    selectedImageBase64 = null;
    selectedImageType = null;
    imgPreviewBar.style.display = "none";
    imgPreview.src = "";
    imgInput.value = "";
  }

  imgInput.addEventListener("change", () => {
    const file = imgInput.files[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Imagem muito grande. Limite: 4 MB.");
      clearImage();
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result; // "data:image/jpeg;base64,..."
      const [meta, b64] = dataUrl.split(",");
      selectedImageType = meta.replace("data:", "").replace(";base64", "");
      selectedImageBase64 = b64;
      imgPreview.src = dataUrl;
      imgPreviewBar.style.display = "flex";
    };
    reader.readAsDataURL(file);
  });

  imgRemove.addEventListener("click", clearImage);

  if (sidebarEmailEl) sidebarEmailEl.textContent = email;

  // ── Sidebar toggle ───────────────────────────────────────────────────────
  function openSidebar() {
    sidebar.classList.add("open");
    backdrop.classList.add("visible");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("visible");
  }
  sidebarToggle.addEventListener("click", () =>
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar()
  );
  backdrop.addEventListener("click", closeSidebar);

  // ── API helpers ──────────────────────────────────────────────────────────
  async function apiPost(path, body) {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  }
  async function apiGet(path) {
    const r = await fetch(path);
    return r.json();
  }
  async function apiPatch(path, body) {
    await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  async function apiDelete(path, body) {
    await fetch(path, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  // ── Renderizar conversa na sidebar ───────────────────────────────────────
  function renderConvItem(conv) {
    const li = document.createElement("li");
    li.className = "sidebar-item" + (conv.id === currentConvId ? " active" : "");
    li.dataset.id = conv.id;

    const dateStr = new Date(conv.created_at).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short",
    });
    li.innerHTML = `
      <span class="sidebar-item-title">${conv.titulo || "Nova Conversa"}</span>
      <span class="sidebar-item-date">${dateStr}</span>
      <button class="sidebar-item-del" title="Excluir" data-id="${conv.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    `;
    li.addEventListener("click", (e) => {
      if (e.target.closest(".sidebar-item-del")) return;
      loadConversation(conv.id);
      closeSidebar();
    });
    li.querySelector(".sidebar-item-del").addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Excluir esta conversa?")) return;
      await apiDelete(`/api/conversations/${conv.id}`, { email });
      if (currentConvId === conv.id) startNewConversation();
      loadSidebarList();
    });
    return li;
  }

  async function loadSidebarList(query = "") {
    let convs;
    if (query) {
      convs = await apiGet(`/api/conversations/search?email=${encodeURIComponent(email)}&q=${encodeURIComponent(query)}`);
    } else {
      convs = await apiGet(`/api/conversations?email=${encodeURIComponent(email)}`);
    }
    sidebarList.innerHTML = "";
    if (!Array.isArray(convs) || convs.length === 0) {
      sidebarList.innerHTML = `<li class="sidebar-empty">${query ? "Nenhuma conversa encontrada." : "Nenhuma conversa ainda."}</li>`;
      return;
    }
    convs.forEach((c) => sidebarList.appendChild(renderConvItem(c)));
  }

  // Busca com debounce
  let searchTimeout;
  sidebarSearch.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadSidebarList(sidebarSearch.value.trim()), 350);
  });

  // ── Carregar conversa existente ──────────────────────────────────────────
  async function loadConversation(convId) {
    currentConvId = convId;
    isFirstMessage = false;
    history = [];

    // Destaca item ativo na sidebar
    sidebarList.querySelectorAll(".sidebar-item").forEach((li) => {
      li.classList.toggle("active", li.dataset.id === convId);
    });

    // Limpa e carrega mensagens
    chatEl.innerHTML = "";
    try {
      const msgs = await apiGet(
        `/api/conversations/${convId}/messages?email=${encodeURIComponent(email)}`
      );
      if (!Array.isArray(msgs) || msgs.length === 0) {
        chatEl.appendChild(createWelcomeBubble());
        isFirstMessage = true;
        return;
      }
      msgs.forEach((m) => {
        addMessage(m.conteudo, m.origem === "user" ? "user" : "bot");
        history.push({ role: m.origem === "user" ? "user" : "assistant", content: m.conteudo });
      });
    } catch (e) {
      chatEl.appendChild(createWelcomeBubble());
      isFirstMessage = true;
    }
  }

  // ── Nova conversa ────────────────────────────────────────────────────────
  async function startNewConversation() {
    history = [];
    isFirstMessage = true;
    chatEl.innerHTML = "";
    chatEl.appendChild(createWelcomeBubble());
    sidebarList.querySelectorAll(".sidebar-item").forEach((li) => li.classList.remove("active"));
    try {
      const conv = await apiPost("/api/conversations", { email });
      currentConvId = conv?.id || null;
    } catch (e) {
      currentConvId = null;
    }
    loadSidebarList();
  }

  newChatBtn.addEventListener("click", () => {
    startNewConversation();
    closeSidebar();
  });

  // ── Helpers de UI ────────────────────────────────────────────────────────
  function createWelcomeBubble() {
    const el = document.createElement("div");
    el.className = "message bot";
    el.innerHTML = "<p>Oi, bem-vindo(a)! 🔥 Aqui é a Intima IA, sua mentora de relacionamentos, comunicação e intimidade. Pode me perguntar qualquer coisa — sobre como se expressar melhor, como reconectar, como aumentar o desejo, como ler um print... Tô aqui pra isso. Anônimo, sem julgamento, sem rodeio. 💬 Por onde você quer começar? ❤️</p>";
    return el;
  }

  function addMessage(text, who) {
    const el = document.createElement("div");
    el.className = `message ${who}`;
    const p = document.createElement("p");
    p.textContent = text;
    el.appendChild(p);
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
    return el;
  }

  function addTyping() {
    const el = document.createElement("div");
    el.className = "message typing";
    el.textContent = "digitando...";
    chatEl.appendChild(el);
    chatEl.scrollTop = chatEl.scrollHeight;
    return el;
  }

  // ── Enviar mensagem ──────────────────────────────────────────────────────
  async function sendMessage(text) {
    const trimmed = (text || "").trim();
    const hasImage = Boolean(selectedImageBase64);

    // Requer texto OU imagem
    if (!trimmed && !hasImage) return;

    // Garante que há uma conversa ativa
    if (!currentConvId) {
      try {
        const conv = await apiPost("/api/conversations", { email });
        currentConvId = conv?.id || null;
      } catch (e) { /* segue offline */ }
    }

    // Mostra bolha do usuário (com miniatura se houver imagem)
    if (hasImage) {
      const el = document.createElement("div");
      el.className = "message user user-image-msg";
      el.innerHTML = `
        <img class="chat-img-thumb" src="${imgPreview.src}" alt="Print enviado" />
        ${trimmed ? `<p>${trimmed}</p>` : ""}
      `;
      chatEl.appendChild(el);
      chatEl.scrollTop = chatEl.scrollHeight;
    } else {
      addMessage(trimmed, "user");
    }

    input.value = "";

    // Captura e limpa a imagem ANTES do envio assíncrono
    const b64 = selectedImageBase64;
    const imgType = selectedImageType;
    clearImage();

    // Salva mensagem do usuário no Supabase (fire-and-forget)
    const userContent = trimmed || "[Print de conversa para análise]";
    if (currentConvId) {
      apiPost(`/api/conversations/${currentConvId}/messages`, {
        email, conteudo: userContent, origem: "user",
      });
      if (isFirstMessage) {
        isFirstMessage = false;
        const titulo = (trimmed || "Análise de print").slice(0, 60);
        apiPatch(`/api/conversations/${currentConvId}/title`, { email, titulo });
        setTimeout(() => loadSidebarList(), 500);
      }
    }

    const typingEl = addTyping();
    sendBtn.disabled = true;
    sendBtn.textContent = "…";

    try {
      const userState = getState();
      const body = {
        message: trimmed, // string vazia quando só há imagem — o prompt detecta isso e age certo
        history: history.slice(-MAX_HISTORY),
        nome: userState.nome || null,
        userContext: userState.userContext || null,
        pilar: userState.pilar || null,
        dor: userState.dor || null,
        relStatus: userState.relStatus || null,
      };
      if (b64) {
        body.imageBase64 = b64;
        body.imageType = imgType;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      typingEl.remove();
      const reply = data.reply || "Não consegui responder agora, tenta de novo.";
      addMessage(reply, "bot");

      history.push({ role: "user", content: userContent });
      history.push({ role: "assistant", content: reply });

      if (currentConvId) {
        apiPost(`/api/conversations/${currentConvId}/messages`, {
          email, conteudo: reply, origem: "ia",
        });
      }
    } catch (err) {
      typingEl.remove();
      addMessage("Deu um erro de conexão. Tenta de novo em um instante.", "bot");
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "➤";
    }
  }

  composer.addEventListener("submit", (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });

  // ── Inicialização ─────────────────────────────────────────────────────────
  (async () => {
    await loadSidebarList();
    // Carrega a conversa mais recente ou cria uma nova
    const firstItem = sidebarList.querySelector(".sidebar-item");
    if (firstItem) {
      loadConversation(firstItem.dataset.id);
    } else {
      startNewConversation();
    }
  })();
}

initAccessGate(initChat);
