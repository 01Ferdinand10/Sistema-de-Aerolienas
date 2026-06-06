const cantVuelosHoy = document.getElementById('cantVuelosHoy');
const cantPasajerosRegis = document.getElementById('cantPasajerosRegis');
const cantAeronavesActivas = document.getElementById('cantAeronavesActivas');
const cantEnMantenimiento = document.getElementById('cantEnMantenimiento');

function getCantVuelosHoy() {
    fetch(`/vuelosHoy`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener vuelos de hoy");
        return res.json();
    })
    .then(data => {
        cantVuelosHoy.textContent = data[0].cantidad;
    })
    .catch(console.error); 
}

function getCantPasajerosRegis() {
    fetch(`/pasajerosRegis`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener pasajeros registrados");
        return res.json();
    })
    .then(data => {
        cantPasajerosRegis.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantAeronavesActivas() {
    fetch(`/aeronavesActivas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener aeronaves activas");
        return res.json();
    })
    .then(data => {
        cantAeronavesActivas.textContent = data.length;
    })
    .catch(console.error); 
}

function getCantEnMantenimiento() {
    fetch(`/enMantenimiento`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener aeronaves en mantenimiento");
        return res.json();
    })
    .then(data => {
        cantEnMantenimiento.textContent = data.length;
    })
    .catch(console.error); 
}

getCantVuelosHoy();
getCantPasajerosRegis();
getCantAeronavesActivas();
getCantEnMantenimiento();