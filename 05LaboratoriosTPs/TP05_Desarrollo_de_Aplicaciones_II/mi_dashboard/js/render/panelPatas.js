// Panel de patas: contacto para FR/FL/RR/RL. Solo aplica al Go2; el G1 no
// reporta estas cuatro patas (ver API.md / config.py del backend).

const PATAS = ["FR", "FL", "RR", "RL"];

const contenido = document.getElementById("contenido-patas");
const aviso = document.getElementById("patas-no-disponible");

export function inicializarPanelPatas(info) {
  const disponible = info.modelo === "go2";
  contenido.classList.toggle("oculto", !disponible);
  aviso.classList.toggle("oculto", disponible);
}

export function renderPanelPatas(snapshot) {
  if (!snapshot.fuerzas || snapshot.fuerzas.FR === undefined) return;
  for (const pata of PATAS) {
    const indicador = document.getElementById(`indicador-${pata}`);
    const contacto = snapshot.fuerzas[pata] === 1;
    indicador.textContent = contacto ? "Contacto" : "Sin contacto";
    indicador.classList.toggle("contacto", contacto);
    indicador.classList.toggle("sin-contacto", !contacto);
  }
}
