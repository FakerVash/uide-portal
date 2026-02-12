-- Crear tabla autenticacion_mcp
-- Esta tabla almacena los códigos de autenticación MCP solicitados por el servidor

CREATE TABLE IF NOT EXISTS autenticacion_mcp (
    id_autenticacion INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_codigo (codigo),
    INDEX idx_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
