import { FastifyPluginAsync } from 'fastify';
import { CategoriaController } from '../controllers/categoria.controller.js';

const categoriaRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // GET /categorias
    fastify.get('/', {
        schema: {
            description: 'Obtener todas las categorías',
            tags: ['Categorias'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Categoria#' }
                }
            }
        }
    }, CategoriaController.getAll);

    // GET /categorias/:id/servicios
    fastify.get('/:id/servicios', {
        schema: {
            description: 'Obtener servicios de una categoría',
            tags: ['Categorias'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' }
                }
            },
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Servicio#' }
                }
            }
        }
    }, CategoriaController.getServiciosById);
};

export default categoriaRoutes;
