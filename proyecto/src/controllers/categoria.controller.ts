import { FastifyReply, FastifyRequest } from 'fastify';

export const CategoriaController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        return await request.server.prisma.categoria.findMany();
    },

    async getServiciosById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        return await request.server.prisma.servicio.findMany({
            where: { id_categoria: parseInt(id), activo: true }
        });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as any;
        return await request.server.prisma.categoria.create({ data: body });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as any;
        return await request.server.prisma.categoria.update({
            where: { id_categoria: parseInt(id) },
            data: body
        });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await request.server.prisma.categoria.delete({
            where: { id_categoria: parseInt(id) }
        });
        return reply.status(204).send();
    }
};
