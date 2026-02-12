import { FastifyInstance } from 'fastify';
import { PedidoController } from '../controllers/pedido.controller.js';
import { checkAuth } from '../plugins/auth.js';

export default async function pedidoRoutes(fastify: FastifyInstance) {
    // Todos los pedidos requieren autenticación
    fastify.addHook('preHandler', checkAuth);

    fastify.get('/', PedidoController.getByUser);
    fastify.get('/interesados', PedidoController.getInteresados);
    fastify.get('/estado/:id_servicio', PedidoController.getStatusForService);
    fastify.post('/', PedidoController.create);
    fastify.patch('/:id/estado', PedidoController.updateStatus);
    fastify.patch('/:id/archivar', PedidoController.archive);
}
