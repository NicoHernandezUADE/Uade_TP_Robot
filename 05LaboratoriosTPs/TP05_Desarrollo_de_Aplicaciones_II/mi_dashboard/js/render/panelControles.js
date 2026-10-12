// Panel de controles: conexion, modelo, captura de muestras y exportacion.

const inputHost = document.getElementById("input-host");
const btnConectar = document.getElementById("btn-conectar");
const estadoConexion = document.getElementById("estado-conexion");
const valorModelo = document.getElementById("valor-modelo");
const btnCapturar = document.getElementById("btn-capturar");
const btnExportar = document.getElementById("btn-exportar");
const valorMuestras = document.getElementById("valor-muestras");

const CLASES_ESTADO = {
  Conectado: "estado-conectado",
  Desconectado: "estado-desconectado",
  Reconectando: "estado-reconectando",
};

export function inicializarPanelControles({ onConectar, onCapturar, onExportar }) {
  btnConectar.addEventListener("click", () => onConectar(inputHost.value.trim()));
  btnCapturar.addEventListener("click", onCapturar);
  btnExportar.addEventListener("click", onExportar);
}

export function renderEstadoConexion(estado) {
  estadoConexion.textContent = estado;
  estadoConexion.className = `estado ${CLASES_ESTADO[estado]}`;
  const activo = estado !== "Desconectado";
  btnCapturar.disabled = !activo;
}

export function renderModelo(info) {
  valorModelo.textContent = `${info.nombre} (${info.modelo})`;
}

export function renderContadorMuestras(cantidad) {
  valorMuestras.textContent = cantidad;
  btnExportar.disabled = cantidad === 0;
}
