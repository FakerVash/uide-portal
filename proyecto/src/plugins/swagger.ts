import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';

export default fp(async (fastify: FastifyInstance) => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'Servicios Estudiantiles API',
                description: 'Documentación de la API para el Portal de Servicios Estudiantiles',
                version: '1.0.0'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Servidor de desarrollo'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    });

    await fastify.register(swaggerUi, {
        routePrefix: '/documentation',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false
        },
        staticCSP: true,
        transformStaticCSP: (header) => header
    });
});
