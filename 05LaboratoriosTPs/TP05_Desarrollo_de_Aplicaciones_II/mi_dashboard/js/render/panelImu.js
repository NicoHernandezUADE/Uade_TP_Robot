// Panel IMU: valores numericos + grafico de linea historico (Chart.js).
// Animaciones desactivadas por requisito de la consigna.

const valorRoll = document.getElementById("valor-roll");
const valorPitch = document.getElementById("valor-pitch");
const valorYaw = document.getElementById("valor-yaw");

let chart = null;

export function inicializarPanelImu() {
  const ctx = document.getElementById("chart-imu");
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "Roll (°)", data: [], borderColor: "#4c9aff", borderWidth: 1, pointRadius: 0 },
        { label: "Pitch (°)", data: [], borderColor: "#3fb950", borderWidth: 1, pointRadius: 0 },
        { label: "Yaw (°)", data: [], borderColor: "#d29922", borderWidth: 1, pointRadius: 0 },
      ],
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
}

export function renderPanelImu(snapshot, historicoImu) {
  valorRoll.textContent = snapshot.imu.roll.toFixed(2);
  valorPitch.textContent = snapshot.imu.pitch.toFixed(2);
  valorYaw.textContent = snapshot.imu.yaw.toFixed(2);

  chart.data.labels = historicoImu.map((m) => m.ts.toFixed(1));
  chart.data.datasets[0].data = historicoImu.map((m) => m.roll);
  chart.data.datasets[1].data = historicoImu.map((m) => m.pitch);
  chart.data.datasets[2].data = historicoImu.map((m) => m.yaw);
  chart.update();
}
