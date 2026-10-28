// Cliente de datos: WebSocket como transporte principal (push, ~10 Hz),
// con fallback a polling de /telemetria (<=500ms) mientras el WebSocket
// no esta disponible o se esta reconectando.
// Al recuperar la conexion se consulta /info: si es el mismo robot se
// continua, si es otro se avisa con onRobotCambiado para arrancar de nuevo.

const INTERVALO_POLLING_MS = 500;
const REINTENTO_WS_MS = 1500;

let ws = null;
let intervaloPolling = null;
let reintentoTimeout = null;
let baseUrlActual = null;
let handlersActuales = null;
let detenido = true;
let modeloActual = null;
let esReconexion = false;
let verificacion = null; // promesa de verificarRobot en curso, para no duplicarla

function normalizarBase(url) {
  return url.replace(/\/+$/, "");
}

async function consultarInfo() {
  const resp = await fetch(`${baseUrlActual}/info`, { cache: "no-store" });
  if (!resp.ok) throw new Error("No se pudo consultar /info");
  return resp.json();
}

function verificarRobot() {
  if (!verificacion) {
    verificacion = (async () => {
      const info = await consultarInfo();
      if (detenido || info.modelo === modeloActual) return;
      modeloActual = info.modelo;
      handlersActuales.onRobotCambiado(info);
    })().finally(() => {
      verificacion = null;
    });
  }
  return verificacion;
}

function recibirDatos(datos) {
  // mientras se verifica el robot, o si el dato es de otro robot, no se renderiza
  if (verificacion) return;
  if (datos.modelo !== modeloActual) {
    verificarRobot().catch(() => {});
    return;
  }
  handlersActuales.onDatos(datos);
}

function iniciarPolling() {
  if (intervaloPolling) return;
  intervaloPolling = setInterval(async () => {
    try {
      const resp = await fetch(`${baseUrlActual}/telemetria`, { cache: "no-store" });
      if (!resp.ok) throw new Error("respuesta no ok");
      const datos = await resp.json();
      recibirDatos(datos);
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
  const socket = new WebSocket(wsUrl);
  ws = socket;

  socket.onopen = async () => {
    if (esReconexion) {
      try {
        await verificarRobot();
      } catch {
        socket.close(); // vuelve al ciclo de reintento
        return;
      }
      if (detenido || socket.readyState !== WebSocket.OPEN) return;
    }
    esReconexion = false;
    detenerPolling();
    handlersActuales.onConexion("Conectado");
  };

  socket.onmessage = (evento) => {
    recibirDatos(JSON.parse(evento.data));
  };

  socket.onclose = () => {
    if (detenido) return;
    esReconexion = true;
    handlersActuales.onConexion("Reconectando");
    iniciarPolling();
    reintentoTimeout = setTimeout(abrirWebSocket, REINTENTO_WS_MS);
  };

  socket.onerror = () => {
    socket.close();
  };
}

export async function conectar(baseUrl, handlers) {
  desconectar(); // evita dejar un socket o polling viejo vivo si se reconecta a mano
  detenido = false;
  esReconexion = false;
  baseUrlActual = normalizarBase(baseUrl);
  handlersActuales = handlers;

  const info = await consultarInfo();
  modeloActual = info.modelo;
  handlers.onInfo(info);

  abrirWebSocket();
}

export function desconectar() {
  detenido = true;
  modeloActual = null;
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
