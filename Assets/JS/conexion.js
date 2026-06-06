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
    password: "porQsoy.batm4n"
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



//ADMIN
app.get('/Vuelos_info', (req, res) =>{
    conexion.query('SELECT * FROM vuelo_linea', (err, rows) =>{
        if(err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/VuelosRetrasados', (req, res) => {
    conexion.query('SELECT COUNT(*) as vuelos FROM vuelos WHERE estado = "Retrasado"', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/VuelosProgramados', (req, res) => {
    conexion.query('SELECT COUNT(*) as vuelos FROM vuelos WHERE estado = "Programado"', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/VuelosCancelados', (req, res) => {
    conexion.query('SELECT COUNT(*) as vuelos FROM vuelos WHERE estado = "Cancelado"', (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/VuelosCompletados', (req, res) => {
    conexion.query('SELECT COUNT(*) as vuelos FROM vuelos WHERE estado = "Completado"', (err, rows) => {
        if (err) return err.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/VuelosHoy', (req, res)=>{
    conexion.query('SELECT COUNT(*) as vuelos FROM vuelos WHERE DATE(fecha_salida) = CURDATE()', (err, rows) =>{
        if(err) return err.status(500).json({ message: 'Error' });
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
    conexion.query("SELECT pasaporte, nombre, apellido, nacionalidad, telefono, email, programa_fidelidad, vuelos_acumulados FROM pasajeros;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/viewReservacion', (req, res) => {
    conexion.query("SELECT * FROM reservacion_ruta;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/reservacionesTotales', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/reservacionesPagadas', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones WHERE estado = 'Confirmada';", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/reservacionesPendientes', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones WHERE estado = 'Pendiente';", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.get('/reservacionesCanceladas', (req, res) => {
    conexion.query("SELECT COUNT(DISTINCT reservacion_id) as cantidad FROM reservaciones WHERE estado = 'Cancelada';", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});
app.post('/nuevaReservacion', (req, res) => {
    const { pasajero_id, vuelo_id, clase, asiento, metodo_pago, total } = req.body;
    
    if (!pasajero_id || !vuelo_id || !asiento || !total) {
        return res.status(400).json({ message: 'Faltan campos requeridos' });
    }
    
    // Verificar si el asiento ya está reservado
    conexion.query("SELECT * FROM reservaciones WHERE vuelo_id = ? AND asiento = ?", [vuelo_id, asiento], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al verificar asiento' });
        }
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Asiento ya reservado para este vuelo' });
        }
        
        // Si no está reservado, insertar la reservación
        const q = `CALL ingresar_reservacion(?, ?, ?, ?, ?, ?)`;
        conexion.query(q, [pasajero_id, vuelo_id, clase, asiento, total, metodo_pago], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: err.sqlMessage });
            }
            res.json({ message: 'Reservación creada exitosamente' });
        });
    });
});

app.post('/editarReservacion', (req, res) => {

    const { reservacion_id, pasajero_id, vuelo_id, clase, asiento, total, estado } = req.body;

    conexion.query("SELECT * FROM reservaciones WHERE vuelo_id = ? AND asiento = ? AND reservacion_id != ?", [vuelo_id, asiento, reservacion_id], (err, rows) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error al verificar asiento' });
    }
    if (rows.length > 0) {
        return res.status(400).json({ message: 'Asiento ya reservado para este vuelo' });
    }

    const q = `CALL Check_in_reservacion(?, ?, ?, ?, ?, ?, ?)`;
    conexion.query(q, [reservacion_id, pasajero_id, vuelo_id, clase, asiento, total, estado], (err, rows) => {
        if (err) {
            console.error(err);
    return res.status(500).json({
        message: err.sqlMessage
    });
        }
        res.json({ message: 'Reservación actualizada exitosamente' });
    });
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


app.get('/obtenerPasajeros', (req, res) => {
    conexion.query("SELECT pasajero_id, nombre, apellido FROM pasajeros ORDER BY nombre ASC;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/obtenerAerolineas', (req, res) => {
    conexion.query("SELECT aerolinea_id, nombre FROM aerolineas ORDER BY nombre ASC;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/obtenerRutas', (req, res) => {
    conexion.query("SELECT ruta_id, aeropuerto_origen, aeropuerto_destino FROM rutas ORDER BY aeropuerto_origen ASC;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/obtenerAeronaves', (req, res) => {
    conexion.query("SELECT aeronave_id, modelo FROM aeronaves ORDER BY modelo ASC;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});

app.get('/obtenerVuelos', (req, res) => {
    const q = `SELECT v.vuelo_id, a.codigo_IATA, r.aeropuerto_origen, r.aeropuerto_destino, v.fecha_salida
    FROM vuelos AS v
    JOIN aerolineas AS a ON v.aerolinea_id = a.aerolinea_id
    JOIN rutas AS r ON v.ruta_id = r.ruta_id
    WHERE v.fecha_salida >= NOW()
    ORDER BY v.fecha_salida ASC`;
    conexion.query(q, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});


app.post('/nuevoVuelo', (req, res) => {
    const { aerolinea_id, ruta_id, aeronave_id, fecha_salida, fecha_llegada_real, puerta_embarque, asientos_disponibles } = req.body;
    if (!aerolinea_id || !ruta_id || !aeronave_id || !fecha_salida || !fecha_llegada_real || !puerta_embarque || !asientos_disponibles) {
        return res.status(400).json({ message: 'Faltan datos para crear el vuelo' });
    }
    const q = `INSERT INTO vuelos (aerolinea_id, ruta_id, aeronave_id, fecha_salida, fecha_llegada_estimada, fecha_llegada_real, puerta_embarque, estado, asientos_disponibles)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'Programado', ?)`;
    conexion.query(q, [aerolinea_id, ruta_id, aeronave_id, fecha_salida, fecha_llegada_real, fecha_llegada_real, puerta_embarque, asientos_disponibles], (err, result) => {
        if (err) return res.status(500).json({ message: err.sqlMessage || 'Error al crear el vuelo' });
        res.json({ message: 'Vuelo creado exitosamente', vuelo_id: result.insertId });
    });
});

app.get('/clientesVIP', (req, res) => {
    conexion.query("SELECT * FROM pasajeros_frequentes;", (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json(rows);
    });
});