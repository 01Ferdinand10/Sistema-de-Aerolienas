const tableVuelos = document.getElementById('tableVuelos');
let rutas = [];

function renderRutas(datos) {
    tableVuelos.innerHTML = "";
    if (!datos || datos.length === 0) {
        tableVuelos.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%;">
            <p>No hay rutas disponibles.</p>
        </div>`;
        return;
    }

    datos.forEach(ruta => {
        tableVuelos.innerHTML += `
        <tr>
            <td>${ruta.aeropuerto_origen}</td>
            <td>${ruta.aeropuerto_destino}</td>
            <td>
                <span class="route-badge"> ${ruta.aeropuerto_origen} ➜ ${ruta.aeropuerto_destino}</span>
            </td>
            <td>${ruta.distancia_km} km</td>
            <td>${Math.floor(ruta.tiempo_estimado_min / 60)}h ${ruta.tiempo_estimado_min % 60}min</td>
            <td>
                <button class="btn-edit" onclick="abrirEditor(
                '${ruta.ruta_id}',
                '${ruta.aeropuerto_origen}',
                '${ruta.aeropuerto_destino}',
                '${ruta.distancia_km}',
                '${ruta.tiempo_estimado_min}'
                )">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

const buscador = document.getElementById("buscador");
buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    const filtrados = rutas.filter(ruta =>
        ruta.aeropuerto_origen.toLowerCase().includes(texto) ||
        ruta.aeropuerto_destino.toLowerCase().includes(texto)
    );
    renderRutas(filtrados);
});

function getRutas() {
    fetch(`/rutas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener las rutas");
        return res.json();
    })
    .then(data => {
        rutas = data;
        renderRutas(rutas);
    })
    .catch(console.error);
}
getRutas();


// EDITAR PASAJERO
function abrirEditor(ruta_id, aeropuerto_origen, aeropuerto_destino, distancia_km, tiempo_estimado_min) {
    document.getElementById("panelEditar").classList.add("active");
    document.getElementById("ruta_id").value = ruta_id;
    document.getElementById("aeropuerto_origen").value = aeropuerto_origen;
    document.getElementById("aeropuerto_destino").value = aeropuerto_destino;
    document.getElementById("distancia_km").value = distancia_km;
    document.getElementById("tiempo_estimado_min").value = tiempo_estimado_min;
}

function cerrarEditor() {
    document.getElementById("panelEditar").classList.remove("active");
}


const editarRuta = document.getElementById("editarRuta");
editarRuta.addEventListener("submit", async (e) => {
    e.preventDefault();

    fetch('/editarRutas', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ruta_id: Number(document.getElementById("ruta_id").value),
            aeropuerto_origen: document.getElementById("aeropuerto_origen").value,
            aeropuerto_destino: document.getElementById("aeropuerto_destino").value,
            distancia_km: Number(document.getElementById("distancia_km").value),
            tiempo_estimado_min: Number(document.getElementById("tiempo_estimado_min").value)
        })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        cerrarEditor();
        getRutas();
    })
    .catch(err => {
        alert(err.message);
    });

});