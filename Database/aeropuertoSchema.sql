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
	IN p_pasajero_id INT,
    IN p_vuelo_id INT,
    IN p_clase VARCHAR(50),
    IN p_asiento VARCHAR(5),
    IN p_precio INT,
    IN p_metodo_pago VARCHAR(50)
)
BEGIN
    DECLARE num_asientos INT;
    DECLARE p_reservacion_id INT;
	SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
	START TRANSACTION;
    SELECT asientos_disponibles INTO num_asientos FROM vuelos WHERE vuelo_id = p_vuelo_id;
		IF num_asientos >= 1 THEN 
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



-- DROP PROCEDURE check-in-reservacion;
DELIMITER ##
CREATE PROCEDURE `Check_in_reservacion`(
	IN p_reservacion_id INT,
	IN p_pasajero_id INT,
    IN p_vuelo_id INT,
    IN p_clase VARCHAR(50),
    IN p_asiento VARCHAR(5),
    IN p_monto INT,
    IN p_estado VARCHAR(50))
BEGIN

    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
	START TRANSACTION;
		/*IF NOT EXISTS (SELECT reservacion_id WHERE reservacion_id = p_reservacion_id) THEN 
			E
		ELSE*/
			UPDATE reservaciones SET pasajero_id = p_pasajero_id,
									vuelo_id = p_vuelo_id, 
									clase = p_clase, 
                                    asiento = p_asiento, 
                                    estado = p_estado, 
                                    precio = p_monto,
									fecha_reservacion = CURRENT_TIMESTAMP()
            WHERE reservacion_id = p_reservacion_id;
			UPDATE registro_pagos SET monto = p_monto,
                                      fecha_pago = CURRENT_TIMESTAMP()
			WHERE reservacion_id = p_reservacion_id;
		#END IF;
	COMMIT;
END ##
DELIMITER ;
-- DROP PROCEDURE Check_in_reservacion;


-- VIEWS
CREATE VIEW pasajeros_frequentes AS
SELECT * FROM pasajeros WHERE vuelos_acumulados>10;

CREATE VIEW vuelos_al_dia AS 
SELECT puerta_embarque, a.nombre, aeropuerto_origen, aeropuerto_destino, fecha_salida, fecha_llegada_real, estado 
FROM vuelos JOIN aerolineas a USING(aerolinea_id) JOIN rutas USING(ruta_id) WHERE DATE(fecha_salida) = CURDATE() OR DATE(fecha_llegada_real) = CURDATE();


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





