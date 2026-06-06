const pasajerosVIP = document.getElementById("pasajerosVIP");
let VIP = [];

function renderPasajeros(datos) {
    pasajerosVIP.innerHTML = "";
    if (!datos || datos.length === 0) {
        pasajerosVIP.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%;">
            <p>No hay pasajeros disponibles.</p>
        </div>`;
        return;
    }

    datos.forEach(pasajero => {
        pasajerosVIP.innerHTML += `
        <tr>
            <td>${pasajero.pasaporte}</td>
            <td>${pasajero.nombre} ${pasajero.apellido}</td>
            <td>${pasajero.nacionalidad}</td>
            <td>${pasajero.telefono}</td>
            <td>${pasajero.email}</td>
            <td>${pasajero.programa_fidelidad}</td>
            <td>
                <button class="btn-edit" onclick="abrirEditor(
                '${pasajero.pasaporte}',
                '${pasajero.nombre}',
                '${pasajero.apellido}',
                '${pasajero.nacionalidad}',
                '${pasajero.telefono}',
                '${pasajero.email}',
                '${pasajero.vuelos_acumulados}'
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

    const filtrados = VIP.filter(pasajero =>
        pasajero.nombre.toLowerCase().includes(texto) ||
        pasajero.apellido.toLowerCase().includes(texto) ||
        pasajero.pasaporte.toLowerCase().includes(texto) ||
        pasajero.programa_fidelidad.toLowerCase().includes(texto)
    );
    renderPasajeros(filtrados);
});

function getPasajerosVIP() {
    fetch(`/clientesVIP`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener pasajeros VIP");
        return res.json();
    })
    .then(data => {
        VIP = data;
        renderPasajeros(VIP);
    })
    .catch(console.error);
}
getPasajerosVIP();

// EDITAR PASAJERO
function abrirEditor(pasaporte, nombre, apellido, nacionalidad, telefono, email, vuelosAcumulados) {
    document.getElementById("panelEditar").classList.add("active");
    document.getElementById("pasaporte").value = pasaporte;
    document.getElementById("nombre").value = nombre;
    document.getElementById("apellido").value = apellido;
    document.getElementById("nacionalidad").value = nacionalidad;
    document.getElementById("telefono").value = telefono;
    document.getElementById("email").value = email;
    document.getElementById("vuelosAcumulados").value = vuelosAcumulados;
}

function cerrarEditor() {
    document.getElementById("panelEditar").classList.remove("active");
}


const editarPasajero = document.getElementById("editarPasajero");
editarPasajero.addEventListener("submit", async (e) => {
    e.preventDefault();

    fetch('/editarPasajero', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            pasaporte: document.getElementById("pasaporte").value,
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            nacionalidad: document.getElementById("nacionalidad").value,
            telefono: document.getElementById("telefono").value,
            email: document.getElementById("email").value,
            vuelosAcumulados: document.getElementById("vuelosAcumulados").value
        })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        window.location.href = "../empleado/pasajerosVIP.html";
    })
    .catch(err => {
        alert(err.message);
    });

});