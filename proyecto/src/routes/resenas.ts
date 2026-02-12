import { FastifyPluginAsync } from 'fastify';
import { ResenaController } from '../controllers/resena.controller.js';
import { checkAdmin, checkAuth } from '../plugins/auth.js';

const resenaRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.get('/', {
        schema: {
            description: 'Obtener todas las reseñas',
            tags: ['Moderación'],
            response: { 200: { type: 'array', items: { $ref: 'Resena#' } } }
        }
    }, ResenaController.getAll);

    fastify.post('/', {
        preHandler: [checkAuth],
        schema: {
            description: 'Crear una reseña (Solo si el pedido está completado)',
            tags: ['Moderación'],
            body: { $ref: 'Resena#' },
            response: { 201: { $ref: 'Resena#' } }
        }
    }, ResenaController.create);

    fastify.delete('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Eliminar reseña (Admin)',
            tags: ['Moderación'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, ResenaController.delete);
};

export default resenaRoutes;
