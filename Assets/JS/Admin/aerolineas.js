const cantAerolineas = document.getElementById('cantAerolineas');
const cantPaises = document.getElementById('cantPaises');
const cantAeronaves = document.getElementById('cantAeronaves');

function getCantAerolineas() {
    fetch(`/cantAerolineas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener cantidad de aerolíneas");
        return res.json();
    })
    .then(data => {
        cantAerolineas.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantPaises() {
    fetch(`/cantPaises`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener cantidad de países");
        return res.json();
    })
    .then(data => {
        cantPaises.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantAeronaves() {
    fetch(`/cantAeronaves`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener cantidad de aeronaves");
        return res.json();
    })
    .then(data => {
        cantAeronaves.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

getCantAerolineas();
getCantPaises();
getCantAeronaves();


const tablaAerolineas = document.getElementById("tablaAerolineas");
function renderAerolineas(datos) {
    tablaAerolineas.innerHTML = "";
    if (!datos || datos.length === 0) {
        tablaAerolineas.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%;">
            <p>No hay aerolíneas disponibles.</p>
        </div>`;
        return;
    }

    datos.forEach(aerolinea => {
        tablaAerolineas.innerHTML += `
        <tr>
            <td>${aerolinea.nombre}</td>
            <td>${aerolinea.codigo_IATA}</td>
            <td>${aerolinea.pais_origen}</td>
            <td>${new Date(aerolinea.fecha_fundacion).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })}
            </td>
            <td><a href="${aerolinea.sitio_web}" target="_blank">Visitar sitio web</a></td>
            <td>
                <button class="btn-edit" onclick="abrirEditor(
                    '${aerolinea.aerolinea_id}',
                    '${aerolinea.nombre}',
                    '${aerolinea.codigo_IATA}',
                    '${aerolinea.pais_origen}',
                    '${aerolinea.fecha_fundacion}',
                    '${aerolinea.sitio_web}'
                    )">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function getAerolineas() {
    fetch(`/aerolineas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener aerolíneas");
        return res.json();
    })
    .then(data => {
        renderAerolineas(data);
    })
    .catch(console.error);
}
getAerolineas();

function abrirEditor(aerolinea_id, nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web) {
    document.getElementById("panelEditar").classList.add("active");
    document.getElementById("aerolinea_id").value = aerolinea_id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("codigo_IATA").value = codigo_IATA;
    document.getElementById("pais_origen").value = pais_origen;
    document.getElementById("fecha_fundacion").value = new Date(fecha_fundacion).toISOString().split("T")[0];
    document.getElementById("sitio_web").value = sitio_web;
}

function cerrarEditor() {
    document.getElementById("panelEditar").classList.remove("active");
}

const editarAerolineaForm = document.getElementById("editarAerolinea");
editarAerolineaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = Number(document.getElementById("aerolinea_id").value);
    const nombre = document.getElementById("nombre").value;
    const codigo_IATA = document.getElementById("codigo_IATA").value;
    const pais_origen = document.getElementById("pais_origen").value;
    const fecha_fundacion = document.getElementById("fecha_fundacion").value;
    const sitio_web = document.getElementById("sitio_web").value;

    fetch('/editarAerolinea', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        getAerolineas();
        cerrarEditor();     
    })
    .catch(err => {
        alert(err.message);
    });
});