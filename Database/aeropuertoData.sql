USE aeropuerto; 

-- USUARIOS ----------------------------------------------
CREATE USER 'admin_aerolinea'@'localhost' IDENTIFIED BY 'admin123';
CREATE USER 'empleado_checkin'@'localhost' IDENTIFIED BY 'empleado123';
CREATE USER 'consulta_publica'@'localhost' IDENTIFIED BY 'publico123';

GRANT ALL ON *.* TO 'admin_aerolinea'@'localhost' WITH GRANT OPTION;
GRANT SELECT, INSERT, UPDATE ON aeropuerto.reservaciones TO 'empleado_checkin'@'localhost';
GRANT SELECT, INSERT, UPDATE ON  aeropuerto.pasajeros TO 'empleado_checkin'@'localhost';
GRANT SELECT ON aeropuerto.vuelos TO 'consulta_publica'@'localhost';

INSERT INTO aerolineas(nombre,codigo_IATA,pais_origen,fecha_fundacion,sitio_web) VALUES
('Aeromexico','AM','Mexico','1934-09-14','https://www.aeromexico.com'),
('Volaris','Y4','Mexico','2005-03-13','https://www.volaris.com'),
('Viva Aerobus','VB','Mexico','2006-11-30','https://www.vivaaerobus.com'),
('American Airlines','AA','Estados Unidos','1930-04-15','https://www.aa.com'),
('Delta Airlines','DL','Estados Unidos','1929-05-30','https://www.delta.com'),
('United Airlines','UA','Estados Unidos','1926-04-06','https://www.united.com'),
('Air Canada','AC','Canada','1937-04-10','https://www.aircanada.com'),
('Iberia','IB','España','1927-06-28','https://www.iberia.com'),
('Lufthansa','LH','Alemania','1953-01-06','https://www.lufthansa.com'),
('Air France','AF','Francia','1933-10-07','https://www.airfrance.com'),
('British Airways','BA','Reino Unido','1974-03-31','https://www.britishairways.com'),
('LATAM Airlines','LA','Chile','1929-03-05','https://www.latam.com');

INSERT INTO aeronaves(aerolinea_id,modelo,capacidad_pasajeros,capacidad_carga,fecha_fabricacion,ultimo_mantenimiento,estado) VALUES
(1,'Boeing 737-800',189,20.0,2018,'2025-01-15','Activo'),
(2,'Airbus A320',180,19.0,2019,'2025-02-10','Activo'),
(3,'Airbus A321',220,24.0,2020,'2025-01-25','Activo'),
(4,'Boeing 777-300',396,52.0,2017,'2025-03-01','Activo'),
(5,'Airbus A330',300,45.0,2016,'2025-02-14','Activo'),
(6,'Boeing 787 Dreamliner',290,41.0,2021,'2025-02-28','Activo'),
(7,'Airbus A220',145,18.0,2022,'2025-03-10','Activo'),
(8,'Airbus A350',350,55.0,2020,'2025-01-30','Activo'),
(9,'Boeing 747-8',410,76.0,2015,'2025-03-05','Mantenimiento'),
(10,'Airbus A320neo',190,21.0,2023,'2025-02-18','Activo'),
(11,'Boeing 777',350,50.0,2018,'2025-02-22','Activo'),
(12,'Boeing 767',250,39.0,2016,'2025-03-08','Activo');

INSERT INTO rutas(aeropuerto_origen,aeropuerto_destino,distancia_km,tiempo_estimado_min) VALUES
('MEX','CUN',1285,130),
('MEX','GDL',461,75),
('MEX','MTY',705,95),
('CUN','JFK',2500,240),
('LAX','ORD',2805,250),
('YYZ','YVR',3358,300),
('MAD','BCN',505,80),
('FRA','CDG',478,75),
('LHR','MAD',1264,145),
('SCL','LIM',2450,180),
('MEX','LAX',2490,220),
('CUN','MAD',7930,540);

INSERT INTO vuelos(aerolinea_id,ruta_id,aeronave_id,fecha_salida,fecha_llegada_estimada,fecha_llegada_real,puerta_embarque,estado, asientos_disponibles) VALUES
(1,1,1,'2026-06-01 08:00:00','2026-06-01 10:10:00','2026-06-01 10:05:00','A1','Completado', 2),
(2,2,2,'2026-06-01 09:00:00','2026-06-01 10:15:00','2026-06-01 10:20:00','B2','Completado', 2),
(3,3,3,'2026-06-01 11:00:00','2026-06-01 12:35:00','2026-06-01 12:30:00','C1','Completado', 3),
(4,4,4,'2026-06-02 06:00:00','2026-06-02 10:00:00','2026-06-02 10:12:00','D5','Completado', 3),
(5,5,5,'2026-06-02 08:30:00','2026-06-02 12:40:00','2026-06-02 12:35:00','E3','Completado', 4),
(6,6,6,'2026-06-02 07:00:00','2026-06-02 12:00:00','2026-06-02 12:08:00','F1','Completado', 5),
(7,7,7,'2026-06-03 10:00:00','2026-06-03 11:20:00','2026-06-03 11:18:00','G2','Completado', 5),
(8,8,8,'2026-06-03 12:00:00','2026-06-03 13:15:00','2026-06-03 13:22:00','H4','Completado', 7),
(9,9,9,'2026-06-03 14:00:00','2026-06-03 16:25:00','2026-06-03 16:50:00','I3','Retrasado', 7),
(10,10,10,'2026-06-04 09:00:00','2026-06-04 12:00:00','2026-06-04 11:58:00','J1','Completado', 9),
(11,11,11,'2026-06-04 15:00:00','2026-06-04 18:40:00','2026-06-04 18:45:00','K2','Completado', 10),
(12,12,12,'2026-06-05 20:00:00','2026-06-06 05:00:00','2026-06-06 04:55:00','L5','Completado', 11);

