import { FastifyReply, FastifyRequest } from 'fastify';

export const MensajeController = {
    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as {
            id_receptor: number,
            contenido: string
        };
        const user = (request as any).user;

        if (!user) {
            return reply.status(401).send({ message: 'No autenticado' });
        }

        // Evitar que se envíe a sí mismo (COMENTADO PARA DEMO)
        // if (user.id_usuario === body.id_receptor) {
        //    return reply.status(400).send({ message: 'No puedes enviarte un mensaje a ti mismo' });
        // }

        const nuevoMensaje = await request.server.prisma.mensaje.create({
            data: {
                id_emisor: user.id_usuario,
                id_receptor: body.id_receptor,
                contenido: body.contenido
            }
        });

        return reply.status(201).send(nuevoMensaje);
    }
};
