# Autenticación MCP - Guía de Uso

## Descripción

Este sistema permite guardar códigos de autenticación MCP en la base de datos cuando el servidor lo solicite.

## Tabla de Base de Datos

La tabla `autenticacion_mcp` tiene la siguiente estructura:

- **id_autenticacion**: ID único (autoincremental)
- **correo**: Email del usuario (VARCHAR 100)
- **codigo**: Código de autenticación (VARCHAR 100)
- **fecha_solicitud**: Fecha y hora de la solicitud (TIMESTAMP)

## Instalación

### 1. Crear la tabla en la base de datos

Ejecuta el siguiente comando SQL en tu base de datos MySQL:

```sql
CREATE TABLE IF NOT EXISTS autenticacion_mcp (
    id_autenticacion INT AUTO_INCREMENT PRIMARY KEY,
    correo VARCHAR(100) NOT NULL,
    codigo VARCHAR(100) NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo),
    INDEX idx_codigo (codigo),
    INDEX idx_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

O ejecuta el archivo de migración:

```bash
# Desde MySQL CLI
mysql -u tu_usuario -p tu_base_de_datos < migrations/create_autenticacion_mcp.sql
```

### 2. Compilar el código TypeScript

```bash
npm run build
```

### 3. Iniciar el servidor MCP

```bash
npm run mcp
```

## Herramientas Disponibles

El servidor MCP ahora incluye 3 nuevas herramientas:

### 1. `guardar_autenticacion_mcp`

Guarda un código de autenticación en la base de datos.

**Parámetros:**
- `correo` (string, email): Email del usuario
- `codigo` (string): Código de autenticación

**Ejemplo de uso:**

```json
{
  "correo": "usuario@ejemplo.com",
  "codigo": "ABC123XYZ"
}
```

**Respuesta exitosa:**

```json
{
  "exito": true,
  "mensaje": "Código de autenticación guardado exitosamente",
  "id_autenticacion": 1,
  "correo": "usuario@ejemplo.com",
  "fecha_solicitud": "2026-02-04T13:39:26.000Z"
}
```

### 2. `verificar_codigo_mcp`

Verifica si un código de autenticación es válido.

**Parámetros:**
- `correo` (string, email): Email del usuario
- `codigo` (string): Código a verificar

**Ejemplo de uso:**

```json
{
  "correo": "usuario@ejemplo.com",
  "codigo": "ABC123XYZ"
}
```

**Respuesta:**

```json
{
  "valido": true,
  "correo": "usuario@ejemplo.com",
  "mensaje": "Código válido"
}
```

### 3. `historial_autenticacion_mcp`

Obtiene el historial de autenticaciones de un correo.

**Parámetros:**
- `correo` (string, email): Email del usuario

**Ejemplo de uso:**

```json
{
  "correo": "usuario@ejemplo.com"
}
```

**Respuesta:**

```json
{
  "correo": "usuario@ejemplo.com",
  "total": 2,
  "autenticaciones": [
    {
      "id_autenticacion": 2,
      "correo": "usuario@ejemplo.com",
      "codigo": "XYZ789",
      "fecha_solicitud": "2026-02-04T13:45:00.000Z"
    },
    {
      "id_autenticacion": 1,
      "correo": "usuario@ejemplo.com",
      "codigo": "ABC123XYZ",
      "fecha_solicitud": "2026-02-04T13:39:26.000Z"
    }
  ]
}
```

## Uso Programático

### Desde el servicio McpAuthService

```typescript
import { McpAuthService } from './services/mcp-auth.service';

// Crear instancia del servicio
const mcpAuthService = new McpAuthService(pool);

// Guardar código
const id = await mcpAuthService.guardarCodigoAutenticacion(
  'usuario@ejemplo.com',
  'ABC123XYZ'
);

// Verificar código
const esValido = await mcpAuthService.verificarCodigo(
  'usuario@ejemplo.com',
  'ABC123XYZ'
);

// Obtener historial
const historial = await mcpAuthService.obtenerHistorial('usuario@ejemplo.com');
```

## Flujo de Autenticación

1. **Solicitud de autenticación**: Cuando el servidor MCP necesita autenticar a un usuario, genera un código único.

2. **Guardar código**: El servidor llama a `guardar_autenticacion_mcp` con el correo del usuario y el código generado.

3. **Almacenamiento**: El código se guarda en la base de datos con la fecha y hora actual.

4. **Verificación**: Cuando el usuario proporciona el código, se puede verificar usando `verificar_codigo_mcp`.

5. **Auditoría**: Se puede consultar el historial completo de autenticaciones usando `historial_autenticacion_mcp`.

## Seguridad

- Los códigos se almacenan en texto plano. Para mayor seguridad, considera hashear los códigos antes de guardarlos.
- Implementa expiración de códigos basada en `fecha_solicitud`.
- Limita el número de intentos de verificación por correo.
- Considera agregar un campo `usado` para marcar códigos ya utilizados.

## Mejoras Futuras

1. **Expiración de códigos**: Agregar un campo `fecha_expiracion` y validar que el código no haya expirado.

2. **Estado del código**: Agregar un campo `estado` (pendiente, usado, expirado, revocado).

3. **Intentos de verificación**: Registrar intentos fallidos de verificación.

4. **Limpieza automática**: Crear un job que elimine códigos antiguos o expirados.

5. **Notificaciones**: Enviar email con el código al usuario cuando se genera.

## Archivos Modificados

- `prisma/schema.prisma`: Modelo AutenticacionMcp agregado
- `src/services/mcp-auth.service.ts`: Servicio de autenticación MCP (nuevo)
- `src/mcp/server.ts`: Herramientas de autenticación agregadas
- `migrations/create_autenticacion_mcp.sql`: Script de migración SQL (nuevo)
