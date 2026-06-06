const cantPasajerosRegis = document.getElementById("cantPasajerosRegis");
const cantReservacionesActivas = document.getElementById("cantReservacionesActivas");
const cantReservacionesHoy = document.getElementById("cantReservacionesHoy");
const cantCheckInPendientes = document.getElementById("cantCheckInPendientes");


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

function getCantReservacionesActivas() {
    fetch(`/reservacionesActivas`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones activas");
        return res.json();
    })
    .then(data => {
        cantReservacionesActivas.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantReservacionesHoy() {
    fetch(`/reservacionesHoy`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener reservaciones de hoy");
        return res.json();
    })
    .then(data => {
        cantReservacionesHoy.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

function getCantCheckInPendientes() {
    fetch(`/checkInPendientes`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener check-ins pendientes");
        return res.json();
    })
    .then(data => {
        cantCheckInPendientes.textContent = data[0].cantidad;
    })
    .catch(console.error);
}

getCantReservacionesActivas();
getCantReservacionesHoy();
getCantCheckInPendientes();
