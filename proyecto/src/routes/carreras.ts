import { FastifyPluginAsync } from 'fastify';
import { CarreraController } from '../controllers/carrera.controller.js';
import { checkAdmin } from '../plugins/auth.js';

const carreraRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // Public
    fastify.get('/', {
        schema: {
            description: 'Obtener todas las carreras',
            tags: ['Carreras'],
            response: { 200: { type: 'array', items: { $ref: 'Carrera#' } } }
        }
    }, CarreraController.getAll);

    fastify.get('/:id', {
        schema: {
            description: 'Obtener carrera por ID',
            tags: ['Carreras'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 200: { $ref: 'Carrera#' } }
        }
    }, CarreraController.getById);

    // Admin Only
    fastify.post('/', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Crear carrera (Admin)',
            tags: ['Admin - Carreras'],
            body: { $ref: 'Carrera#' },
            response: { 201: { $ref: 'Carrera#' } }
        }
    }, CarreraController.create);

    fastify.put('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Actualizar carrera (Admin)',
            tags: ['Admin - Carreras'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            body: { $ref: 'Carrera#' },
            response: { 200: { $ref: 'Carrera#' } }
        }
    }, CarreraController.update);

    fastify.delete('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Eliminar carrera (Admin)',
            tags: ['Admin - Carreras'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, CarreraController.delete);

    // Upload Images
    fastify.post('/:id/upload', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Subir imagen de carrera (Admin)',
            tags: ['Admin - Carreras'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            querystring: { 
                type: 'object', 
                properties: { tipo: { type: 'string', enum: ['imagen', 'banner'] } } 
            },
            consumes: ['multipart/form-data']
        }
    }, CarreraController.uploadImage);

    // Toggle Active Status
    fastify.patch('/:id/toggle', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Activar/Desactivar carrera (Admin)',
            tags: ['Admin - Carreras'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 200: { type: 'object' } }
        }
    }, CarreraController.toggleActive);
};

export default carreraRoutes;
