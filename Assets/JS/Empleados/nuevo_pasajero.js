const nuevoPasajero = document.getElementById("nuevoPasajero");

nuevoPasajero.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const nacionalidad = document.getElementById("nacionalidad").value;
    const pasaporte = document.getElementById("pasaporte").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const vuelosAcumulados = Number(document.getElementById("vuelosAcumulados").value)

    console.log({ nombre, apellido, fechaNacimiento, nacionalidad, pasaporte, email, telefono, vuelosAcumulados });
    fetch('/nuevoPasajero', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, fechaNacimiento, nacionalidad, pasaporte, email, telefono, vuelosAcumulados })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        alert(data.message);
        nuevoPasajero.reset();
        window.location.href = "../empleado/pasajeros.html";
    })
    .catch(err => {
        alert(err.message);
    });
});