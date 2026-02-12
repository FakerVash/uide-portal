import { FastifyReply, FastifyRequest } from 'fastify';
import { UsuarioHabilidadDTO } from '../models/usuario-habilidad.js';

export const UsuarioHabilidadController = {
    async getMySkills(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as any;
        const id_usuario = user.id_usuario;
        return await request.server.prisma.usuarioHabilidad.findMany({
            where: { id_usuario },
            include: { habilidad: true }
        });
    },

    async addSkill(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as UsuarioHabilidadDTO;
        return await request.server.prisma.usuarioHabilidad.create({ data: body });
    },

    async removeSkill(request: FastifyRequest, reply: FastifyReply) {
        const { id_usuario, id_habilidad } = request.params as { id_usuario: string, id_habilidad: string };
        await request.server.prisma.usuarioHabilidad.delete({
            where: {
                id_usuario_id_habilidad: {
                    id_usuario: parseInt(id_usuario),
                    id_habilidad: parseInt(id_habilidad)
                }
            }
        });
        return reply.status(204).send();
    }
};
