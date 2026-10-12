// Cliente de datos: WebSocket como transporte principal (push, ~10 Hz),
// con fallback a polling de /telemetria (<=500ms) mientras el WebSocket
// no esta disponible o se esta reconectando.

const INTERVALO_POLLING_MS = 500;
const REINTENTO_WS_MS = 1500;

let ws = null;
let intervaloPolling = null;
let reintentoTimeout = null;
let baseUrlActual = null;
let handlersActuales = null;
let detenido = true;

function normalizarBase(url) {
  return url.replace(/\/+$/, "");
}

function iniciarPolling() {
  if (intervaloPolling) return;
  intervaloPolling = setInterval(async () => {
    try {
      const resp = await fetch(`${baseUrlActual}/telemetria`);
      if (!resp.ok) throw new Error("respuesta no ok");
      const datos = await resp.json();
      handlersActuales.onDatos(datos);
    } catch {
      // se reintenta en el proximo tick; el estado de conexion ya refleja el problema
    }
  }, INTERVALO_POLLING_MS);
}

function detenerPolling() {
  if (intervaloPolling) {
    clearInterval(intervaloPolling);
    intervaloPolling = null;
  }
}

function abrirWebSocket() {
  if (detenido) return;
  const wsUrl = baseUrlActual.replace(/^http/, "ws") + "/ws";
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    detenerPolling();
    handlersActuales.onConexion("Conectado");
  };

  ws.onmessage = (evento) => {
    const datos = JSON.parse(evento.data);
    handlersActuales.onDatos(datos);
  };

  ws.onclose = () => {
    if (detenido) return;
    handlersActuales.onConexion("Reconectando");
    iniciarPolling();
    reintentoTimeout = setTimeout(abrirWebSocket, REINTENTO_WS_MS);
  };

  ws.onerror = () => {
    ws.close();
  };
}

export async function conectar(baseUrl, handlers) {
  detenido = false;
  baseUrlActual = normalizarBase(baseUrl);
  handlersActuales = handlers;

  const resp = await fetch(`${baseUrlActual}/info`);
  if (!resp.ok) throw new Error("No se pudo consultar /info");
  const info = await resp.json();
  handlers.onInfo(info);

  abrirWebSocket();
}

export function desconectar() {
  detenido = true;
  detenerPolling();
  if (reintentoTimeout) {
    clearTimeout(reintentoTimeout);
    reintentoTimeout = null;
  }
  if (ws) {
    ws.onclose = null;
    ws.onerror = null;
    ws.close();
    ws = null;
  }
  if (handlersActuales) handlersActuales.onConexion("Desconectado");
}
