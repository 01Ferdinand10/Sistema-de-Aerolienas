const viewVuelos = document.getElementById("vuelos");
const vuelosHoy = document.getElementById("vuelosHoy");
const vuelosRetrasados = document.getElementById("vuelosRetrasados");
const vuelosProgramados = document.getElementById("vuelosProgramados");
const vuelosCompletados = document.getElementById("vuelosCompletados");

let vuelos = [];


function getVuelosRetrasados() {
    fetch('/VuelosRetrasados')
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener vuelos retrasados");
        return res.json();
    })
    .then(data => {
        vuelosRetrasados.textContent = data[0].vuelos;
    })
    .catch(console.error);
}
function getVuelosHoy(){
    fetch('/VuelosHoy')
    .then(res =>{
        if(!res.ok) throw new Error("Error al obtener los vuelos de hoy");
        return res.json();
    })
    .then(data =>{
        vuelosHoy.textContent = data[0].vuelos;
    })
}
function getVuelosProgramados() {
    fetch('/VuelosProgramados')
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener vuelos programados");
        return res.json();
    })
    .then(data => {
        console.log(data);
        vuelosProgramados.textContent = data[0].vuelos;
    })
    .catch(console.error);
}
function getVuelosCompletados(){
    fetch('/VuelosCompletados')
    .then(res => {
        if(!res.ok) throw new Error("Error al obtener vuelos completados");
        return res.json();
    })
    .then(data =>{
        vuelosCompletados.textContent = data[0].vuelos;
    })
    .catch(console.error);
}


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
        const db = new Date(vuelo.fecha_salida);//date begin
        const de = new Date(vuelo.fecha_llegada) //date end
        const salida = isNaN(db) ? rawDate : db.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: "2-digit", minute: "2-digit"});       
        const llegada = isNaN(de) ? rawDate : de.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric',hour: "2-digit", minute: "2-digit"});       
         // const salida = new Date(vuelo.fecha_salida).toLocaleTimeString("es-MX", {hour: "2-digit", minute: "2-digit"});
        // const llegada = new Date(vuelo.fecha_llegada).toLocaleTimeString("es-MX", {hour: "2-digit", minute: "2-digit"});
        const nombre = vuelo.nombre;
        const vuelo_id = vuelo.vuelo_id;
        
        console.log(vuelo.modelo);

        viewVuelos.innerHTML += `
        <tr>
            <td>${nombre}</td>
            <td>${vuelo.origen} -> ${vuelo.destino}</td>
            <td>${vuelo.aeronave}</td>  
            <td>${salida}</td>
            <td>${llegada}</td>
            <td>${vuelo.puerta}</td>
            <td>
                <span class="status ${vuelo.estado === "Aterrizado" ? "aterrizado" : vuelo.estado === "Cancelado" ? "cancelado" : vuelo.estado === "Retrasado" ? "retrasado" : "programado"}">
                    ${vuelo.estado}
                </span>
            </td>
                <td>
                <button class="btn-edit">
                    <i class="fa-solid fa-pen"></i>
                </button>
            </td>
        </tr>
        `;
    });
}

function getViewVuelos() {
    fetch(`/Vuelos_info`)
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener vuelos");
        return res.json();
    })
    .then(data => {
        renderVuelos(data);
    })
    .catch(console.error);
}


getViewVuelos();
getVuelosHoy();
getVuelosRetrasados();
getVuelosProgramados(); 
getVuelosCompletados();

function setStats(datos) {
    const hoy = new Date().toLocaleDateString("en-CA");
}

