// Estado mutable compartido por el cliente de datos y los paneles de render.

const HISTORICO_IMU_MAX = 60;

export const estado = {
  conexion: "Desconectado", // Conectado | Desconectado | Reconectando
  info: null,               // respuesta de /info: modelo, n_motores, motores_nombres, patas
  snapshot: null,           // ultimo payload de /telemetria o /ws
  historicoImu: [],         // buffer circular: { ts, roll, pitch, yaw }
  historicoMotores: [],     // buffer circular de angulo y temperatura por motor
  muestrasCapturadas: [],   // snapshots clonados al presionar "Capturar muestra"
};

export function setConexion(valor) {
  estado.conexion = valor;
}

export function setInfo(info) {
  if (estado.info && estado.info.modelo !== info.modelo) {
    estado.historicoMotores = [];
  }
  estado.info = info;
}

export function setSnapshot(snapshot) {
  estado.snapshot = snapshot;
  estado.historicoImu.push({
    ts: snapshot.ts,
    roll: snapshot.imu.roll,
    pitch: snapshot.imu.pitch,
    yaw: snapshot.imu.yaw,
  });
  if (estado.historicoImu.length > HISTORICO_IMU_MAX) {
    estado.historicoImu.shift();
  }
  estado.historicoMotores.push({
    ts: snapshot.ts,
    motores: snapshot.motores.map(({ id, angulo, temperatura }) => ({ id, angulo, temperatura })),
  });
  if (estado.historicoMotores.length > HISTORICO_IMU_MAX) {
    estado.historicoMotores.shift();
  }
}

export function capturarMuestra() {
  if (!estado.snapshot) return null;
  const copia = structuredClone(estado.snapshot);
  estado.muestrasCapturadas.push(copia);
  return copia;
}
