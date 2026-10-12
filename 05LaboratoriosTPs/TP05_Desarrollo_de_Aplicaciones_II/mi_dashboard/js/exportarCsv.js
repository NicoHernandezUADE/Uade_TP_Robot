// Aplana las muestras capturadas (snapshots de /telemetria) a filas CSV.
// Las columnas de motores y celdas se arman segun la primera muestra, para
// no hardcodear la cantidad de motores del modelo activo.

function encabezadoMotores(motores) {
  return motores.flatMap((m) => [
    `motor_${m.nombre}_angulo`,
    `motor_${m.nombre}_velocidad`,
    `motor_${m.nombre}_torque`,
    `motor_${m.nombre}_temperatura`,
  ]);
}

function filaMotores(motores) {
  return motores.flatMap((m) => [m.angulo, m.velocidad, m.torque, m.temperatura]);
}

export function exportarCsv(muestras) {
  if (muestras.length === 0) return;

  const primera = muestras[0];
  const columnasFuerzas = Object.keys(primera.fuerzas);
  const columnasCeldas = primera.bms.celdas.map((_, i) => `bms_celda_${i}`);

  const encabezado = [
    "ts",
    "modelo",
    ...encabezadoMotores(primera.motores),
    "imu_roll",
    "imu_pitch",
    "imu_yaw",
    "imu_ax",
    "imu_ay",
    "imu_az",
    "bms_soc",
    "bms_corriente",
    "bms_temperatura",
    ...columnasCeldas,
    ...columnasFuerzas.map((p) => `fuerza_${p}`),
  ];

  const filas = muestras.map((m) => [
    m.ts,
    m.modelo,
    ...filaMotores(m.motores),
    m.imu.roll,
    m.imu.pitch,
    m.imu.yaw,
    m.imu.ax,
    m.imu.ay,
    m.imu.az,
    m.bms.soc,
    m.bms.corriente,
    m.bms.temperatura,
    ...m.bms.celdas,
    ...columnasFuerzas.map((p) => m.fuerzas[p]),
  ]);

  const csv = [encabezado, ...filas].map((fila) => fila.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `telemetria_${Date.now()}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}
