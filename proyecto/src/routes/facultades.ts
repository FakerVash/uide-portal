import { FastifyPluginAsync } from 'fastify';
import { FacultadController } from '../controllers/facultad.controller.js';
import { checkAdmin } from '../plugins/auth.js';

const facultadRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Public
    fastify.get('/', {
        schema: {
            description: 'Obtener todas las facultades',
            tags: ['Admin - Académico'],
            response: { 200: { type: 'array', items: { $ref: 'Facultad#' } } }
        }
    }, FacultadController.getAll);

    // Admin Only
    fastify.post('/', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Crear facultad (Admin)',
            tags: ['Admin - Académico'],
            body: { $ref: 'Facultad#' },
            response: { 201: { $ref: 'Facultad#' } }
        }
    }, FacultadController.create);

    fastify.delete('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Eliminar facultad (Admin)',
            tags: ['Admin - Académico'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, FacultadController.delete);
};

export default facultadRoutes;
