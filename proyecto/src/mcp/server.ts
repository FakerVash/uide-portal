import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import mysql from "mysql2/promise";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildRLSFilter } from '../middleware/rls.js';
import { McpAuthService } from '../services/mcp-auth.service.js';


dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = new URL(process.env.DATABASE_URL!);
const pool = mysql.createPool({
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.split("/")[1],
    port: parseInt(dbUrl.port) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
});

// Función auxiliar para verificar autenticación
async function autenticarUsuario(correo: string, codigo: string) {
    console.error(`🔍 Verificando usuario: ${correo} con código: ${codigo}`);

    // 1. Verificar si el código MCP es válido
    const esCodigoValido = await mcpAuthService.verificarCodigo(correo, codigo);
    if (!esCodigoValido) {
        console.error(`❌ Código inválido para ${correo}`);
        throw new Error("Código de autenticación inválido o expirado. Solicita uno nuevo.");
    }

    // 2. Buscar al usuario en la base de datos para obtener su ID y Rol
    const [rows] = await pool.execute(
        'SELECT id_usuario, rol FROM usuarios WHERE email = ? AND activo = TRUE',
        [correo]
    ) as [any[], any];

    if (rows.length === 0) {
        console.error(`❌ Elemento usuario no encontrado: ${correo}`);
        throw new Error("Usuario no encontrado o inactivo.");
    }

    console.error(`✅ Usuario autenticado: ID ${rows[0].id_usuario}, Rol ${rows[0].rol}`);

    return {
        id: rows[0].id_usuario,
        role: rows[0].rol
    };
}

const server = new McpServer({
    name: "servicios-estudiantiles-mcp",
    version: "1.0.0"
});

// Servicio de autenticación MCP
const mcpAuthService = new McpAuthService(pool);

async function ejecutar(query: string, params: any[] = []) {
    try {
        const [rows] = await pool.execute(query, params);
        return { content: [{ type: "text" as const, text: JSON.stringify(rows, null, 2) }] };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text" as const, text: `Error: ${error.message}` }] };
    }
}






server.tool(
    "obtener_mi_perfil",
    "Ver mi perfil completo (Requiere autenticación)",
    {
        correo: z.string().email(),
        codigo: z.string().describe("Código recibido por correo")
    },
    async ({ correo, codigo }) => {
        try {
            const currentUser = await autenticarUsuario(correo, codigo);

            const [rows] = await pool.execute(`
                SELECT u.id_usuario, u.email, u.nombre, u.apellido, u.telefono, u.rol, 
                       u.foto_perfil, u.calificacion_promedio, u.fecha_registro, u.activo,
                       c.nombre_carrera
                FROM usuarios u 
                LEFT JOIN carreras c ON u.id_carrera = c.id_carrera
                WHERE u.id_usuario = ?
            `, [currentUser.id]) as [any[], any];

            if (rows.length === 0) {
                return { isError: true, content: [{ type: "text", text: "Error al recuperar perfil." }] };
            }

            const u = rows[0];
            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        exito: true,
                        perfil: {
                            id: u.id_usuario,
                            nombre_completo: `${u.nombre} ${u.apellido}`,
                            email: u.email,
                            telefono: u.telefono || "No registrado",
                            rol: u.rol,
                            carrera: u.nombre_carrera || "No asignada",
                            calificacion: u.calificacion_promedio,
                            fecha_registro: u.fecha_registro,
                            estado: u.activo ? "Activo" : "Inactivo"
                        }
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return { isError: true, content: [{ type: "text", text: error.message }] };
        }
    }
);

