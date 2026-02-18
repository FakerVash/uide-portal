import { FastifyPluginAsync } from 'fastify';
import { UsuarioController } from '../controllers/usuario.controller.js';
import { checkAdmin } from '../plugins/auth.js';

const usuarioRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // GET /usuarios
    fastify.get('/', {
        schema: {
            description: 'Obtener todos los usuarios',
            tags: ['Usuarios'],
            response: {
                200: {
                    type: 'array',
                    items: { $ref: 'Usuario#' }
                }
            }
        }
    }, UsuarioController.getAll);

    // GET /usuarios/:id
    fastify.get('/:id', {
        schema: {
            description: 'Obtener un usuario por ID',
            tags: ['Usuarios'],
            params: {
                type: 'object',
                properties: {
                    id: { type: 'integer' }
                }
            }
            // Response schema removed to allow habilidades and servicios fields
        }
    }, UsuarioController.getById);

    // POST /usuarios (Registro)
    fastify.post('/', {
        schema: {
            description: 'Registrar un nuevo usuario',
            tags: ['Usuarios'],
            body: { $ref: 'CreateUsuario#' },
            response: {
                201: { $ref: 'Usuario#' }
            }
        }
    }, UsuarioController.create);

    // PATCH /usuarios/:id/status (Admin Only)
    fastify.patch('/:id/status', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Activar/Desactivar usuario (Admin)',
            tags: ['Usuarios'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            body: { type: 'object', required: ['activo'], properties: { activo: { type: 'boolean' } } },
            response: { 200: { $ref: 'Usuario#' } }
        }
    }, UsuarioController.updateStatus);

    // PUT /usuarios/:id/admin-update (Admin Only - Career Change)
    fastify.put('/:id/admin-update', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Actualizar carrera de usuario (Admin)',
            tags: ['Usuarios'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            body: { type: 'object', required: ['id_carrera'], properties: { id_carrera: { type: 'integer' } } },
            response: { 200: { $ref: 'Usuario#' } }
        }
    }, UsuarioController.adminUpdate);

    // DELETE /usuarios/:id (Admin Only)
    fastify.delete('/:id', {
        preHandler: [checkAdmin],
        schema: {
            description: 'Eliminar usuario (Admin)',
            tags: ['Usuarios'],
            params: { type: 'object', properties: { id: { type: 'integer' } } },
            response: { 204: { type: 'null' } }
        }
    }, UsuarioController.delete);

    // PUT /usuarios/me (Self-Profile Update)
    fastify.put('/me', {
        onRequest: [(fastify as any).authenticate],
        schema: {
            description: 'Editar mi propio perfil (Cliente)',
            tags: ['Usuarios'],
            security: [{ bearerAuth: [] }],
            body: { $ref: 'UpdateUsuario#' }
            // Response schema removed to allow habilidades field
        }
    }, UsuarioController.updateMe);

    // GET /usuarios/me (Get Self-Profile)
    fastify.get('/me', {
        onRequest: [(fastify as any).authenticate],
        schema: {
            description: 'Obtener mi propio perfil',
            tags: ['Usuarios'],
            security: [{ bearerAuth: [] }]
            // Response schema removed to allow habilidades field
        }
    }, UsuarioController.getMe);
};

export default usuarioRoutes;
