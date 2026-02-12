import { FastifyPluginAsync } from 'fastify';
import { CarreraController } from '../controllers/carrera.controller.js';
import { checkAdmin } from '../plugins/auth.js';

const carreraRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Public
    fastify.get('/', {
        schema: {
            description: 'Obtener todas las carreras',
            tags: ['Admin - Académico'],
            response: { 200: { type: 'array', items: { $ref: 'Carrera#' } } }
        }
    }, CarreraController.getAll);

    // Admin Only
    fastify.post('/', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Crear carrera (Admin)',
            tags: ['Admin - Académico'],
            body: { $ref: 'Carrera#' },
            response: { 201: { $ref: 'Carrera#' } }
        }
    }, CarreraController.create);

    fastify.delete('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Eliminar carrera (Admin)',
            tags: ['Admin - Académico'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, CarreraController.delete);
};

export default carreraRoutes;
