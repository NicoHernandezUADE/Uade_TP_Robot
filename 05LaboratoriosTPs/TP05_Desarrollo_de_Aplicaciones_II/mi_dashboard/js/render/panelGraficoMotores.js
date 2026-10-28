const selectorMotor = document.getElementById("selector-motor");
const selectorMetrica = document.getElementById("selector-metrica-motor");

let chart = null;
let ultimoHistorico = [];

function actualizarGrafico() {
  if (!chart) return;

  const motorId = Number(selectorMotor.value);
  const metrica = selectorMetrica.value;
  const nombreMetrica = metrica === "angulo" ? "Ángulo (°)" : "Temperatura (°C)";
  const motorSeleccionado = selectorMotor.selectedOptions[0]?.textContent ?? "Motor";

  chart.data.labels = ultimoHistorico.map((muestra) => muestra.ts.toFixed(1));
  chart.data.datasets[0].label = `${motorSeleccionado} · ${nombreMetrica}`;
  chart.data.datasets[0].data = ultimoHistorico.map((muestra) => {
    const motor = muestra.motores.find((item) => item.id === motorId);
    return motor ? motor[metrica] : null;
  });
  chart.update("none");
}

export function inicializarPanelGraficoMotores() {
  chart = new Chart(document.getElementById("chart-motores"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Ángulo (°)",
        data: [],
        borderColor: "#4c9aff",
        borderWidth: 1.5,
        pointRadius: 0,
        spanGaps: false,
      }],
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#7a8089", maxTicksLimit: 6 }, grid: { color: "#2a2e34" } },
        y: { ticks: { color: "#7a8089" }, grid: { color: "#2a2e34" } },
      },
      plugins: {
        legend: { labels: { color: "#c9cdd3", font: { size: 11 } } },
      },
    },
  });

  selectorMotor.addEventListener("change", actualizarGrafico);
  selectorMetrica.addEventListener("change", actualizarGrafico);
}

export function configurarPanelGraficoMotores(info) {
  ultimoHistorico = [];
  selectorMotor.replaceChildren();
  info.motores_nombres.forEach((nombre, id) => {
    const opcion = document.createElement("option");
    opcion.value = id;
    opcion.textContent = nombre;
    selectorMotor.appendChild(opcion);
  });
  selectorMotor.disabled = info.motores_nombres.length === 0;
  actualizarGrafico();
}

export function renderPanelGraficoMotores(historico) {
  ultimoHistorico = historico;
  actualizarGrafico();
}