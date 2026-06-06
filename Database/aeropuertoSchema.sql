CREATE DATABASE  IF NOT EXISTS aeropuerto CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- DROP DATABASE aeropuerto;

USE aeropuerto;



-- TABLAS ----------------------------------------------
CREATE TABLE IF NOT EXISTS aerolineas(
    aerolinea_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    codigo_IATA VARCHAR(3) NOT NULL,
    pais_origen VARCHAR(50) NOT NULL,
    fecha_fundacion DATE NOT NULL,
    sitio_web VARCHAR(1000) NOT NULL
);

CREATE TABLE IF NOT EXISTS aeronaves(
	aeronave_id INT PRIMARY KEY AUTO_INCREMENT,
    aerolinea_id INT NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    capacidad_carga FLOAT NOT NULL,
    capacidad_pasajeros INT NOT NULL,
    fecha_fabricacion YEAR NOT NULL,
    ultimo_mantenimiento DATE NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha_retorno DATE,
	FOREIGN KEY (aerolinea_id) REFERENCES aerolineas(aerolinea_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS rutas(
	ruta_id INT PRIMARY KEY AUTO_INCREMENT,
    aeropuerto_origen VARCHAR(3) NOT NULL,
    aeropuerto_destino VARCHAR(3) NOT NULL,
    distancia_km FLOAT NOT NULL,
    tiempo_estimado_min INT NOT NULL
);

CREATE TABLE IF NOT EXISTS vuelos(
	vuelo_id INT PRIMARY KEY AUTO_INCREMENT,
    aerolinea_id INT NOT NULL,
    ruta_id INT NOT NULL,
    aeronave_id INT NOT NULL,
    fecha_salida TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_llegada_estimada TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_llegada_real TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    puerta_embarque VARCHAR(5) NOT NULL,
    estado VARCHAR(50) NOT NULL,
	asientos_disponibles INT NOT NULL DEFAULT 10,
    FOREIGN KEY (aerolinea_id) REFERENCES aerolineas(aerolinea_id) ON DELETE RESTRICT,
    FOREIGN KEY (aeronave_id) REFERENCES aeronaves(aeronave_id) ON DELETE RESTRICT, 
    FOREIGN KEY (ruta_id) REFERENCES rutas(ruta_id) ON DELETE RESTRICT 
);

CREATE TABLE IF NOT EXISTS pasajeros(
	pasajero_id INT PRIMARY KEY AUTO_INCREMENT,
    pasaporte VARCHAR(50) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nacionalidad VARCHAR(50) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    programa_fidelidad VARCHAR(50) NOT NULL,
    vuelos_acumulados INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tripulacion(
	empleado_id INT PRIMARY KEY AUTO_INCREMENT,
    aerolinea_id INT NOT NULL,
    licencia INT NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    puesto VARCHAR(50) NOT NULL,
    fecha_contratacion DATE NOT NULL,
    horas_vuelo INT NOT NULL DEFAULT 0,
    FOREIGN KEY (aerolinea_id) REFERENCES aerolineas(aerolinea_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reservaciones(
	reservacion_id INT PRIMARY KEY AUTO_INCREMENT,
    vuelo_id INT NOT NULL,
    pasajero_id INT NOT NULL,
    clase VARCHAR(50) NOT NULL,
    asiento VARCHAR(5) NOT NULL,
    fecha_reservacion TIMESTAMP NOT NULL,
    estado VARCHAR(50) NOT NULL,
    precio INT NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    FOREIGN KEY (vuelo_id) REFERENCES vuelos(vuelo_id) ON DELETE RESTRICT,
	FOREIGN KEY (pasajero_id) REFERENCES pasajeros(pasajero_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tripulacion_vuelo(
	vuelo_id INT NOT NULL,
    empleado_id INT NOT NULL,
    rol VARCHAR(500) NOT NULL,	
    PRIMARY KEY (vuelo_id, empleado_id),
    FOREIGN KEY (vuelo_id) REFERENCES vuelos(vuelo_id) ON DELETE RESTRICT,
    FOREIGN KEY (empleado_id) REFERENCES tripulacion(empleado_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS notificaciones(
    vuelo_id INT NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    FOREIGN KEY (vuelo_id) REFERENCES vuelos(vuelo_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS registro_pagos(
	pago_id INT PRIMARY KEY AUTO_INCREMENT,
    reservacion_id INT NOT NULL,
    monto INT NOT NULL,
    fecha_pago TIMESTAMP,
    metodo_pago VARCHAR(50) NOT NULL,
    FOREIGN KEY (reservacion_id) REFERENCES reservaciones(reservacion_id) ON DELETE RESTRICT
);

-- TRIGGERS
DELIMITER $$
CREATE TRIGGER pasajeros_before_insert
BEFORE INSERT ON pasajeros
FOR EACH ROW
BEGIN
	IF NEW.vuelos_acumulados > 19 THEN 
		SET NEW.programa_fidelidad = 'Oro';
	ELSEIF NEW.vuelos_acumulados > 9 THEN 
		SET NEW.programa_fidelidad = 'Plata';
	ELSE 
		SET NEW.programa_fidelidad = 'Bronce';
	END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER pasajeros_before_update
BEFORE UPDATE ON pasajeros
FOR EACH ROW
BEGIN
	IF OLD.vuelos_acumulados <> NEW.vuelos_acumulados  THEN
		IF NEW.vuelos_acumulados > 19 THEN
			SET NEW.programa_fidelidad = 'Oro';
		ELSEIF NEW.vuelos_acumulados > 9 THEN
			SET NEW.programa_fidelidad = 'Plata';
		ELSE
			SET NEW.programa_fidelidad = 'Bronce';
		END IF;
	END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER aeronaves_beforer_update
BEFORE UPDATE ON aeronaves
FOR EACH ROW
BEGIN
	IF OLD.ultimo_mantenimiento <> NEW.ultimo_mantenimiento  THEN
		IF DATEDIFF(CURDATE(), NEW.ultimo_mantenimiento)>20 THEN
			SET NEW.estado = 'Mantenimiento';
		ELSE
			SET NEW.estado = 'Activo';
		END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER vuelos_after_update
AFTER UPDATE ON vuelos
FOR EACH ROW
BEGIN
	IF OLD.fecha_llegada_real <> NEW.fecha_llegada_real  THEN
		IF TIMESTAMPDIFF(MINUTE, NEW.fecha_llegada_estimada, NEW.fecha_llegada_real)>15 THEN
			INSERT INTO notificaciones (vuelo_id, nombre, email) SELECT r.vuelo_id, p.nombre, p.email FROM reservaciones r JOIN pasajeros p USING(pasajero_id) WHERE r.vuelo_id = NEW.vuelo_id;
		END IF;
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER reservaciones_after_insert
AFTER INSERT ON reservaciones
FOR EACH ROW
BEGIN
	UPDATE pasajeros SET vuelos_acumulados = vuelos_acumulados+1 WHERE pasajero_id = NEW.pasajero_id;
    UPDATE pasajeros SET programa_fidelidad = 
		CASE
			WHEN vuelos_acumulados >2 THEN 'Oro'
			WHEN vuelos_acumulados >1 THEN 'Plata'
			ELSE 'Bronce'
		END
		WHERE pasajero_id = NEW.pasajero_id; 
END$$
DELIMITER ;

-- TRANSACCIONES
DELIMITER ##
CREATE PROCEDURE `ingresar_reservacion`(
    IN p_vuelo_id INT,
    IN p_clase VARCHAR(50),
    IN p_asiento VARCHAR(5),
    IN p_pasaporte INT,
    IN p_precio INT,
    IN p_estado VARCHAR(50),
    IN p_metodo_pay VARCHAR(50)
)
BEGIN
	DECLARE p_pasajero_id INT;
    DECLARE num_asientos INT;
    DECLARE p_reservacion_id INT;
	SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
	START TRANSACTION;
		SELECT asientos_disponibles INTO num_asientos FROM vuelos WHERE vuelo_id = p_vuelo_id;
        SELECT pasajero_id INTO p_pasajero_id FROM pasajeros WHERE pasaporte = p_pasaporte;

		IF num_asientos > 1 THEN 
			INSERT INTO reservaciones (vuelo_id, pasajero_id, clase, asiento, fecha_reservacion, estado, precio, metodo_pago) VALUES(
			p_vuelo_id, p_pasajero_id, p_clase, p_asiento, CURRENT_TIMESTAMP, 'Confirmada' , p_precio, p_metodo_pago);
            
            UPDATE vuelos SET asientos_disponibles = asientos_disponibles -1 WHERE vuelo_id = p_vuelo_id;
            SET p_reservacion_id = LAST_INSERT_ID();
            INSERT INTO registro_pagos (reservacion_id, monto, fecha_pago, metodo_pago) VALUES(
            p_reservacion_id, p_precio, CURRENT_TIMESTAMP, p_metodo_pago);
		ELSE 
			INSERT INTO reservaciones (vuelo_id, pasajero_id, clase, asiento, fecha_reservacion, estado, precio, metodo_pago) VALUES(
			p_vuelo_id, p_pasajero_id, p_clase, p_asiento, CURRENT_TIMESTAMP, 'Canceladda' , p_precio, p_metodo_pago);
        END IF;
	COMMIT;
END##
DELIMITER ;

DELIMITER ##
CREATE PROCEDURE `Check-in-reservacion`(IN p_reservacion_id INT, OUT message VARCHAR(10))
BEGIN

    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
	START TRANSACTION;
		IF NOT EXISTS (SELECT reservacion_id WHERE reservacion_id = p_reservacion_id) THEN 
			SET message = "Referencia no valida, intente de nuevo";
		ELSE
			SET message = "Check in completado exitosamente";
			UPDATE reservaciones SET estado = "Utilizada" WHERE reservacion_id = p_reservacion_id;
		END IF;
	COMMIT;
END ##
DELIMITER ;

-- VIEWS
CREATE VIEW aeronaves_en_mantenimiento AS
SELECT * FROM aeronaves WHERE estado = 'Mantenimiento';

CREATE VIEW pasajeros_frequentes AS
SELECT * FROM pasajeros WHERE vuelos_acumulados>10;

CREATE VIEW vuelos_al_dia AS 
SELECT puerta_embarque, a.nombre, aeropuerto_origen, aeropuerto_destino, fecha_salida, fecha_llegada_real, estado 
FROM vuelos JOIN aerolineas a USING(aerolinea_id) JOIN rutas USING(ruta_id) WHERE DATE(fecha_salida) = CURDATE() OR DATE(fecha_llegada_real) = CURDATE();

CREATE VIEW aeronaves_activas AS
SELECT aeronave_id, nombre, modelo,  capacidad_pasajeros, capacidad_carga, fecha_fabricacion, ultimo_mantenimiento, estado FROM aeronaves LEFT JOIN aerolineas USING(aerolinea_id) WHERE estado = 'Activo';

CREATE VIEW aeronaves_no_activas AS
SELECT aeronave_id, nombre, modelo,  capacidad_pasajeros, capacidad_carga, fecha_fabricacion, ultimo_mantenimiento, estado FROM aeronaves LEFT JOIN aerolineas USING(aerolinea_id) WHERE estado != 'Activo';

-- PROCEDURES
DELIMITER $$
CREATE PROCEDURE Add_New_Pasajero(
	IN nombre VARCHAR(50), 
	IN apellido VARCHAR(50), 
	IN fechaNacimiento DATE, 
	IN nacionalidad VARCHAR(50), 
	IN pasaport VARCHAR(50), 
	IN correo VARCHAR(50), 
	IN tel VARCHAR(50), 
	IN vuelosAcumulados INT)
BEGIN
	IF nombre IS NULL OR nombre = '' OR apellido IS NULL OR apellido = '' OR fechaNacimiento IS NULL OR nacionalidad IS NULL OR nacionalidad = '' OR pasaport IS NULL OR pasaport = '' OR correo IS NULL OR correo = '' OR tel IS NULL OR tel = ''
		THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
	END IF;

	IF TIMESTAMPDIFF(YEAR, fechaNacimiento, CURDATE()) < 18 OR fechaNacimiento > CURDATE() THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'La fecha de nacimiento no es válida';
	END IF;
	
	IF pasaport IN (SELECT pasaporte FROM pasajeros) OR correo IN (SELECT email FROM pasajeros) OR tel IN (SELECT telefono FROM pasajeros) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Pasaporte, Telefono o Correo ya Registrado';
	END IF;
    
    IF vuelosAcumulados<0 THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Valor de vuelos incorrecto';
	END IF;
	
	INSERT INTO pasajeros (pasaporte, nombre, apellido, fecha_nacimiento, nacionalidad, telefono, email, vuelos_acumulados)
	VALUES (pasaport, nombre, apellido, fechaNacimiento, nacionalidad, tel, correo, vuelosAcumulados);
	
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE Update_Pasajero(
	IN p_pasaporte VARCHAR(50),
	IN p_nombre VARCHAR(50),
	IN p_apellido VARCHAR(50),
	IN p_nacionalidad VARCHAR(50),
	IN p_tel VARCHAR(50),
	IN p_correo VARCHAR(50),
	IN p_vuelosAcumulados INT)
BEGIN
	IF p_nombre IS NULL OR p_nombre = '' OR p_apellido IS NULL OR p_apellido = '' OR p_nacionalidad IS NULL OR p_nacionalidad = '' OR p_correo IS NULL OR p_correo = '' OR p_tel IS NULL OR p_tel = ''
		THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
	END IF;
	
	IF p_correo IN (SELECT email FROM pasajeros WHERE pasaporte != p_pasaporte) OR p_tel IN (SELECT telefono FROM pasajeros WHERE pasaporte != p_pasaporte) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Correo o Teléfono ya registrado';
	END IF;
	
	IF p_vuelosAcumulados<0 THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Valor de vuelos incorrecto';
	END IF;
    
	UPDATE pasajeros SET
		nombre = p_nombre,
		apellido = p_apellido,
		nacionalidad = p_nacionalidad,
		telefono = p_tel,
		email = p_correo,
		vuelos_acumulados = p_vuelosAcumulados
	WHERE pasaporte = p_pasaporte;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE update_aerolineas(
	IN p_id INT,
	IN p_nombre VARCHAR(50),
	IN p_codigo_IATA VARCHAR(3),
	IN p_pais_origen VARCHAR(50),
	IN p_fecha DATE,
	IN p_sitio VARCHAR(1000))
BEGIN
	IF p_nombre IS NULL OR p_nombre = '' OR p_codigo_IATA IS NULL OR p_codigo_IATA = '' OR p_pais_origen IS NULL OR p_pais_origen = '' OR p_sitio IS NULL OR p_sitio = ''
		THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
	END IF;
	
	IF p_nombre IN (SELECT nombre FROM aerolineas WHERE aerolinea_id != p_id) OR p_codigo_IATA IN (SELECT codigo_IATA FROM aerolineas WHERE aerolinea_id != p_id) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Nombre o IATA ya registrado';
	END IF;
	
	IF LENGTH(TRIM(p_codigo_IATA)) > 3 THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Codigo IATA incorrecto';
	END IF;
    
	UPDATE aerolineas SET
		nombre = p_nombre,
		codigo_IATA = p_codigo_IATA,
		pais_origen = p_pais_origen,
		fecha_fundacion = p_fecha,
		sitio_web = p_sitio
	WHERE aerolinea_id = p_id;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE add_new_aerolinea(
	IN p_nombre VARCHAR(50),
	IN p_codigo_IATA VARCHAR(3),
	IN p_pais_origen VARCHAR(50),
	IN p_fecha DATE,
	IN p_sitio VARCHAR(1000))
BEGIN
	IF p_nombre IS NULL OR p_nombre = '' OR p_codigo_IATA IS NULL OR p_codigo_IATA = '' OR p_pais_origen IS NULL OR p_pais_origen = '' OR p_sitio IS NULL OR p_sitio = ''
		THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
	END IF;
	
	IF p_nombre IN (SELECT nombre FROM aerolineas) OR p_codigo_IATA IN (SELECT codigo_IATA FROM aerolineas) THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Nombre o IATA ya registrado';
	END IF;
	
	IF LENGTH(TRIM(p_codigo_IATA)) > 3 THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Codigo IATA incorrecto';
	END IF;
    
	INSERT INTO aerolineas (nombre, codigo_IATA, pais_origen, fecha_fundacion, sitio_web)
    VALUES (p_nombre, p_codigo_IATA, p_pais_origen, p_fecha, p_sitio);

END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE update_aeronave(
	IN p_aeronave_id VARCHAR(50),
	IN p_modelo VARCHAR(50),
    IN p_cap_pasajeros INT,
    IN p_cap_carga FLOAT,
    IN p_fabrication YEAR,
    IN p_ult_mant DATE,
    IN p_estado VARCHAR(50)
)
BEGIN
	IF p_aeronave_id IS NULL OR p_aeronave_id = '' OR p_modelo IS NULL OR p_modelo = '' OR p_cap_pasajeros IS NULL OR p_cap_pasajeros <= 0 OR p_cap_carga IS NULL OR p_cap_carga <= 0 OR p_fabrication IS NULL OR p_fabrication > YEAR(CURDATE()) OR p_ult_mant IS NULL OR p_ult_mant > CURDATE() OR p_estado IS NULL OR p_estado = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Informacion Incorrecta';
    END IF;
    
    UPDATE aeronaves
    SET
        modelo = p_modelo,
        capacidad_pasajeros = p_cap_pasajeros,
        capacidad_carga = p_cap_carga,
        fecha_fabricacion = p_fabrication,
        ultimo_mantenimiento = p_ult_mant,
        estado = p_estado
    WHERE aeronave_id = p_aeronave_id;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE add_new_aeronave(
	IN p_aerolinea_id INT,
	IN p_modelo VARCHAR(50),
	IN p_cap_carga FLOAT,
	IN p_cap_pasajeros INT,
	IN p_fabrication DATE,
    IN p_estado VARCHAR(50),
	IN p_ult_mant DATE
)
BEGIN
	IF p_aerolinea_id IS NULL OR p_modelo IS NULL OR p_modelo = '' OR p_cap_carga IS NULL OR p_cap_pasajeros IS NULL OR p_fabrication IS NULL OR p_estado IS NULL OR p_estado = '' OR p_ult_mant IS NULL THEN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
    END IF;
    
    IF p_cap_carga <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La capacidad de carga debe ser mayor a 0';
    END IF;

    IF p_cap_pasajeros <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La capacidad de pasajeros debe ser mayor a 0';
    END IF;

    IF YEAR(p_fabrication) > YEAR(CURDATE()) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El año de fabricación no puede ser mayor al actual';
    END IF;

    IF p_ult_mant > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La fecha de mantenimiento no puede ser futura';
    END IF;
    
	INSERT INTO aeronaves ( aerolinea_id, modelo, capacidad_carga, capacidad_pasajeros, fecha_fabricacion, ultimo_mantenimiento, estado)
    VALUES ( p_aerolinea_id, p_modelo, p_cap_carga, p_cap_pasajeros, YEAR(p_fabrication), p_ult_mant, p_estado);
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE update_rutas(
	IN p_ruta_id INT, 
	IN p_aeropuerto_origen VARCHAR(50), 
    IN p_aeropuerto_destino VARCHAR(50), 
    IN p_distancia_km FLOAT,
    IN p_tiempo_estimado_min INT
)
BEGIN
	IF p_aeropuerto_origen IS NULL OR p_aeropuerto_origen = '' OR p_aeropuerto_destino IS NULL OR p_aeropuerto_destino = '' OR p_distancia_km IS NULL OR p_tiempo_estimado_min IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
    END IF;
	
    IF (SELECT COUNT(*) FROM rutas WHERE 
		aeropuerto_origen = p_aeropuerto_origen
		AND aeropuerto_destino = p_aeropuerto_destino
		AND distancia_km = p_distancia_km
		AND tiempo_estimado_min = p_tiempo_estimado_min) > 0 THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Ya existe una ruta con los mismos datos';
	END IF;
    
    IF LENGTH(TRIM(p_aeropuerto_origen)) != 3 OR LENGTH(TRIM(p_aeropuerto_destino)) != 3 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Nombre del aeropuerto incorrecto';
    END IF;
        
    IF p_distancia_km <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La distancia debe ser mayor que cero';
    END IF;

    IF p_tiempo_estimado_min <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tiempo estimado debe ser mayor que cero';
    END IF;

    IF p_aeropuerto_origen = p_aeropuerto_destino THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El aeropuerto de origen y destino no pueden ser el mismo';
    END IF;
    
	UPDATE rutas SET 
	aeropuerto_origen = p_aeropuerto_origen, 
	aeropuerto_destino = p_aeropuerto_destino, 
	distancia_km = p_distancia_km, 
	tiempo_estimado_min = p_tiempo_estimado_min 
	WHERE ruta_id = p_ruta_id;
END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE create_ruta(
	IN p_aeropuerto_origen VARCHAR(50), 
    IN p_aeropuerto_destino VARCHAR(50), 
    IN p_distancia_km FLOAT,
    IN p_tiempo_estimado_min INT
)
BEGIN
	IF p_aeropuerto_origen IS NULL OR p_aeropuerto_origen = '' OR p_aeropuerto_destino IS NULL OR p_aeropuerto_destino = '' OR p_distancia_km IS NULL OR p_tiempo_estimado_min IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Todos los campos obligatorios deben ser proporcionados';
    END IF;
	
    IF (SELECT COUNT(*) FROM rutas WHERE 
		aeropuerto_origen = p_aeropuerto_origen
		AND aeropuerto_destino = p_aeropuerto_destino
		AND distancia_km = p_distancia_km
		AND tiempo_estimado_min = p_tiempo_estimado_min) > 0 THEN
			SIGNAL SQLSTATE '45000'
			SET MESSAGE_TEXT = 'Ya existe una ruta con los mismos datos';
	END IF;
    
    IF LENGTH(TRIM(p_aeropuerto_origen)) != 3 OR LENGTH(TRIM(p_aeropuerto_destino)) != 3 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Nombre del aeropuerto incorrecto';
    END IF;
        
    IF p_distancia_km <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La distancia debe ser mayor que cero';
    END IF;

    IF p_tiempo_estimado_min <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El tiempo estimado debe ser mayor que cero';
    END IF;

    IF p_aeropuerto_origen = p_aeropuerto_destino THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'El aeropuerto de origen y destino no pueden ser el mismo';
    END IF;
    
	INSERT INTO rutas (aeropuerto_origen, aeropuerto_destino, distancia_km, tiempo_estimado_min) VALUES
	(p_aeropuerto_origen, p_aeropuerto_destino, p_distancia_km, p_tiempo_estimado_min);
END$$
DELIMITER ;
