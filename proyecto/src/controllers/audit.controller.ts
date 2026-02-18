import { FastifyReply, FastifyRequest } from 'fastify';

export const AuditController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const { limit = '50', offset = '0', usuario_id, accion } = request.query as {
            limit?: string;
            offset?: string;
            usuario_id?: string;
            accion?: string;
        };

        const where: any = {};

        if (usuario_id) {
            where.id_usuario = parseInt(usuario_id);
        }

        if (accion) {
            where.accion = { contains: accion };
        }

        const [logs, total] = await Promise.all([
            request.server.prisma.auditoria.findMany({
                where,
                take: parseInt(limit),
                skip: parseInt(offset),
                orderBy: { fecha: 'desc' },
                include: {
                    usuario: {
                        select: {
                            id_usuario: true,
                            nombre: true,
                            apellido: true,
                            email: true,
                            rol: true
                        }
                    }
                }
            }),
            request.server.prisma.auditoria.count({ where })
        ]);

        return {
            data: logs,
            pagination: {
                total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        };
    }
};
