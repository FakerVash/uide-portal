-- ==========================================================
-- SCRIPT MAESTRO DE BASE DE DATOS: SERVICIOS ESTUDIANTILES
-- COBERTURA: ESQUEMA, SEMILLAS, AUTENTICACIÓN Y SEGURIDAD
-- ==========================================================

DROP DATABASE IF EXISTS servicios_estudiantiles;
CREATE DATABASE servicios_estudiantiles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE servicios_estudiantiles;

-- 1. ESTRUCTURA DE TABLAS (BASADA EN SQL Y PRISMA)

-- 1.1 FACULTADES
CREATE TABLE facultades (
    id_facultad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_facultad VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 1.2 CARRERAS
CREATE TABLE carreras (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    id_facultad INT NOT NULL,
    nombre_carrera VARCHAR(150) NOT NULL,
    descripcion_carrera TEXT,
    imagen_carrera VARCHAR(500),
    banner_carrera VARCHAR(500),
    duracion_anios INT DEFAULT 4,
    tipo_carrera ENUM('PREGRADO', 'POSTGRADO', 'MAESTRIA', 'DOCTORADO') DEFAULT 'PREGRADO',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_facultad) REFERENCES facultades(id_facultad) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.3 USUARIOS
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    id_carrera INT,
    rol ENUM('ESTUDIANTE', 'CLIENTE', 'ADMIN') DEFAULT 'CLIENTE',
    foto_perfil VARCHAR(255),
    banner VARCHAR(255),
    bio TEXT,
    career VARCHAR(150),
    university VARCHAR(150),
    skills TEXT,
    calificacion_promedio DECIMAL(3, 2) DEFAULT 0.00,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 1.4 CATEGORIAS
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50) 
) ENGINE=InnoDB;

-- 1.5 SERVICIOS
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL, 
    tiempo_entrega VARCHAR(100),
    imagen_portada VARCHAR(255),
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE,
    FULLTEXT INDEX idx_busqueda (titulo, descripcion)
) ENGINE=InnoDB;

-- 1.6 IMAGENES DE SERVICIOS
CREATE TABLE servicio_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.7 HABILIDADES
CREATE TABLE habilidades (
    id_habilidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_habilidad VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 1.8 USUARIO_HABILIDADES
CREATE TABLE usuario_habilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_habilidad INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_habilidad) REFERENCES habilidades(id_habilidad) ON DELETE CASCADE,
    UNIQUE KEY (id_usuario, id_habilidad)
) ENGINE=InnoDB;

-- 1.9 PEDIDOS
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    id_cliente INT NOT NULL,
    estado ENUM('PENDIENTE', 'EN_PROCESO', 'CASI_TERMINADO', 'COMPLETADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    monto_total DECIMAL(10, 2) NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    notas TEXT,
    archivado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT,
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 1.10 RESEÑAS
CREATE TABLE resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT UNIQUE,
    id_servicio INT NOT NULL,
    id_usuario INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_resena TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.11 MENSAJES
CREATE TABLE mensajes (
    id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
    id_emisor INT NOT NULL,
    id_receptor INT NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    FOREIGN KEY (id_emisor) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_receptor) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
    CONSTRAINT mensajes_no_autoenvio CHECK (id_emisor <> id_receptor)
) ENGINE=InnoDB;

-- 1.12 REQUERIMIENTOS (De Prisma Schema)
CREATE TABLE requerimientos (
    id_requerimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_carrera INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    presupuesto DECIMAL(10, 2),
    estado VARCHAR(50) DEFAULT 'ABIERTO',
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.13 POSTULACIONES (De Prisma Schema)
CREATE TABLE postulaciones (
    id_postulacion INT AUTO_INCREMENT PRIMARY KEY,
    id_requerimiento INT NOT NULL,
    id_estudiante INT NOT NULL,
    estado VARCHAR(50) DEFAULT 'PENDIENTE',
    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_requerimiento) REFERENCES requerimientos(id_requerimiento) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 1.14 AUTENTICACION MCP
CREATE TABLE autenticacion_mcp (
    id_autenticacion INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

-- 1.15 HISTORIAL DE CAMBIOS DE PERFIL
CREATE TABLE historial_perfil (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- 2. DATOS DE SEMILLA (SEED DATA)
-- ==========================================================

-- 2.1 FACULTADES
INSERT INTO facultades (nombre_facultad) VALUES ('UIDE - Facultad General');
SET @id_facultad = LAST_INSERT_ID();

-- 2.2 CARRERAS
INSERT INTO carreras (id_facultad, nombre_carrera, imagen_carrera) VALUES
(@id_facultad, 'Administración de Empresas', '/uploads/carreras/administracion.jpg'),
(@id_facultad, 'Arquitectura', '/uploads/carreras/arquitectura.jpg'),
(@id_facultad, 'Derecho', '/uploads/carreras/derecho.jpg'),
(@id_facultad, 'Ingeniería en Sistemas de la Información', '/uploads/carreras/sistemas.jpg'),
(@id_facultad, 'Psicología Clínica', '/uploads/carreras/psicologia.jpg'),
(@id_facultad, 'Marketing', '/uploads/carreras/marketing.jpg'),
(@id_facultad, 'Negocios Internacionales', '/uploads/carreras/negocios.jpg');

-- 2.3 CATEGORIAS
INSERT INTO categorias (nombre_categoria, descripcion, icono) VALUES
('Desarrollo Web', 'Sistemas y apps online', 'code'),
('Diseño Gráfico', 'Logos y branding', 'palette'),
('Tutorías', 'Clases académicas', 'school'),
('Multimedia', 'Video y audio', 'movie'),
('Asesorías', 'Proyectos y consultoría', 'people'),
('Redacción', 'Contenido y ensayos', 'edit'),
('Traducción', 'Múltiples idiomas', 'translate'),
('Marketing', 'Digital y redes', 'trending_up'),
('Programación', 'Software y apps', 'laptop_mac'),
('Consultoría', 'Estratégica', 'business_center');

-- 2.4 HABILIDADES
INSERT INTO habilidades (nombre_habilidad) VALUES
('JavaScript'), ('Python'), ('Java'), ('C++'), ('React'), ('Node.js'), ('Angular'), ('Vue.js'), ('TypeScript'),
('SQL'), ('MySQL'), ('PostgreSQL'), ('Diseño Gráfico'), ('UI/UX Design'), ('Adobe Photoshop'), ('Figma'),
('Marketing Digital'), ('Excel Avanzado'), ('Edición de Video'), ('Trabajo en Equipo'), ('Inglés Avanzado');

-- 2.5 USUARIO ADMINISTRADOR
-- Contraseña 'admin123' hasheada con bcrypt (costo 10)
INSERT INTO usuarios (email, contrasena, nombre, apellido, rol, activo, bio, foto_perfil)
VALUES (
    'admin@uide.edu.ec', 
    '$2b$10$/M53G/c6uRfmQA5hlGzrkeSZ7OzJpkZ20hseZDBu/ZnvDUS86SQam', -- Hash para 'admin123'
    'Administrador', 
    'Sistema', 
    'ADMIN', 
    TRUE, 
    'Cuenta administrativa del sistema', 
    'https://ui-avatars.com/api/?name=Admin+Sistema&background=870a42&color=fff'
);

-- ==========================================================
-- NOTA FINAL: Seguridad Soft RLS
-- Implementada a nivel de middleware en el servidor MCP/Backend
-- ==========================================================
