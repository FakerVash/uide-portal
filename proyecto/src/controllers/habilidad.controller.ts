import { FastifyReply, FastifyRequest } from 'fastify';
import { HabilidadDTO } from '../models/habilidad.js';

export const HabilidadController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        return await request.server.prisma.habilidad.findMany();
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as HabilidadDTO;
        return await request.server.prisma.habilidad.create({ data: body });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as HabilidadDTO;
        return await request.server.prisma.habilidad.update({
            where: { id_habilidad: parseInt(id) },
            data: body
        });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await request.server.prisma.habilidad.delete({
            where: { id_habilidad: parseInt(id) }
        });
        return reply.status(204).send();
    }
};
