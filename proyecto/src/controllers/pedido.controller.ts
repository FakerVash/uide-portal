import { FastifyReply, FastifyRequest } from 'fastify';
import { PedidoDTO } from '../models/pedido.js';

export const PedidoController = {
    // El cliente o el estudiante activa un servicio
    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as PedidoDTO;
        const user = (request as any).user;

        // 1. Obtener detalles del servicio
        const servicio = await request.server.prisma.servicio.findUnique({
            where: { id_servicio: body.id_servicio }
        });

        if (!servicio) {
            return reply.status(404).send({ message: 'Servicio no encontrado' });
        }

        // 2. Determinar quién está creando el pedido
        // El cliente es el ID que viene en el body, pero si es el cliente mismo quien contacta, usaremos su ID.
        // Si el provider está activando manualmente (viejo flujo), el id_cliente viene en body.
        const id_cliente_final = body.id_cliente || user.id_usuario;

        // 3. Validar permisos: Solo el dueño del servicio o el cliente interesado pueden crear el pedido
        if (servicio.id_usuario !== user.id_usuario && id_cliente_final !== user.id_usuario) {
            return reply.status(403).send({ message: 'No tienes permiso para crear este pedido' });
        }

        // 4. Evitar duplicados activos: si ya hay un pedido pendiente o en proceso para este servicio/cliente
        const pedidoExistente = await request.server.prisma.pedido.findFirst({
            where: {
                id_servicio: body.id_servicio,
                id_cliente: id_cliente_final,
                estado: { in: ['PENDIENTE', 'EN_PROCESO', 'CASI_TERMINADO'] }
            }
        });

        if (pedidoExistente) {
            return reply.send(pedidoExistente); // Retornar el existente en lugar de error para evitar fallos en el frontend
        }

        const nuevoPedido = await request.server.prisma.pedido.create({
            data: {
                id_servicio: body.id_servicio,
                id_cliente: id_cliente_final,
                monto_total: body.monto_total || servicio.precio,
                estado: 'PENDIENTE',
                notas: body.notas || 'Pedido auto-generado por contacto'
            }
        });

        return reply.status(201).send(nuevoPedido);
    },

    // Actualizar el estado del pedido (Solo estudiante)
    async updateStatus(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { estado } = request.body as { estado: 'PENDIENTE' | 'EN_PROCESO' | 'CASI_TERMINADO' | 'COMPLETADO' | 'CANCELADO' };
        const user = (request as any).user;

        const pedido = await request.server.prisma.pedido.findUnique({
            where: { id_pedido: parseInt(id) },
            include: { servicio: true }
        });

        if (!pedido || pedido.servicio.id_usuario !== user.id_usuario) {
            return reply.status(403).send({ message: 'No tienes permiso para actualizar este pedido' });
        }

        const pedidoActualizado = await request.server.prisma.pedido.update({
            where: { id_pedido: parseInt(id) },
            data: { estado }
        });

        return reply.send(pedidoActualizado);
    },

    // Obtener pedidos del usuario (como cliente o como estudiante)
    async getByUser(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;

        const pedidos = await request.server.prisma.pedido.findMany({
            where: {
                OR: [
                    { id_cliente: user.id_usuario },
                    { servicio: { id_usuario: user.id_usuario } }
                ]
            },
            include: {
                servicio: {
                    include: {
                        usuario: {
                            select: { nombre: true, apellido: true, telefono: true, email: true, foto_perfil: true }
                        }
                    }
                },
                cliente: {
                    select: { nombre: true, apellido: true, email: true, foto_perfil: true }
                },
                resena: true
            },
            orderBy: { fecha_pedido: 'desc' }
        });

        return reply.send(pedidos);
    },

    // Obtener pedidos específicos de un servicio para un cliente (para ver estado en ServiceDetails)
    async getStatusForService(request: FastifyRequest, reply: FastifyReply) {
        const { id_servicio } = request.params as { id_servicio: string };
        const user = (request as any).user;

        const pedido = await request.server.prisma.pedido.findFirst({
            where: {
                id_servicio: parseInt(id_servicio),
                id_cliente: user.id_usuario,
                estado: { not: 'CANCELADO' }
            },
            include: { resena: true },
            orderBy: { fecha_pedido: 'desc' }
        });

        return reply.send(pedido);
    },

    // Listar usuarios que han enviado mensajes al estudiante (Interesados)
    async getInteresados(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;

        // Obtener IDs de usuarios que han enviado mensajes al estudiante logueado
        const mensajes = await (request.server.prisma as any).mensaje.findMany({
            where: { id_receptor: user.id_usuario },
            select: { id_emisor: true },
            distinct: ['id_emisor']
        });

        const emisorIds = mensajes.map((m: any) => m.id_emisor);

        if (emisorIds.length === 0) return reply.send([]);

        const interesados = await request.server.prisma.usuario.findMany({
            where: { id_usuario: { in: emisorIds } },
            select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
                email: true,
                foto_perfil: true,
                carrera: { select: { nombre_carrera: true } }
            }
        });

        return reply.send(interesados);
    },

    // Archivar un pedido (Solo estudiante)
    async archive(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = (request as any).user;

        console.log('Archivando pedido:', id);
        console.log('User ID:', user?.id_usuario);

        const pedido = await request.server.prisma.pedido.findUnique({
            where: { id_pedido: parseInt(id) },
            include: { servicio: true }
        });

        if (!pedido) {
            console.log('Pedido no encontrado:', id);
            return reply.status(404).send({ message: 'Pedido no encontrado' });
        }

        const userId = Number(user.id_usuario);
        if (Number(pedido.servicio.id_usuario) !== userId && Number(pedido.id_cliente) !== userId) {
            console.log('Permiso denegado. Pedido Owner:', pedido.servicio.id_usuario, 'Cliente:', pedido.id_cliente, 'User ID:', userId);
            return reply.status(403).send({ message: 'No tienes permiso para archivar este pedido' });
        }

        const { archivado } = request.body as { archivado?: boolean };
        const statusToSet = archivado !== undefined ? archivado : true;

        console.log(`Actualizando pedido a archivado: ${statusToSet}...`);
        try {
            const pedidoArchivado = await request.server.prisma.pedido.update({
                where: { id_pedido: parseInt(id) },
                data: { archivado: statusToSet }
            });
            console.log('Operación de archivo exitosa');
            return reply.send(pedidoArchivado);
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            return reply.status(500).send({ message: 'Error interno al procesar archivo' });
        }
    }
};
