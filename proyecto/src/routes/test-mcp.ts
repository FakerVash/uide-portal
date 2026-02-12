import { FastifyInstance } from 'fastify';
import mysql from 'mysql2/promise';
import { McpAuthService } from '../services/mcp-auth.service.js';

export default async function testMcpRoutes(fastify: FastifyInstance) {

    // Crear conexión a DB para el servicio (reutilizando la env)
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

    const mcpAuthService = new McpAuthService(pool);

    // POST /api/test-mcp/generar
    fastify.post('/generar', async (request, reply) => {
        const { correo } = request.body as { correo: string };

        if (!correo) {
            return reply.status(400).send({ error: 'El correo es requerido' });
        }

        try {
            // Generar un código aleatorio
            const codigo = 'MCP-' + Math.random().toString(36).substring(2, 10).toUpperCase();

            // Guardar usando el servicio
            const id = await mcpAuthService.guardarCodigoAutenticacion(correo, codigo);

            return reply.send({
                mensaje: 'Código generado y guardado exitosamente',
                datos: {
                    id_autenticacion: id,
                    correo: correo,
                    codigo: codigo,
                    fecha: new Date()
                }
            });
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });

    // GET /api/test-mcp/historial/:correo
    fastify.get('/historial/:correo', async (request, reply) => {
        const { correo } = request.params as { correo: string };
        try {
            const historial = await mcpAuthService.obtenerHistorial(correo);
            return reply.send(historial);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });
}
