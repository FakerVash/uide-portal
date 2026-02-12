import { FastifyReply, FastifyRequest } from 'fastify';
import { CarreraDTO } from '../models/carrera.js';

export const CarreraController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        return await request.server.prisma.carrera.findMany({
            include: { facultad: true }
        });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as CarreraDTO;
        return await request.server.prisma.carrera.create({ data: body });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as CarreraDTO;
        return await request.server.prisma.carrera.update({
            where: { id_carrera: parseInt(id) },
            data: body
        });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await request.server.prisma.carrera.delete({
            where: { id_carrera: parseInt(id) }
        });
        return reply.status(204).send();
    }
};
