import { FastifyPluginAsync } from 'fastify';
import { HabilidadController } from '../controllers/habilidad.controller.js';
import { checkAdmin } from '../plugins/auth.js';

const habilidadRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.get('/', {
        schema: {
            description: 'Obtener todas las habilidades',
            tags: ['Admin - Categorías'],
            response: { 200: { type: 'array', items: { $ref: 'Habilidad#' } } }
        }
    }, HabilidadController.getAll);

    fastify.post('/', {
        schema: {
            description: 'Crear habilidad',
            tags: ['Habilidades'],
            body: { $ref: 'Habilidad#' },
            response: { 201: { $ref: 'Habilidad#' } }
        }
    }, HabilidadController.create);

    fastify.delete('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Eliminar habilidad (Admin)',
            tags: ['Admin - Categorías'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, HabilidadController.delete);
};

export default habilidadRoutes;