INSERT INTO pasajeros(pasaporte,nombre,apellido,fecha_nacimiento,nacionalidad,telefono,email, vuelos_acumulados) VALUES
('100001','Juan','Perez','1990-05-12','Mexicana','449111111','juan@gmail.com', 0),
('100002','Maria','Lopez','1988-03-20','Mexicana','449111112','maria@gmail.com', 10),
('100003','Carlos','Ramirez','1995-09-11','Mexicana','449111113','carlos@gmail.com', 12),
('100004','Ana','Torres','1992-01-30','Española','449111114','ana@gmail.com', 12),
('100005','Luis','Garcia','1985-07-08','Argentina','449111115','luis@gmail.com', 12),
('100006','Laura','Martinez','1998-04-25','Colombiana','449111116','laura@gmail.com', 12),
('100007','Pedro','Hernandez','1993-06-17','Mexicana','449111117','pedro@gmail.com', 12),
('100008','Sofia','Cruz','2000-08-22','Chilena','449111118','sofia@gmail.com', 12),
('100009','Miguel','Flores','1987-12-10','Peruana','449111119','miguel@gmail.com', 12),
('100010','Elena','Ruiz','1991-10-03','Española','449111120','elena@gmail.com', 12),
('100011','Jorge','Diaz','1989-11-14','Mexicana','449111121','jorge@gmail.com', 12),
('100012','Valeria','Morales','1997-02-18','Mexicana','449111122','valeria@gmail.com', 12);

INSERT INTO tripulacion(aerolinea_id,licencia,nombre,apellido,puesto,fecha_contratacion,horas_vuelo) VALUES
(1,5001,'Ricardo','Santos','Piloto','2015-01-01',8500),
(2,5002,'Fernanda','Lopez','Piloto','2017-05-12',6200),
(3,5003,'Diego','Martinez','Copiloto','2018-03-08',4100),
(4,5004,'Robert','Smith','Piloto','2012-07-15',12000),
(5,5005,'James','Brown','Copiloto','2016-02-20',7000),
(6,5006,'Emily','Johnson','Sobrecargo','2019-06-11',2500),
(7,5007,'Michael','Wilson','Piloto','2014-09-01',9800),
(8,5008,'Carmen','Perez','Sobrecargo','2020-01-10',1800),
(9,5009,'Hans','Muller','Piloto','2013-04-18',10500),
(10,5010,'Pierre','Dubois','Copiloto','2017-11-25',5400),
(11,5011,'Swiftie','Taylor','Sobrecargo','2021-05-14',1300),
(12,5012,'Camila','Rojas','Piloto','2018-08-09',5900);

INSERT INTO reservaciones(vuelo_id,pasajero_id,clase,asiento,fecha_reservacion,estado,precio,metodo_pago) VALUES
(1,1,'Economica','12A','2026-05-20 10:00:00','Confirmada',2500,'Tarjeta'),
(2,2,'Economica','14B','2026-05-21 11:00:00','Confirmada',1800,'Tarjeta'),
(3,3,'Ejecutiva','3A','2026-05-21 12:00:00','Confirmada',4500,'Transferencia'),
(4,4,'Primera','1A','2026-05-22 09:00:00','Confirmada',12000,'Tarjeta'),
(5,5,'Economica','18C','2026-05-22 14:00:00','Pendiente',3000,'Efectivo'),
(6,6,'Economica','20D','2026-05-23 08:00:00','Confirmada',3500,'Tarjeta'),
(7,7,'Ejecutiva','4C','2026-05-23 13:00:00','Confirmada',4200,'Transferencia'),
(8,8,'Economica','22A','2026-05-24 10:00:00','Confirmada',2100,'Tarjeta'),
(9,9,'Primera','2B','2026-05-24 15:00:00','Pendiente',9800,'Transferencia'),
(10,10,'Economica','16F','2026-05-25 09:00:00','Confirmada',2700,'Tarjeta'),
(11,11,'Ejecutiva','5D','2026-05-25 11:00:00','Confirmada',5200,'Tarjeta'),
(12,12,'Economica','24E','2026-05-26 16:00:00','Confirmada',2300,'Efectivo');

INSERT INTO reservaciones(vuelo_id,pasajero_id,clase,asiento,fecha_reservacion,estado,precio,metodo_pago) VALUES (12,1,'Economica','24E','2026-05-26 16:00:00','Confirmada',2300,'Efectivo');

INSERT INTO tripulacion_vuelo(vuelo_id,empleado_id,rol) VALUES
(1,1,'Piloto'),
(2,2,'Piloto'),
(3,3,'Copiloto'),
(4,4,'Piloto'),
(5,5,'Copiloto'),
(6,6,'Sobrecargo'),
(7,7,'Piloto'),
(8,8,'Sobrecargo'),
(9,9,'Piloto'),
(10,10,'Copiloto'),
(11,11,'Sobrecargo'),
(12,12,'Piloto');