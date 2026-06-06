const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../../')));

const conexion = mysql.createConnection({
    host: "localhost",
    database: "aeropuerto",
    user: "root",
    password: ""
});

conexion.connect(err => {
    if (err) throw err;
    console.log("Conectado a MySQL (aeropuerto)");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});



// LoOGIN
app.post("/login", (req, res) => {
    const { usuario, password } = req.body;
    const conexionUsuario = mysql.createConnection({
        host: "localhost",
        user: usuario,
        password: password,
        database: "aeropuerto"
    });

    conexionUsuario.connect((err) => {
        if(err){
            return res.status(401).json({ message: "Credenciales incorrectas"});
        }

        let redirect = "";
        if(usuario === "admin_aerolinea"){
            redirect = "../views/admin/admin.html";
        }
        else if(usuario === "empleado_checkin"){
            redirect = "../views/empleado/empleado.html";
        }
        else if(usuario === "consulta_publica"){
            redirect = "../views/usuario/usuario.html";
        }

        conexionUsuario.end();
        res.json({success: true, redirect});
    });
});

// USUARIO NORMAL
app.get('/viewVuelos', (req, res) => {
    conexion.query('SELECT * FROM vuelos_al_dia', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});


// EMPLEADO
app.get('/pasajerosRegis', (req, res) => {
    conexion.query('SELECT COUNT(DISTINCT pasaporte) as cantidad FROM pasajeros;', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/reservacionesActivas', (req, res) => {
    conexion.query('SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones WHERE DATE(fecha_reservacion) >= CURDATE();', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/reservacionesHoy', (req, res) => {
    conexion.query('SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones WHERE DATE(fecha_reservacion) = CURDATE();', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/checkInPendientes', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones WHERE estado = 'Pendiente';", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});


app.get('/cantClientesVIP', (req, res) => {
    conexion.query("SELECT COUNT(*) as cantidad FROM pasajeros_frequentes;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/cantGanancias', (req, res) => {
    conexion.query("SELECT SUM(precio) AS ganancias FROM reservaciones WHERE estado = 'Confirmada';", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/nacionalidades', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT nacionalidad) as nacionalidades FROM pasajeros;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/viewPasajeros', (req, res) => {
    conexion.query("SELECT * FROM pasajeros WHERE vuelos_acumulados <11;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});


app.post('/nuevoPasajero', (req, res) => {
    const { nombre, apellido, fechaNacimiento, nacionalidad, pasaporte, email, telefono, vuelosAcumulados } = req.body;
    const q = `CALL Add_New_Pasajero(?, ?, ?, ?, ?, ?, ?, ?)`;
    conexion.query(q, [nombre, apellido, fechaNacimiento, nacionalidad, pasaporte, email, telefono, vuelosAcumulados], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Pasajero agregado exitosamente' });
    });
});
app.post('/editarPasajero', (req, res) => {
    const { pasaporte, nombre, apellido, nacionalidad, telefono, email, vuelosAcumulados } = req.body;
    const q = `CALL Update_Pasajero(?, ?, ?, ?, ?, ?, ?)`;
    conexion.query(q, [pasaporte, nombre, apellido, nacionalidad, telefono, email, vuelosAcumulados], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Pasajero modificado exitosamente' });
    });
});

app.get('/clientesVIP', (req, res) => {
    conexion.query("SELECT * FROM pasajeros_frequentes;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});


// ADMIN
app.get('/vuelosHoy', (req, res) => {
    conexion.query('SELECT COUNT(*) as cantidad FROM vuelos_al_dia;', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});/*
app.get('/aeronavesActivas', (req, res) => {
    conexion.query("SELECT COUNT(*) as cantidad FROM aeronaves WHERE estado = 'Activo';", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});*/
app.get('/enMantenimiento', (req, res) => {
    conexion.query("SELECT * FROM aeronaves_en_mantenimiento;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});



app.get('/cantAerolineas', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT nombre) as cantidad FROM aerolineas;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/cantPaises', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT pais_origen) as cantidad FROM aerolineas;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/cantAeronaves', (req, res) => {
    conexion.query("SELECT COUNT(*) as cantidad FROM aeronaves;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/aerolineas', (req, res) => {
    conexion.query("SELECT * FROM aerolineas;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
/*
app.delete('/aerolineas/:id', (req, res) => {
    const id = req.params.id;
    conexion.query('DELETE FROM aerolineas WHERE aerolinea_id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json({ message: 'Aerolínea eliminada exitosamente' });
    });
});
*/
app.post('/editarAerolinea', (req, res) => {
    const { id, nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web } = req.body;
    const q = `CALL update_aerolineas(?, ?, ?, ?, ?, ?)`;
    conexion.query(q, [id, nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Aerolínea modificada exitosamente' });
    });
});
app.post('/nuevaAerolinea', (req, res) => {
    const { nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web } = req.body;
    const q = `CALL add_new_aerolinea( ?, ?, ?, ?, ?)`;
    conexion.query(q, [nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Aerolínea creada exitosamente' });
    });
});

app.get('/aeronavesActivas', (req, res) => {
    conexion.query("SELECT * FROM aeronaves_activas;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/aeronavesNoActivas', (req, res) => {
    conexion.query("SELECT * FROM aeronaves_no_activas;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.post('/editarAeronave', (req, res) => {
    const { aeronave_id, modelo, cap_pasajeros, cap_carga, fabrication, ult_mant, estado } = req.body;
    const q = `CALL update_aeronave(?, ?, ?, ?, ?, ?, ?)`;
    conexion.query(q, [aeronave_id, modelo, cap_pasajeros, cap_carga, fabrication, ult_mant, estado], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Aerolínea modificada exitosamente' });
    });
});
app.post('/nuevaPlane', (req, res) => {
    console.log('req.body');
    const { aerolinea_id, modelo, cap_carga, cap_pasajeros, fabrication, estado, ult_mant } = req.body;
    const q = `CALL add_new_aeronave( ?, ?, ?, ?, ?, ?, ?)`;
    conexion.query(q, [aerolinea_id, modelo, cap_carga, cap_pasajeros, fabrication, estado, ult_mant], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Aerolínea creada exitosamente' });
    });
});


app.get('/rutas', (req, res) => {
    conexion.query("SELECT * FROM rutas;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.post('/editarRutas', (req, res) => {
    const { ruta_id, aeropuerto_origen, aeropuerto_destino, distancia_km, tiempo_estimado_min } = req.body;
    const q = `CALL update_rutas(?, ?, ?, ?, ?)`;
    conexion.query(q, [ruta_id, aeropuerto_origen, aeropuerto_destino, distancia_km, tiempo_estimado_min ], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Ruta modificada exitosamente' });
    });
});
app.post('/nuevaRuta', (req, res) => {
    const { origen, destino, distancia, tiempo } = req.body;
    const q = `CALL create_ruta(?, ?, ?, ?)`;
    conexion.query(q, [origen, destino, distancia, tiempo ], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Ruta creada exitosamente' });
    });
});