import { FastifyPluginAsync } from 'fastify';
import { AuditController } from '../controllers/audit.controller.js';
import { checkAdmin } from '../plugins/auth.js';

const auditRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // GET /auditoria (Admin Only)
    fastify.get('/', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Obtener historial de auditoría',
            tags: ['Auditoría'],
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'string' },
                    offset: { type: 'string' },
                    usuario_id: { type: 'string' },
                    accion: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id_auditoria: { type: 'integer' },
                                    id_usuario: { type: 'integer' },
                                    accion: { type: 'string' },
                                    detalles: { type: 'string', nullable: true },
                                    fecha: { type: 'string', format: 'date-time' },
                                    ip: { type: 'string', nullable: true },
                                    usuario: {
                                        type: 'object',
                                        properties: {
                                            id_usuario: { type: 'integer' },
                                            nombre: { type: 'string' },
                                            apellido: { type: 'string' },
                                            email: { type: 'string' },
                                            rol: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                total: { type: 'integer' },
                                limit: { type: 'integer' },
                                offset: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        }
    }, AuditController.getAll);
};

export default auditRoutes;
