const map = L.map("map").setView([-23.55, -46.63], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

let marker;

// Função para atualizar posição do caminhão
async function atualizarPosicao() {
  try {
    const res = await fetch("http://mapa-6wu5.onrender.com/api/locations/latest");
    if (!res.ok) throw new Error("Erro na API");

    const data = await res.json();
    const { latitude, longitude, datahora } = data;

    if (!marker) {
      marker = L.marker([latitude, longitude]).addTo(map);
    } else {
      marker.setLatLng([latitude, longitude]);
    }

    marker.bindPopup(`
      <b>Caminhão</b><br>
      ${new Date(datahora).toLocaleString()}
    `);

    console.log("Posição atual:", latitude, longitude);
  } catch (err) {
    console.error("Erro ao atualizar posição:", err);
  }
}

// Atualiza a cada 5 segundos
setInterval(atualizarPosicao, 5000);
atualizarPosicao();
