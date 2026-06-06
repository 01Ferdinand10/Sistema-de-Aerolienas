const cantAeronaves = document.getElementById('cantAeronaves');
const cantAeronavesActive = document.getElementById('cantAeronavesActive');
const cantAeronavesMal = document.getElementById('cantAeronavesMal');

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

function getAeronavesActivas() {
    fetch(`/aeronavesActivas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener cantidad de aeronaves");
        return res.json();
    })
    .then(data => {
        cantAeronavesActive.textContent = data.length;
    })
    .catch(console.error);
}

function getAeronavesNoActivas() {
    fetch(`/aeronavesNoActivas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener cantidad de aeronaves");
        return res.json();
    })
    .then(data => {
        cantAeronavesMal.textContent = data.length;
    })
    .catch(console.error);
}

getCantAeronaves();
getAeronavesActivas();
getAeronavesNoActivas();

const tablaNoActivos = document.getElementById('tablaNoActivos');
function renderNoActivas() {
    fetch(`/aeronavesNoActivas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener aerolíneas");
        return res.json();
    })
    .then(datos => {
        tablaNoActivos.innerHTML = "";
        if (!datos || datos.length === 0) {
            tablaNoActivos.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100%;">
                <p>No hay aerolíneas disponibles.</p>
            </div>`;
            return;
        }

        datos.forEach(aeronave => {
            const fecha = new Date(new Date(aeronave.ultimo_mantenimiento).setDate(new Date(aeronave.ultimo_mantenimiento).getDate() + 30)).toISOString().split("T")[0];
            tablaNoActivos.innerHTML += `
            <tr>
                <td>${aeronave.nombre}</td>
                <td>${aeronave.modelo}</td>
                <td>${aeronave.capacidad_pasajeros}</td>
                <td>${aeronave.capacidad_carga}</td>
                <td>${aeronave.fecha_fabricacion}</td>
                <td>${fecha}</td>
                <td>${aeronave.estado}</td>
                <td>
                    <button class="btn-edit" onclick="abrirEditor(
                        '${aeronave.aeronave_id}',
                        '${aeronave.nombre}',
                        '${aeronave.modelo}',
                        '${aeronave.capacidad_pasajeros}',
                        '${aeronave.capacidad_carga}',
                        '${aeronave.fecha_fabricacion}',
                        '${fecha}',
                        '${aeronave.estado}'
                        )">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            </tr>
            `;
        });
    })
    .catch(console.error);
}


const tablaActivos = document.getElementById('tablaActivos');
function renderActivas() {
    fetch(`/aeronavesActivas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener aerolíneas");
        return res.json();
    })
    .then(datos => {
        tablaActivos.innerHTML = "";
        if (!datos || datos.length === 0) {
            tablaActivos.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100%;">
                <p>No hay aerolíneas disponibles.</p>
            </div>`;
            return;
        }

        datos.forEach(aeronave => {
            const fecha = new Date(aeronave.ultimo_mantenimiento).toISOString().split("T")[0];
            tablaActivos.innerHTML += `
            <tr>
                <td>${aeronave.nombre}</td>
                <td>${aeronave.modelo}</td>
                <td>${aeronave.capacidad_pasajeros}</td>
                <td>${aeronave.capacidad_carga}</td>
                <td>${aeronave.fecha_fabricacion}</td>
                <td>${fecha}</td>
                <td>${aeronave.estado}</td>
                <td>
                    <button class="btn-edit" onclick="abrirEditor(
                        '${aeronave.aeronave_id}',
                        '${aeronave.nombre}',
                        '${aeronave.modelo}',
                        '${aeronave.capacidad_pasajeros}',
                        '${aeronave.capacidad_carga}',
                        '${aeronave.fecha_fabricacion}',
                        '${fecha}',
                        '${aeronave.estado}'
                        )">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </td>
            </tr>
            `;
        });
    })
    .catch(console.error);
}
renderActivas();
renderNoActivas();


function abrirEditor(aeronave_id, aerolinia, modelo, cap_pasajeros, cap_carga, fabrication, ult_mant, estado) {
    document.getElementById("panelEditar").classList.add("active");
    document.getElementById("aeronave_id").value = aeronave_id;
    document.getElementById("modelo").value = modelo;
    document.getElementById("cap_pasajeros").value = cap_pasajeros;
    document.getElementById("cap_carga").value = cap_carga;
    document.getElementById("fabrication").value = `${fabrication}-01-01`;;
    document.getElementById("ult_mant").value = ult_mant;
    document.getElementById("estado").value = estado;
}

function cerrarEditor() {
    document.getElementById("panelEditar").classList.remove("active");
}

const editarAerolineaForm = document.getElementById("editarAerolinea");
editarAerolineaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const aeronave_id = Number(document.getElementById("aeronave_id").value);
    const modelo = document.getElementById("modelo").value;
    const cap_pasajeros = Number(document.getElementById("cap_pasajeros").value);
    const cap_carga = Number(document.getElementById("cap_carga").value);
    const fabrication = document.getElementById("fabrication").value;
    const ult_mant = document.getElementById("ult_mant").value;
    const estado = document.getElementById("estado").value;
    fetch('/editarAeronave', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aeronave_id, modelo, cap_pasajeros, cap_carga, fabrication, ult_mant, estado })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        renderActivas();
        renderNoActivas();
        cerrarEditor();     
    })
    .catch(err => {
        alert(err.message);
    });
});