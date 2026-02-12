DROP DATABASE IF EXISTS servicios_estudiantiles;
CREATE DATABASE servicios_estudiantiles CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE servicios_estudiantiles;

-- 1. FACULTADES
CREATE TABLE facultades (
    id_facultad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_facultad VARCHAR(150) NOT NULL UNIQUE
);

-- 2. CARRERAS
CREATE TABLE carreras (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    id_facultad INT NOT NULL,
    nombre_carrera VARCHAR(150) NOT NULL,
    FOREIGN KEY (id_facultad) REFERENCES facultades(id_facultad) ON DELETE CASCADE
);

-- 3. USUARIOS 
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
);

-- 4. CATEGORIAS
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50) 
);

-- 5. SERVICIOS (Alineado con MVP)
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
);

-- 5.1 IMAGENES DE SERVICIOS
CREATE TABLE servicio_imagenes (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    url VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE
);

-- 6. HABILIDADES
CREATE TABLE habilidades (
    id_habilidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_habilidad VARCHAR(100) NOT NULL UNIQUE
);

-- 7. USUARIO_HABILIDADES
CREATE TABLE usuario_habilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_habilidad INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_habilidad) REFERENCES habilidades(id_habilidad) ON DELETE CASCADE,
    UNIQUE KEY (id_usuario, id_habilidad)
);

-- 8. CARRITO DE COMPRAS 
CREATE TABLE carritos (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_servicio INT NOT NULL,
    horas INT DEFAULT 1, -- Renombrado de cantidad a horas para coincidir con prototipo
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE
);

-- 9. PEDIDOS 
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_servicio INT NOT NULL,
    id_cliente INT NOT NULL,
    estado ENUM('pendiente', 'en_proceso', 'casi_terminado', 'completado', 'cancelado') DEFAULT 'pendiente',
    monto_total DECIMAL(10, 2) NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega DATETIME,
    notas TEXT,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio),
    FOREIGN KEY (id_cliente) REFERENCES usuarios(id_usuario)
);


CREATE TABLE resenas (
    id_resena INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT UNIQUE, -- Añadido para vincular la reseña al pedido específico
    id_servicio INT NOT NULL,
    id_usuario INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_resena TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 11. FAVORITOS
CREATE TABLE favoritos (
    id_usuario INT NOT NULL,
    id_servicio INT NOT NULL,
    PRIMARY KEY (id_usuario, id_servicio),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE CASCADE
);


-- 12. CHAT: MENSAJES
CREATE TABLE mensajes (
	id_mensaje int NOT NULL AUTO_INCREMENT,
	id_emisor int NOT NULL,
	id_receptor int NOT NULL,
	contenido text COLLATE utf8mb4_unicode_ci NOT NULL,
	leido tinyint(1) NOT NULL DEFAULT '0',
	fecha_envio datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	PRIMARY KEY (id_mensaje),
	KEY mensajes_id_emisor_fkey (id_emisor),
	KEY mensajes_id_receptor_fkey (id_receptor),
	CONSTRAINT mensajes_id_emisor_fkey FOREIGN KEY (id_emisor) REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mensajes_id_receptor_fkey FOREIGN KEY (id_receptor) REFERENCES usuarios (id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT mensajes_no_autoenvio CHECK (id_emisor <> id_receptor)
) ;


-- 13. NOTIFICACIONES 
CREATE TABLE notificaciones (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    tipo ENUM('pedido', 'mensaje', 'sistema') DEFAULT 'sistema',
    fecha_notificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 14. AUTENTICACION MCP
CREATE TABLE autenticacion_mcp (
    id_autenticacion INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_codigo (codigo),
    INDEX idx_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. HISTORIAL DE CAMBIOS DE PERFIL (Auditoría)
CREATE TABLE historial_perfil (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    campo_modificado VARCHAR(50) NOT NULL,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;