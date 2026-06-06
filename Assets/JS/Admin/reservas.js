const reservacionesTotales = document.getElementById('cantReservacionesTotales');
const reservacionesPagadas = document.getElementById('cantReservacionesPagadas');
const reservacionesPendientes = document.getElementById('cantReservacionesPendientes');
const reservacionesCanceladas = document.getElementById('cantReservacionesCanceladas');
const tablaReservaciones = document.getElementById('tablaReservaciones');
const selectPasajero = document.getElementById('selectPasajero');
const selectVuelo = document.getElementById('selectVuelo');
const selectEstado = document.getElementById('selectEstado');
const selectClase = document.getElementById('selectClase');
const formEditarReservacion = document.getElementById('editarReserva');

function getReservacionesTotales() {
    fetch(`/reservacionesTotales`)

    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones totales");
        return res.json();
    })
    .then(data => {
        reservacionesTotales.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getReservacionesPagadas() {
    fetch(`/reservacionesPagadas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones pagadas");
        return res.json();
    })
    .then(data => {
        reservacionesPagadas.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getReservacionesPendientes() {
    fetch(`/reservacionesPendientes`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones pendientes");
        return res.json();
    })
    .then(data => {
        reservacionesPendientes.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getReservacionesCanceladas() { 
    fetch(`/reservacionesCanceladas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones canceladas");
        return res.json();
    })
    .then(data => {
        reservacionesCanceladas.textContent = data[0].cantidad;
    })
    .catch(console.error);
}
function cargarPasajeros() {
    fetch('/obtenerPasajeros')
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener pasajeros');
            return res.json();
        })
        .then(data => {
            selectPasajero.innerHTML = '<option value="">Seleccionar Pasajero</option>';
            data.forEach(pasajero => {
                const option = document.createElement('option');
                option.value = pasajero.pasajero_id;
                option.textContent = `${pasajero.nombre} ${pasajero.apellido}`;
                selectPasajero.appendChild(option);
            });
        })
        .catch(err => console.error('Error:', err));
}

function cargarVuelos() {
    fetch('/obtenerVuelos')
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener vuelos');
            return res.json();
        })
        .then(data => {
            selectVuelo.innerHTML = '<option value="">Seleccionar Vuelo</option>';
            data.forEach(vuelo => {
                const option = document.createElement('option');
                option.value = vuelo.vuelo_id;

                option.textContent = `${vuelo.aeropuerto_origen} → ${vuelo.aeropuerto_destino}`;
                selectVuelo.appendChild(option);
            });
        })
        .catch(err => console.error('Error:', err));
}


getReservacionesTotales();
getReservacionesPagadas();
getReservacionesPendientes();
getReservacionesCanceladas();
getReservaciones();
cargarPasajeros();
cargarVuelos();


function renderReservaciones(datos) {
    tablaReservaciones.innerHTML = "";
    if (!datos || datos.length === 0) {
        tablaReservaciones.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%;">
            <p>No hay reservaciones disponibles.</p>
        </div>`;
        return;
    }
    datos.forEach(reserva => {
        console.log(reserva);
        const rawDate = reserva.fecha_reservacion || reserva.fecha || '';
        const d = new Date(rawDate);
        const formattedDate = isNaN(d) ? rawDate : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const isoDate = isNaN(d) ? '' : d.toISOString().slice(0, 10);
        const nombre = reserva.nombre || '';
        const apellido = reserva.apellido || '';  
        const id = reserva.reservacion_id || '';  
        const pasajeroId = reserva.pasajero_id || '';
        const vueloId = reserva.vuelo_id || '';
        const estado = reserva.estado || '';
        const clase = reserva.clase || '';
        console.log("estado", estado);
        console.log("clase", clase);

        console.log("pasajero id:", pasajeroId);
        console.log("vuelo id:", vueloId);


        document.getElementById('reservacion_id').value = id; //Oculto
        tablaReservaciones.innerHTML += `
        <tr>
            <td>${nombre} ${apellido}</td>
            <td>${reserva.origen} -> ${reserva.destino}</td>
            <td>${formattedDate}</td>
            <td>${reserva.asiento}</td>
            <td>${reserva.precio}</td>
            <td>
                <span class="reservation-status ${estado.toLowerCase()}">
                    ${estado}
                </span>
            </td>
            <td>
                <button class="btn-edit" onclick="abrirEditor(
                '${reserva.reservacion_id}',
                '${pasajeroId}',
                '${vueloId}',
                '${reserva.asiento}',
                '${reserva.precio}',
                '${estado}',
                '${clase}')">

                    <i
                class="fa-solid fa-pen"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function getReservaciones() {
    fetch(`/viewReservacion`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones");
        return res.json();
    })
    .then(data => {
        renderReservaciones(data);
    })
}
selectPasajero.addEventListener('change', (e) => {
    document.getElementById('pasajero_id').value = e.target.value;
});

selectVuelo.addEventListener('change', (e) => {
    document.getElementById('vuelo_id').value = e.target.value;
});


//editar reservacion
function abrirEditor(id, pasajeroId, vueloId, asiento, precio, estado, clase) {
    document.getElementById('panelReserva').classList.add('active');

    console.log("id:", id);
    console.log("pasajeroId:", pasajeroId);
    console.log("vueloId:", vueloId);
    console.log("asiento:", asiento);
    console.log("precio:", precio);
    console.log("estado:", estado);
    console.log("clase", clase);
    document.getElementById('reservacion_id').value = id || '';
    document.getElementById('selectPasajero').value = pasajeroId || '';
    document.getElementById('selectVuelo').value = vueloId || '';
    document.getElementById('inAsiento').value = asiento || '';
    document.getElementById('total').value = precio;
    document.getElementById('selectEstado').value = estado;
    document.getElementById('selectClase').value = clase;
}

formEditarReservacion.addEventListener('submit', (e) => {
    e.preventDefault();

    const pasajero_id = document.getElementById('selectPasajero').value;
    const vuelo_id = document.getElementById('selectVuelo').value;

    const clase = document.getElementById('selectClase').value;
    const asiento = document.getElementById('inAsiento').value;
    const total = document.getElementById('total').value;
    const reservacion_id = document.getElementById('reservacion_id').value;
    const estado = document.getElementById('selectEstado').value;


    if (!pasajero_id || !vuelo_id || !asiento || !total) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    fetch('/editarReservacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            reservacion_id,
            pasajero_id,
            vuelo_id,
            clase,
            asiento,
            total,
            estado
        })
    })
    .then(res => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then(data => {
        alert(data.message || 'Reservación creada exitosamente');
        window.location.href = 'reservaciones.html';
    })
    .catch(err => {
        if (err instanceof Promise) {
            err.then(errData => alert(errData.message || 'Error al crear reservación'));
        } else {
            alert(err.message || 'Error al crear reservación');
        }
    });
});