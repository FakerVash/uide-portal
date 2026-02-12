import { FastifyInstance } from 'fastify';
import prismaPlugin from './plugins/prisma.js';
import cors from '@fastify/cors';
import swaggerPlugin from './plugins/swagger.js';
import jwtPlugin from './plugins/jwt.js';
import * as models from './models/index.js';
import usuarioRoutes from './routes/usuarios.js';
import servicioRoutes from './routes/servicios.js';
import categoriaRoutes from './routes/categorias.js';
import facultadRoutes from './routes/facultades.js';
import carreraRoutes from './routes/carreras.js';
import habilidadRoutes from './routes/habilidades.js';
import resenaRoutes from './routes/resenas.js';
import usuarioHabilidadRoutes from './routes/usuario-habilidades.js';
import authRoutes from './routes/auth.js';
import testMcpRoutes from './routes/test-mcp.js';
import uploadPlugin from './plugins/upload.js';
import uploadRoutes from './routes/upload.js';
import pedidoRoutes from './routes/pedidos.js';
import mensajeRoutes from './routes/mensajes.js';
import requerimientoRoutes from './routes/requerimientos.js';

export default async function buildApp(fastify: FastifyInstance) {
    // Register Schemas
    for (const schema of Object.values(models).filter(m => (m as any).$id)) {
        fastify.addSchema(schema as any);
    }

    // Register Plugins
    await fastify.register(cors, {
        origin: true
    });
    await fastify.register(swaggerPlugin);
    await fastify.register(jwtPlugin);
    await fastify.register(prismaPlugin);

    // Register Upload Plugin (Multipart & Static)
    await fastify.register(uploadPlugin);

    // Health Check Endpoint
    fastify.get('/health', async () => {
        return { 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        };
    });

    // Register Routes
    await fastify.register(usuarioRoutes, { prefix: '/api/usuarios' });
    await fastify.register(servicioRoutes, { prefix: '/api/servicios' });
    await fastify.register(categoriaRoutes, { prefix: '/api/categorias' });
    await fastify.register(facultadRoutes, { prefix: '/api/facultades' });
    await fastify.register(carreraRoutes, { prefix: '/api/carreras' });
    await fastify.register(habilidadRoutes, { prefix: '/api/habilidades' });
    await fastify.register(resenaRoutes, { prefix: '/api/resenas' });
    await fastify.register(usuarioHabilidadRoutes, { prefix: '/api/usuarios/habilidades' });
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(testMcpRoutes, { prefix: '/api/test-mcp' });
    await fastify.register(uploadRoutes, { prefix: '/api/upload' });
    await fastify.register(pedidoRoutes, { prefix: '/api/pedidos' });
    await fastify.register(mensajeRoutes, { prefix: '/api/mensajes' });
    await fastify.register(requerimientoRoutes, { prefix: '/api/requerimientos' });

    return fastify;
}
