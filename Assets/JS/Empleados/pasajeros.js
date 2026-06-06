const cantPasajerosRegis = document.getElementById("cantPasajerosRegis");
const cantClientesVIP = document.getElementById("cantClientesVIP");
const cantGanancias = document.getElementById("cantGanancias");
const cantNacionalidades = document.getElementById("cantNacionalidades");

function getCantPasajerosRegis() {
    fetch(`/pasajerosRegis`)

    .then(res => {
        if (!res.ok) throw new Error("Error al obtener pasajeros");
        return res.json();
    })
    .then(data => {
        cantPasajerosRegis.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantClientesVIP() {
    fetch(`/cantClientesVIP`)

    .then(res => {
        if (!res.ok) throw new Error("Error al obtener clientes VIP");
        return res.json();
    })
    .then(data => {
        cantClientesVIP.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantGanancias() {
    fetch(`/cantGanancias`)

    .then(res => {
        if (!res.ok) throw new Error("Error al obtener ganancias");
        return res.json();
    })
    .then(data => {
        cantGanancias.textContent = Number(data[0].ganancias).toLocaleString('en-US', { style: 'currency', currency: 'USD'});
    })
    .catch(console.error);
}

function getCantNacionalidades() {
    fetch(`/nacionalidades`)

    .then(res => {
        if (!res.ok) throw new Error("Error al obtener nacionalidades");
        return res.json();
    })
    .then(data => {
        cantNacionalidades.textContent = data[0].nacionalidades;
    })
    .catch(console.error);
}

getCantPasajerosRegis();
getCantClientesVIP();
getCantGanancias();
getCantNacionalidades();


function renderPasajeros(datos) {
    tablaPasajeros.innerHTML = "";
    if (!datos || datos.length === 0) {
        tablaPasajeros.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%;">
            <p>No hay pasajeros disponibles.</p>
        </div>`;
        return;
    }

    datos.forEach(pasajero => {
        tablaPasajeros.innerHTML += `
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

function getPasajeros() {
    fetch(`/viewPasajeros`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener pasajeros");
        return res.json();
    })
    .then(data => {
        renderPasajeros(data);
    })
    .catch(console.error);
}
getPasajeros();

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
        window.location.href = "../empleado/pasajeros.html";
    })
    .catch(err => {
        alert(err.message);
    });

});