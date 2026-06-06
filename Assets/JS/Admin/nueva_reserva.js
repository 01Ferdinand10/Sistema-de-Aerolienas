const selectPasajero = document.getElementById('selectPasajero');
const selectVuelo = document.getElementById('selectVuelo');
const formNuevaReservacion = document.getElementById('formNuevaReservacion');

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

// Guardar pasajero_id cuando se selecciona
selectPasajero.addEventListener('change', (e) => {
    document.getElementById('pasajero_id').value = e.target.value;
});

// Guardar vuelo_id cuando se selecciona
selectVuelo.addEventListener('change', (e) => {
    document.getElementById('vuelo_id').value = e.target.value;
});

// Manejar submit del formulario
formNuevaReservacion.addEventListener('submit', (e) => {
    e.preventDefault();

    const pasajero_id = document.getElementById('pasajero_id').value;
    const vuelo_id = document.getElementById('vuelo_id').value;
    const clase = document.getElementById('selectClase').value;
    const asiento = document.getElementById('inAsiento').value;
    const metodo_pago = document.getElementById('selectMetodoPago').value;
    const total = document.getElementById('inTotal').value;

    if (!pasajero_id || !vuelo_id || !asiento || !total) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    fetch('/nuevaReservacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pasajero_id,
            vuelo_id,
            clase,
            asiento,
            total,
            metodo_pago
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

// Cargar datos al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    cargarPasajeros();
    cargarVuelos();
});
