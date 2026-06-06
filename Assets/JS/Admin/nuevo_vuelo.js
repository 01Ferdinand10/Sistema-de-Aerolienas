const selectAerolinea = document.getElementById('selectAerolinea');
const selectRuta = document.getElementById('selectRuta');
const selectAeronave = document.getElementById('selectAeronave');
const selectPuerta = document.getElementById('selectPuerta');
const fechaSalida = document.getElementById('fechaSalida');
const horaSalida = document.getElementById('horaSalida');
const fechaLlegada = document.getElementById('fechaLlegada');
const horaLlegada = document.getElementById('horaLlegada');
const inAsientos = document.getElementById('inAsientos');
const inPrecio = document.getElementById('inPrecio');
const formNuevoVuelo = document.getElementById('nuevoVueloForm');

function cargarAerolineas() {
    fetch('/obtenerAerolineas')
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener aerolíneas');
            return res.json();
        })
        .then(data => {
            selectAerolinea.innerHTML = '<option value="">Seleccionar Aerolínea</option>';
            data.forEach(aerolinea => {
                const option = document.createElement('option');
                option.value = aerolinea.aerolinea_id;
                option.textContent = aerolinea.nombre;
                selectAerolinea.appendChild(option);
            });
        })
        .catch(err => console.error('Error:', err));
}

function cargarRutas() {
    fetch('/obtenerRutas')
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener rutas');
            return res.json();
        })
        .then(data => {
            selectRuta.innerHTML = '<option value="">Seleccionar Ruta</option>';
            data.forEach(ruta => {
                const option = document.createElement('option');
                option.value = ruta.ruta_id;
                option.textContent = `${ruta.aeropuerto_origen} → ${ruta.aeropuerto_destino}`;
                option.dataset.origen = ruta.aeropuerto_origen;
                option.dataset.destino = ruta.aeropuerto_destino;
                selectRuta.appendChild(option);
            });
        })
        .catch(err => console.error('Error:', err));
}

function cargarAeronaves() {
    fetch('/obtenerAeronaves')
        .then(res => {
            if (!res.ok) throw new Error('Error al obtener aeronaves');
            return res.json();
        })
        .then(data => {
            selectAeronave.innerHTML = '<option value="">Seleccionar Modelo</option>';
            data.forEach(aeronave => {
                const option = document.createElement('option');
                option.value = aeronave.aeronave_id;
                option.textContent = aeronave.modelo;
                selectAeronave.appendChild(option);
            });
        })
        .catch(err => console.error('Error:', err));
}

selectRuta.addEventListener('change', (e) => {
    const option = e.target.selectedOptions[0];
    if (option) {
        const origen = option.dataset.origen || '';
        const destino = option.dataset.destino || '';
        option.textContent = `${origen} → ${destino}`;
    }
});

formNuevoVuelo.addEventListener('submit', (e) => {
    e.preventDefault();

    const aerolinea_id = selectAerolinea.value;
    const ruta_id = selectRuta.value;
    const aeronave_id = selectAeronave.value;
    const puerta = selectPuerta.value;
    const asientos_disponibles = inAsientos.value;
    const precio_base = inPrecio.value;
    const salida = fechaSalida.value;
    const hora_salida = horaSalida.value;
    const llegada = fechaLlegada.value;
    const hora_llegada = horaLlegada.value;

    if (!aerolinea_id || !ruta_id || !aeronave_id || !salida || !hora_salida || !llegada || !hora_llegada || !puerta || !asientos_disponibles) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    const fecha_salida = `${salida} ${hora_salida}:00`;
    const fecha_llegada_real = `${llegada} ${hora_llegada}:00`;

    fetch('/nuevoVuelo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            aerolinea_id,
            ruta_id,
            aeronave_id,
            fecha_salida,
            fecha_llegada_real,
            puerta_embarque: puerta,
            asientos_disponibles: Number(asientos_disponibles),
            precio_base: precio_base ? Number(precio_base) : null
        })
    })
    .then(res => {
        if (!res.ok) throw res.json();
        return res.json();
    })
    .then(data => {
        alert(data.message || 'Vuelo creado exitosamente');
        window.location.href = 'vuelos.html';
    })
    .catch(err => {
        if (err instanceof Promise) {
            err.then(errData => alert(errData.message || 'Error al crear vuelo'));
        } else {
            alert(err.message || 'Error al crear vuelo');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    cargarAerolineas();
    cargarRutas();
    cargarAeronaves();
});
