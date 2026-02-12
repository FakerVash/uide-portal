import { FastifyReply, FastifyRequest } from 'fastify';
import { FacultadDTO } from '../models/facultad.js';

export const FacultadController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        return await request.server.prisma.facultad.findMany({
            include: { carreras: true }
        });
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as FacultadDTO;
        return await request.server.prisma.facultad.create({ data: body });
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as FacultadDTO;
        return await request.server.prisma.facultad.update({
            where: { id_facultad: parseInt(id) },
            data: body
        });
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        await request.server.prisma.facultad.delete({
            where: { id_facultad: parseInt(id) }
        });
        return reply.status(204).send();
    }
};
