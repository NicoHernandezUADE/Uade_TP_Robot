// Panel BMS: carga, corriente, temperatura y tension por celda.

const valorSoc = document.getElementById("valor-soc");
const valorCorriente = document.getElementById("valor-corriente");
const valorTempBms = document.getElementById("valor-temp-bms");
const cuerpoCeldas = document.getElementById("cuerpo-tabla-celdas");

let cantidadCeldasCreadas = 0;

export function renderPanelBms(snapshot) {
  const bms = snapshot.bms;
  valorSoc.textContent = bms.soc;
  valorCorriente.textContent = bms.corriente;
  valorTempBms.textContent = bms.temperatura.toFixed(1);

  if (bms.celdas.length !== cantidadCeldasCreadas) {
    cuerpoCeldas.innerHTML = "";
    bms.celdas.forEach((_, i) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${i}</td><td id="celda-${i}">—</td>`;
      cuerpoCeldas.appendChild(fila);
    });
    cantidadCeldasCreadas = bms.celdas.length;
  }

  bms.celdas.forEach((tension, i) => {
    document.getElementById(`celda-${i}`).textContent = tension.toFixed(3);
  });
}
