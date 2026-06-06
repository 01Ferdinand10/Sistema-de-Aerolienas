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
SELECT * FROM rutas;
SELECT * FROM aeronaves;

SELECT * FROM vuelos_al_dia;
SELECT * FROM aeronaves_en_mantenimiento;

SELECT * FROM aeronaves_activas;
SELECT * FROM aeronaves_no_activas;
DROP PROCEDURE update_rutas;

DELETE FROM aerolineas WHERE aerolinea_id = 13;