import { FastifyReply, FastifyRequest } from 'fastify';

export const ResenaController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        return await request.server.prisma.resena.findMany({
            include: {
                usuario: true,
                servicio: true
            }
        });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as {
            id_servicio: number,
            calificacion: number,
            comentario?: string,
            id_pedido: number
        };
        const user = (request as any).user;

        // 1. Validar que el pedido exista, sea del cliente y esté COMPLETADO
        const pedido = await request.server.prisma.pedido.findUnique({
            where: { id_pedido: body.id_pedido },
            include: { servicio: true }
        });

        if (!pedido) {
            return reply.status(404).send({ message: 'Pedido no encontrado' });
        }

        if (pedido.id_cliente !== user.id_usuario) {
            return reply.status(403).send({ message: 'No puedes calificar un pedido que no realizaste' });
        }

        if (pedido.estado !== 'COMPLETADO') {
            return reply.status(400).send({ message: 'Solo puedes calificar servicios completados' });
        }

        // 2. Verificar si ya existe una reseña para este pedido
        const reseñaExistente = await request.server.prisma.resena.findUnique({
            where: { id_pedido: body.id_pedido }
        });

        if (reseñaExistente) {
            return reply.status(400).send({ message: 'Este pedido ya ha sido calificado' });
        }

        // 3. Crear la reseña
        const nuevaResena = await request.server.prisma.resena.create({
            data: {
                id_pedido: body.id_pedido,
                id_servicio: body.id_servicio,
                id_usuario: user.id_usuario,
                calificacion: body.calificacion,
                comentario: body.comentario
            }
        });

        // 4. Recalcular la calificación promedio del PROVEEDOR del servicio
        const id_proveedor = pedido.servicio.id_usuario;
        const resenasProveedor = await request.server.prisma.resena.findMany({
            where: {
                servicio: { id_usuario: id_proveedor }
            }
        });

        const promedio = resenasProveedor.reduce((acc, curr) => acc + curr.calificacion, 0) / resenasProveedor.length;

        await request.server.prisma.usuario.update({
            where: { id_usuario: id_proveedor },
            data: { calificacion_promedio: promedio }
        });

        return reply.status(201).send(nuevaResena);
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = (request as any).user;

        const resena = await request.server.prisma.resena.findUnique({
            where: { id_resena: parseInt(id) }
        });

        if (!resena || (resena.id_usuario !== user.id_usuario && user.rol !== 'ADMIN')) {
            return reply.status(403).send({ message: 'No tienes permiso para eliminar esta reseña' });
        }

        await request.server.prisma.resena.delete({
            where: { id_resena: parseInt(id) }
        });
        return reply.status(204).send();
    }
};
