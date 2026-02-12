-- Seed script para agregar carreras de la UIDE
-- Primero verificamos/creamos la facultad general si no existe

-- Insertar Facultad General (si no existe)
INSERT IGNORE INTO facultades (nombre_facultad) VALUES ('UIDE - Facultad General');

-- Obtener el ID de la facultad (asumiendo que es el 1, ajustar si es necesario)
SET @id_facultad = (SELECT id_facultad FROM facultades WHERE nombre_facultad = 'UIDE - Facultad General' LIMIT 1);

-- Insertar las carreras
INSERT INTO carreras (id_facultad, nombre_carrera) VALUES
(@id_facultad, 'Administración de Empresas'),
(@id_facultad, 'Arquitectura'),
(@id_facultad, 'Derecho'),
(@id_facultad, 'Ingeniería en Sistemas de la Información'),
(@id_facultad, 'Psicología Clínica'),
(@id_facultad, 'Marketing'),
(@id_facultad, 'Negocios Internacionales');

SELECT 'Carreras insertadas correctamente' AS resultado;
