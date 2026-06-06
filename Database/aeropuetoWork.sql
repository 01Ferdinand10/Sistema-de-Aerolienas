USE aeropuerto;

SET SQL_SAFE_UPDATES = 0;

SHOW GRANTS FOR 'admin_aerolinea'@'localhost';
SHOW GRANTS FOR 'empleado_checkin'@'localhost';
SHOW GRANTS FOR 'consulta_publica'@'localhost';

SELECT * FROM mysql.user;
SELECT * FROM pasajeros;
SELECT * FROM aerolineas;
SELECT * FROM reservaciones;
SELECT * FROM vuelos;

SELECT * FROM pasajeros_frequentes;

DELIMITER ##
CREATE PROCEDURE ingresar_reservacion(
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



CREATE VIEW `reservacion_ruta` AS 
SELECT re.reservacion_id, p.nombre, p.apellido, r.aeropuerto_origen AS origen, r.aeropuerto_destino AS destino, re.fecha_reservacion AS fecha, re.asiento , re.precio, re.estado, re.pasajero_id, re.vuelo_id
FROM reservaciones AS re
JOIN pasajeros AS p ON re.pasajero_id = p.pasajero_id
JOIN vuelos AS v ON v.vuelo_id = re.vuelo_id
JOIN rutas AS r ON r.ruta_id = v.ruta_id;

DROP VIEW reservacion_ruta;
SELECT Add_New_Pasajero;

CREATE VIEW `vuelo_linea` AS
	SELECT v.vuelo_id, al.nombre, an.modelo AS aeronave, r.aeropuerto_origen AS origen, r.aeropuerto_destino AS destino, v.fecha_salida, v.fecha_llegada_real AS fecha_llegada, 
    v.puerta_embarque AS puerta, v.estado FROM vuelos AS v
	JOIN aerolineas AS al ON al.aerolinea_id = v.aerolinea_id
    JOIN rutas AS r ON r.ruta_id = v.ruta_id
    JOIN aeronaves AS an ON v.aeronave_id = an.aeronave_id
    WHERE fecha_salida >= CURDATE();
-- drop view vuelo_linea;

DELIMITER ##
CREATE PROCEDURE `insertar_vuelo`(
	IN p_aerolinea_id INT,
    IN p_ruta_id INT,
    IN p_aeronave_id INT,
    IN p_fecha_salida TIMESTAMP,
    IN p_fecha_llegada TIMESTAMP,
    IN p_puerta VARCHAR(5),
    IN p_asientos INT)
BEGIN
	IF (fecha_salida <> fecha_llegada AND fecha_salida >= CURRENT_TIMESTAMP()) THEN
		INSERT INTO vuelos (aerolinea_id, ruta_id, aeronave_id, fecha_salida, fecha_llegada_estimada, fecha_llegada_real, puerta_embarque, estado, asientos_disponibles)
        VALUES(p_aerolinea_id, p_ruta_id, p_aeronave_id, fecha_salida, p_fecha_llegada, p_fecha_llegada, p_puerta, 'Programado', p_asientos);
	END IF;
END##
    
/*
CREATE VIEW `vuelos_aerolinea` AS
	SELECT puerta_embarque, a.nombre, r.aeropuerto_origen, aeropuerto_destino, fecha_salida, fecha_llegada_real, estado 
	FROM vuelos JOIN aerolineas a USING(aerolinea_id) JOIN rutas USING(ruta_id) WHERE DATE(fecha_salida) = CURDATE() OR DATE(fecha_llegada_real) = CURDATE();
/*
#SELECT * FROM vuelos WHERE DATE(fecha_salida) = CURDATE();
#DROP VIEW vuelo_linea;
    
SELECT * FROM vuelos;
SELECT * FROM vuelos_al_dia;




INSERT INTO vuelos (aerolinea_id, ruta_id, aeronave_id, fecha_salida, fecha_llegada_estimada, fecha_llegada_real, puerta_embarque, estado, asientos_disponibles)
VALUES (
5, 6, 1, '2026-07-14 19:00:00' , '2026-08-05 18:00:00', '2026-08-05 18:00:00', 'A8', 'Completado', 20);