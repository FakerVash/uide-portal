import { FastifyReply, FastifyRequest } from 'fastify';

export const checkAuth = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.status(401).send({ message: 'No autorizado o token inválido' });
    }
};

export const checkAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
        const user = request.user as { rol: string };

        if (user.rol !== 'ADMIN') {
            return reply.status(403).send({
                error: 'Forbidden',
                message: 'Solo el administrador puede realizar esta acción'
            });
        }
    } catch (err) {
        return reply.status(401).send({ message: 'No autorizado o token inválido' });
    }
};

export const checkEstudiante = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
        const user = request.user as { rol: string };

        if (user.rol !== 'ESTUDIANTE' && user.rol !== 'ADMIN') {
            return reply.status(403).send({
                error: 'Forbidden',
                message: 'Solo estudiantes o administradores pueden realizar esta acción'
            });
        }
    } catch (err) {
        return reply.status(401).send({ message: 'No autorizado o token inválido' });
    }
};
