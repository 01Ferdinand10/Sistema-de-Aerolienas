const nueva_ruta = document.getElementById('nueva_ruta');
nueva_ruta.addEventListener("submit", async (e) => {
    e.preventDefault();
    const origen = document.getElementById("origen").value;
    const destino = document.getElementById("destino").value;
    const distancia = Number(document.getElementById("distancia").value);
    const tiempo = Number(document.getElementById("tiempo").value);
    
    fetch('/nuevaRuta', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origen, destino, distancia, tiempo })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        alert("Ruta creada exitosamente");
        window.location.href = "../Admin/rutas.html";
    })
    .catch(err => {
        alert(err.message);
    });
});