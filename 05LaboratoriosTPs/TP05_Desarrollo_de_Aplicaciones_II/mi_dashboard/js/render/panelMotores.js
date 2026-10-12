// Panel de motores: genera las filas segun la cantidad de motores del
// modelo activo (12 Go2 / 29 G1), sin hardcodear la cantidad.

const cuerpoTabla = document.getElementById("cuerpo-tabla-motores");

function claseSemaforo(temperatura) {
  if (temperatura > 60) return "rojo";
  if (temperatura >= 40) return "amarillo";
  return "verde";
}

let filasCreadas = false;

export function inicializarPanelMotores(info) {
  cuerpoTabla.innerHTML = "";
  for (let i = 0; i < info.n_motores; i++) {
    const fila = document.createElement("tr");
    fila.id = `fila-motor-${i}`;
    fila.innerHTML = `
      <td>${info.motores_nombres[i]}</td>
      <td class="celda-temperatura" id="motor-${i}-temperatura">—</td>
      <td id="motor-${i}-angulo">—</td>
      <td id="motor-${i}-velocidad">—</td>
      <td id="motor-${i}-torque">—</td>
    `;
    cuerpoTabla.appendChild(fila);
  }
  filasCreadas = true;
}

export function renderPanelMotores(snapshot) {
  if (!filasCreadas) return;
  for (const motor of snapshot.motores) {
    document.getElementById(`motor-${motor.id}-angulo`).textContent = motor.angulo.toFixed(2);
    document.getElementById(`motor-${motor.id}-velocidad`).textContent = motor.velocidad.toFixed(3);
    document.getElementById(`motor-${motor.id}-torque`).textContent = motor.torque.toFixed(2);

    const celdaTemp = document.getElementById(`motor-${motor.id}-temperatura`);
    celdaTemp.textContent = motor.temperatura.toFixed(1);
    celdaTemp.classList.remove("verde", "amarillo", "rojo");
    celdaTemp.classList.add(claseSemaforo(motor.temperatura));
  }
}
