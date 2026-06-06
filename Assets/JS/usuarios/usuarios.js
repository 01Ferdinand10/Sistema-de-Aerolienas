const cantVuelosSalida = document.getElementById("cantVuelosSalida");
const aerolineasDisp = document.getElementById("aerolineasDisp");
const destinosDisp = document.getElementById("destinosDisp");

function getViewVuelos() {
    fetch(`/viewVuelos`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener vuelos");
        return res.json();
    })
    .then(data => {
        const hoy = new Date().toLocaleDateString("en-CA");
        const vuelosSalida = data.filter(v => v.fecha_salida.startsWith(hoy)).length;    
        const cantidad = new Set(data.map(v => v.nombre)).size;
        const destinos = new Set(data.map(v => v.aeropuerto_destino)).size;

        aerolineasDisp.textContent = cantidad;
        cantVuelosSalida.textContent = vuelosSalida;
        destinosDisp.textContent = destinos;
    })
    .catch(console.error);
}
getViewVuelos();