server.tool(
    "obtener_mis_servicios",
    "Ver servicios que yo he publicado (Requiere autenticación)",
    {
        correo: z.string().email(),
        codigo: z.string().describe("Código recibido por correo")
    },
    async ({ correo, codigo }) => {
        try {
            const currentUser = await autenticarUsuario(correo, codigo);

            const [rows] = await pool.execute(`
                SELECT s.id_servicio, s.titulo, s.descripcion, s.precio, s.tiempo_entrega, 
                       s.fecha_publicacion, s.activo, cat.nombre_categoria,
                       (SELECT AVG(calificacion) FROM resenas r WHERE r.id_servicio = s.id_servicio) as calificacion_promedio
                FROM servicios s
                JOIN categorias cat ON s.id_categoria = cat.id_categoria
                WHERE s.id_usuario = ?
                ORDER BY s.fecha_publicacion DESC
            `, [currentUser.id]) as [any[], any];

            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        exito: true,
                        total_servicios: rows.length,
                        servicios: rows
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return { isError: true, content: [{ type: "text", text: error.message }] };
        }
    }
);

// === TOOLS PÚBLICOS ===

server.tool(
    "buscar_servicios",
    "Buscar en marketplace",
    {
        termino: z.string().optional(),
        categoria: z.number().optional()
    },
    async ({ termino, categoria }) => {
        let query = `SELECT s.*, c.nombre_categoria, u.nombre as prestador
                     FROM servicios s
                     JOIN categorias c ON s.id_categoria = c.id_categoria
                     JOIN usuarios u ON s.id_usuario = u.id_usuario
                     WHERE s.activo = TRUE`;
        const params: any[] = [];
        if (termino) { query += " AND (s.titulo LIKE ? OR s.descripcion LIKE ?)"; params.push(`%${termino}%`, `%${termino}%`); }
        if (categoria) { query += " AND s.id_categoria = ?"; params.push(categoria); }
        return ejecutar(query + " LIMIT 20", params);
    }
);

server.tool(
    "obtener_facultades",
    "Ver lista de facultades",
    {},
    async () => {
        return ejecutar("SELECT * FROM facultades ORDER BY nombre_facultad ASC");
    }
);

server.tool(
    "obtener_carreras",
    "Ver carreras por facultad",
    { id_facultad: z.number().optional() },
    async ({ id_facultad }) => {
        let query = "SELECT c.*, f.nombre_facultad FROM carreras c JOIN facultades f ON c.id_facultad = f.id_facultad";
        const params: any[] = [];
        if (id_facultad) { query += " WHERE c.id_facultad = ?"; params.push(id_facultad); }
        return ejecutar(query + " ORDER BY c.nombre_carrera ASC", params);
    }
);

server.tool(
    "obtener_perfil_publico",
    "Ver perfil público de usuario",
    { id_usuario: z.number() },
    async ({ id_usuario }) => {
        const [rows] = await pool.execute(`
            SELECT u.id_usuario, u.nombre, u.apellido, u.rol, u.foto_perfil, 
                   u.calificacion_promedio, c.nombre_carrera
            FROM usuarios u LEFT JOIN carreras c ON u.id_carrera = c.id_carrera
            WHERE u.id_usuario = ? AND u.activo = TRUE
        `, [id_usuario]) as [any[], any];

        if (rows.length === 0) {
            return { content: [{ type: "text" as const, text: "Usuario no encontrado" }] };
        }
        const u = rows[0];
        return {
            content: [{
                type: "text" as const,
                text: JSON.stringify({
                    id: u.id_usuario,
                    nombre: `${u.nombre} ${u.apellido}`,
                    rol: u.rol,
                    carrera: u.nombre_carrera || "No especificada",
                    calificacion: u.calificacion_promedio
                }, null, 2)
            }]
        };
    }
);


