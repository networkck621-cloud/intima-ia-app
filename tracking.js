// tracking.js — Meta Conversions API (server-side).
// O Access Token da Meta NUNCA fica em código de cliente — só no backend
// (Supabase Edge Function). Aqui só capturamos fbc/fbp e repassamos pro
// servidor, que faz a chamada real pra Meta.

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// _fbp é setado automaticamente pelo Pixel (fbevents.js) assim que carrega.
// _fbc só existe se a pessoa veio de um anúncio (?fbclid=...); se o Pixel
// ainda não setou o cookie nessa navegação, montamos no formato que a Meta
// espera (fb.1.<timestamp>.<fbclid>) a partir do parâmetro da URL.
function getFbc() {
  const cookie = getCookie("_fbc");
  if (cookie) return cookie;

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  if (!fbclid) return null;

  return `fb.1.${Date.now()}.${fbclid}`;
}

function getFbp() {
  return getCookie("_fbp");
}

// Dispara um evento de conversão via backend (Supabase Edge Function), que
// repassa pra Meta CAPI com o Access Token. Fire-and-forget: erro de rede
// aqui nunca deve travar o clique no checkout.
function trackConversionEvent(eventName, customData) {
  try {
    const email = (localStorage.getItem("intimaIA_email") || "").trim().toLowerCase();
    const body = {
      event_name: eventName,
      event_id: `${eventName}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      event_source_url: window.location.href,
      fbc: getFbc(),
      fbp: getFbp(),
      email: email || null, // servidor faz o hash SHA-256 antes de mandar pra Meta
      custom_data: customData || {},
    };
    fetch("/api/track-conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    // nunca deixa um erro de tracking quebrar o fluxo de checkout
  }
}
