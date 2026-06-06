const selectAerolinea = document.getElementById("aerolinea_id");

function cargarAerolineas() {
    fetch('/aerolineas')
        .then(res => res.json())
        .then(datos => {
            selectAerolinea.innerHTML ='<option value="">Seleccionar Aerolínea</option>';

            datos.forEach(aerolinea => {
                const option = document.createElement("option");

                option.value = aerolinea.aerolinea_id;
                option.textContent = aerolinea.nombre;

                selectAerolinea.appendChild(option);
            });
        })
        .catch(console.error);
}
cargarAerolineas();


const nuevaAeronave = document.getElementById("nuevaAeronave");
nuevaAeronave.addEventListener("submit", async (e) => {
    e.preventDefault();
    const aerolinea_id = Number(document.getElementById("aerolinea_id").value);
    const modelo = document.getElementById("modelo").value;
    const cap_carga = Number(document.getElementById("cap_carga").value);
    const cap_pasajeros = Number(document.getElementById("cap_pasajeros").value);
    const fabrication = document.getElementById("fabrication").value;
    const estado = document.getElementById("estado").value;
    const ult_mant = document.getElementById("ult_mant").value;

    console.log(modelo, fabrication);
    fetch('/nuevaPlane', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aerolinea_id, modelo, cap_carga, cap_pasajeros, fabrication, estado, ult_mant })
    })
    .then(async res => {
        if (!res.ok) throw await res.json();
        return res.json();
    })
    .then(data => {
        alert("Aeronave creada exitosamente");
        window.location.href = "../Admin/aeronaves.html";
    })
    .catch(err => {
        alert(err.message);
    });
});