import { FastifyPluginAsync } from 'fastify';
import { ServicioController } from '../controllers/servicio.controller.js';
import { checkAdmin, checkEstudiante, checkAuth } from '../plugins/auth.js';

const servicioRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // GET /servicios
    fastify.get('/', {
        schema: {
            description: 'Obtener todos los servicios con filtros',
            tags: ['Servicios'],
            querystring: {
                type: 'object',
                properties: {
                    categoria: { type: 'integer' },
                    buscar: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Servicio#' }
                }
            }
        }
    }, ServicioController.getAll);

    // GET /servicios/:id
    fastify.get('/:id', {
        schema: {
            description: 'Obtener detalle de un servicio',
            tags: ['Servicios'],
            params: { type: 'object', properties: { id: { type: 'integer' } } }
            // Response validation removed to allow all fields (including resenas) to pass through
        }
    }, ServicioController.getById);

    // POST /servicios
    fastify.post('/', {
        schema: {
            description: 'Crear un nuevo servicio',
            tags: ['Servicios'],
            body: { $ref: 'Servicio#' },
            response: {
                201: { $ref: 'Servicio#' }
            }
        }
    }, ServicioController.create);

    // PATCH /servicios/:id (Edit my service)
    fastify.patch('/:id', {
        preHandler: [checkEstudiante],
        schema: {
            description: 'Editar mi propio servicio (Dueño)',
            tags: ['Servicios'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            body: { $ref: 'ServicioUpdate#' },
            response: { 200: { $ref: 'Servicio#' } }
        }
    }, ServicioController.update);

    // DELETE /servicios/:id (Owner or Admin)
    fastify.delete('/:id', {
        preHandler: [checkAuth],
        schema: {
            description: 'Eliminar un servicio (propietario o admin)',
            tags: ['Servicios'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, ServicioController.delete);

    // PATCH /servicios/:id/archivar (Archivar - Dueño)
    fastify.patch('/:id/archivar', {
        preHandler: [checkAuth]
    }, ServicioController.archive);
};

export default servicioRoutes;
