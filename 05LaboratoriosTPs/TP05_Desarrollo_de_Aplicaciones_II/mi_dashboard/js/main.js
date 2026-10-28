import { estado, setConexion, setInfo, setSnapshot, capturarMuestra, reiniciarEstado } from "./estado.js";
import { conectar, desconectar } from "./clienteDatos.js";
import { exportarCsv } from "./exportarCsv.js";
import {
  inicializarPanelControles,
  renderEstadoConexion,
  renderModelo,
  renderContadorMuestras,
} from "./render/panelControles.js";
import { inicializarPanelMotores, renderPanelMotores } from "./render/panelMotores.js";
import { inicializarPanelImu, renderPanelImu } from "./render/panelImu.js";
import {
  inicializarPanelGraficoMotores,
  configurarPanelGraficoMotores,
  renderPanelGraficoMotores,
} from "./render/panelGraficoMotores.js";
import { renderPanelBms } from "./render/panelBms.js";
import { inicializarPanelPatas, renderPanelPatas } from "./render/panelPatas.js";

inicializarPanelImu();
inicializarPanelGraficoMotores();

function onConexionCambiada(valor) {
  setConexion(valor);
  renderEstadoConexion(valor);
}

function onInfoRecibida(info) {
  setInfo(info);
  renderModelo(info);
  inicializarPanelMotores(info);
  inicializarPanelPatas(info);
  configurarPanelGraficoMotores(info);
}

// Al reconectar aparecio otro robot: se descarta lo acumulado y se arranca de nuevo.
function onRobotCambiado(info) {
  reiniciarEstado();
  renderContadorMuestras(0);
  onInfoRecibida(info);
}

function onDatosRecibidos(snapshot) {
  setSnapshot(snapshot);
  renderPanelMotores(snapshot);
  renderPanelImu(snapshot, estado.historicoImu);
  renderPanelGraficoMotores(estado.historicoMotores);
  renderPanelBms(snapshot);
  renderPanelPatas(snapshot);
}

async function onConectarClick(host) {
  if (!host) return;
  reiniciarEstado();
  renderContadorMuestras(0);
  try {
    await conectar(host, {
      onConexion: onConexionCambiada,
      onInfo: onInfoRecibida,
      onRobotCambiado,
      onDatos: onDatosRecibidos,
    });
  } catch {
    onConexionCambiada("Desconectado");
  }
}

function onDesconectarClick() {
  desconectar();
}

function onCapturarClick() {
  capturarMuestra();
  renderContadorMuestras(estado.muestrasCapturadas.length);
}

function onExportarClick() {
  exportarCsv(estado.muestrasCapturadas);
}

inicializarPanelControles({
  onConectar: onConectarClick,
  onDesconectar: onDesconectarClick,
  onCapturar: onCapturarClick,
  onExportar: onExportarClick,
});