server.tool(
    "buscar_usuarios",
    "Buscar lista de usuarios públicos",
    {
        termino: z.string().optional(),
        rol: z.enum(['ESTUDIANTE', 'ADMIN', 'CLIENTE']).optional()
    },
    async ({ termino, rol }) => {
        let query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.rol, u.foto_perfil, 
                   u.calificacion_promedio, c.nombre_carrera
            FROM usuarios u 
            LEFT JOIN carreras c ON u.id_carrera = c.id_carrera
            WHERE u.activo = TRUE
        `;
        const params: any[] = [];

        if (termino) {
            query += " AND (u.nombre LIKE ? OR u.apellido LIKE ?)";
            params.push(`%${termino}%`, `%${termino}%`);
        }
        if (rol) {
            query += " AND u.rol = ?";
            params.push(rol);
        }

        return ejecutar(query + " ORDER BY u.nombre ASC LIMIT 50", params);
    }
);

server.tool(
    "explorar_categorias",
    "Ver todas las categorías de servicios disponibles",
    {},
    async () => {
        return ejecutar("SELECT * FROM categorias ORDER BY nombre_categoria ASC");
    }
);

server.tool(
    "ver_resenas_servicio",
    "Ver opiniones de un servicio específico",
    { id_servicio: z.number() },
    async ({ id_servicio }) => {
        return ejecutar(`
            SELECT r.calificacion, r.comentario, r.fecha_resena, u.nombre as autor
            FROM resenas r
            JOIN usuarios u ON r.id_usuario = u.id_usuario
            WHERE r.id_servicio = ?
            ORDER BY r.fecha_resena DESC
        `, [id_servicio]);
    }
);

server.tool(
    "top_servicios_valorados",
    "Ver los servicios mejor calificados",
    { limit: z.number().default(5).optional() },
    async ({ limit }) => {
        return ejecutar(`
            SELECT s.id_servicio, s.titulo, s.precio, s.imagen_portada, 
                   cat.nombre_categoria, u.nombre as prestador,
                   (SELECT AVG(calificacion) FROM resenas r WHERE r.id_servicio = s.id_servicio) as promedio_calificacion
            FROM servicios s
            JOIN categorias cat ON s.id_categoria = cat.id_categoria
            JOIN usuarios u ON s.id_usuario = u.id_usuario
            WHERE s.activo = TRUE
            ORDER BY promedio_calificacion DESC
            LIMIT ?
        `, [limit || 5]);
    }
);

// === HERRAMIENTA DE AUTENTICACIÓN MCP ===

server.tool(
    "solicitar_codigo_auth",
    "Solicitar un código de autenticación a mi correo",
    {
        correo: z.string().email("Debe ser un correo válido")
    },
    async ({ correo }) => {
        try {
            // Generar código aleatorio seguro
            const codigo = 'MCP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            const id = await mcpAuthService.guardarCodigoAutenticacion(correo, codigo);

            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        exito: true,
                        mensaje: `Código enviado a ${correo}. Por favor verifícalo.`,
                        instruccion: "Pide al usuario que revise su correo e ingrese el código."
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return {
                isError: true,
                content: [{
                    type: "text" as const,
                    text: `Error al solicitar código: ${error.message}`
                }]
            };
        }
    }
);


server.tool(
    "verificar_codigo_mcp",
    "Verificar si un código de autenticación MCP es válido",
    {
        correo: z.string().email("Debe ser un correo válido"),
        codigo: z.string().min(1, "El código no puede estar vacío")
    },
    async ({ correo, codigo }) => {
        try {
            const esValido = await mcpAuthService.verificarCodigo(correo, codigo);

            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        valido: esValido,
                        correo: correo,
                        mensaje: esValido
                            ? "Código válido"
                            : "Código inválido o no encontrado"
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return {
                isError: true,
                content: [{
                    type: "text" as const,
                    text: `Error al verificar código: ${error.message}`
                }]
            };
        }
    }
);

server.tool(
    "historial_autenticacion_mcp",
    "Ver historial de autenticaciones MCP de un correo",
    {
        correo: z.string().email("Debe ser un correo válido")
    },
    async ({ correo }) => {
        try {
            const historial = await mcpAuthService.obtenerHistorial(correo);

            return {
                content: [{
                    type: "text" as const,
                    text: JSON.stringify({
                        correo: correo,
                        total: historial.length,
                        autenticaciones: historial
                    }, null, 2)
                }]
            };
        } catch (error: any) {
            return {
                isError: true,
                content: [{
                    type: "text" as const,
                    text: `Error al obtener historial: ${error.message}`
                }]
            };
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`MCP iniciado - Esperando solicitudes de autenticación...`);
}

main().catch(console.error);