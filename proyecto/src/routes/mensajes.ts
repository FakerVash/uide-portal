import { FastifyInstance } from 'fastify';
import { MensajeController } from '../controllers/mensaje.controller.js';
import { checkAuth } from '../plugins/auth.js';

export default async function mensajeRoutes(fastify: FastifyInstance) {
    fastify.post('/', { preHandler: [checkAuth] }, MensajeController.create);
}
