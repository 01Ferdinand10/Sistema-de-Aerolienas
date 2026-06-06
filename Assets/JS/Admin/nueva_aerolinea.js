const nuevaAerolinea = document.getElementById("nuevaAerolinea");
nuevaAerolinea.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre-aerolinea").value;
    const codigo_IATA = document.getElementById("codigo-iata").value;
    const pais_origen = document.getElementById("pais").value;
    const fecha_fundacion = document.getElementById("fecha-fundacion").value;
    const sitio_web = document.getElementById("sitio-web").value;

    fetch('/nuevaAerolinea', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        alert("Aerolínea creada exitosamente");
        window.location.href = "../Admin/aerolineas.html";
    })
    .catch(err => {
        alert(err.message);
    });
});