import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';

const authRoutes: FastifyPluginAsync = async (fastify, opts) => {
    // POST /auth/login
    fastify.post('/login', {
        schema: {
            description: 'Iniciar sesión (Paso 1: Credenciales -> Código 2FA)',
            tags: ['Auth'],
            body: { $ref: 'Login#' },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        email: { type: 'string' },
                        token: { type: 'string' },
                        usuario: {
                            type: 'object',
                            properties: {
                                id_usuario: { type: 'integer' },
                                email: { type: 'string' },
                                nombre: { type: 'string' },
                                rol: { type: 'string' },
                                foto_perfil: { type: 'string', nullable: true },
                                calificacion_promedio: { type: 'number', nullable: true },
                                fecha_registro: { type: 'string', format: 'date-time' },
                                activo: { type: 'boolean' }
                            }
                        }
                    }
                },
                401: {
                    type: 'object',
                    properties: { message: { type: 'string' } }
                }
            }
        }
    }, AuthController.login);

    // POST /auth/verify-2fa
    fastify.post('/verify-2fa', {
        schema: {
            description: 'Verificar código 2FA y obtener token (Paso 2)',
            tags: ['Auth'],
            body: { $ref: 'Verify2FA#' },
            response: {
                200: { $ref: 'AuthResponse#' },
                400: {
                    type: 'object',
                    properties: { message: { type: 'string' } }
                }
            }
        }
    }, AuthController.verify2FA);

    // POST /auth/request-code
    fastify.post('/request-code', {
        schema: {
            description: 'Solicitar código de verificación para registro',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } }
            },
            response: {
                200: { type: 'object', properties: { message: { type: 'string' } } },
                400: { type: 'object', properties: { message: { type: 'string' } } }
            }
        }
    }, AuthController.requestVerificationCode);
};

export default authRoutes;
