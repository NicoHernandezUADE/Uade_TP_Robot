import { estado, setConexion, setInfo, setSnapshot, capturarMuestra } from "./estado.js";
import { conectar } from "./clienteDatos.js";
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
  try {
    await conectar(host, {
      onConexion: onConexionCambiada,
      onInfo: onInfoRecibida,
      onDatos: onDatosRecibidos,
    });
  } catch {
    onConexionCambiada("Desconectado");
  }
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
  onCapturar: onCapturarClick,
  onExportar: onExportarClick,
});
