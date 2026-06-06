const viewVuelos = document.getElementById("vuelos");
let vuelos = [];

function renderVuelos(datos) {
    viewVuelos.innerHTML = "";
    if (!datos || datos.length === 0) {
        viewVuelos.innerHTML = `
        <div style="display:flex; justify-content:center; align-items:center; height:100%;">
            <p>No hay vuelos disponibles.</p>
        </div>`;
        return;
    }

    datos.forEach(vuelo => {
        const salida = new Date(vuelo.fecha_salida).toLocaleTimeString("es-MX", {hour: "2-digit", minute: "2-digit"});
        const llegada = new Date(vuelo.fecha_llegada_real).toLocaleTimeString("es-MX", {hour: "2-digit", minute: "2-digit"});

        viewVuelos.innerHTML += `
        <tr>
            <td>${vuelo.puerta_embarque}</td>
            <td>${vuelo.nombre}</td>
            <td>${vuelo.aeropuerto_origen}</td>
            <td>${vuelo.aeropuerto_destino}</td>
            <td>${salida}</td>
            <td>${llegada}</td>
            <td>
                <span class="status ${vuelo.estado === "Aterrizado" ? "aterrizado" : vuelo.estado === "Cancelado" ? "cancelado" : vuelo.estado === "Retrasado" ? "retrasado" : "programado"}">
                    ${vuelo.estado}
                </span>
            </td>
        </tr>
        `;
    });
}

function getViewVuelos() {
    fetch(`/viewVuelos`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener vuelos");
        return res.json();
    })
    .then(data => {
        vuelos = data;
        renderVuelos(vuelos);
        setStats(vuelos);
    })
    .catch(console.error);
}
getViewVuelos();


const cantVuelosSalida = document.getElementById("cantVuelosSalida");
const cantVuelosLlegada = document.getElementById("cantVuelosLlegada");
const cantVuelosRetrasados = document.getElementById("cantVuelosRetrasados");

function setStats(datos) {
        const hoy = new Date().toLocaleDateString("en-CA");
        const vuelosSalida = datos.filter(v => v.fecha_salida.startsWith(hoy)).length;
        const vuelosLlegada = datos.filter(v => v.fecha_llegada_real.startsWith(hoy)).length;
        const vuelosRetrasados = datos.filter(v => v.estado === "Retrasado").length;

        cantVuelosSalida.textContent = vuelosSalida;
        cantVuelosLlegada.textContent = vuelosLlegada;
        cantVuelosRetrasados.textContent = vuelosRetrasados;
}

const buscador = document.getElementById("buscador");
buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();

    const filtrados = vuelos.filter(vuelo =>
        vuelo.nombre.toLowerCase().includes(texto) ||
        vuelo.aeropuerto_origen.toLowerCase().includes(texto) ||
        vuelo.aeropuerto_destino.toLowerCase().includes(texto)
    );

    renderVuelos(filtrados);
    setStats(filtrados);
});