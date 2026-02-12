import { FastifyReply, FastifyRequest } from 'fastify';

export const RequerimientoController = {
    // Listar requerimientos (para Estudiantes o Clientes)
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as { id_usuario: number, rol: string, id_carrera?: number };
        const { carrera, mis_requerimientos } = request.query as { carrera?: string, mis_requerimientos?: string };

        const where: any = { estado: 'ABIERTO' };

        // Si es cliente y quiere ver SUS requerimientos
        if (mis_requerimientos === 'true' && user.rol === 'CLIENTE') {
            where.id_cliente = user.id_usuario;
            // Mostrar solo los que no están eliminados lógicamente
            where.estado = { not: 'ELIMINADO' };
        }
        // Si es estudiante, mostrar solo de su carrera (o filtro explícito)
        else if (user.rol === 'ESTUDIANTE') {
            // Regla de Oro: Solo ver de su propia carrera
            // Pero permitimos filtrar si se quisiera (aunque la regla dice "solo su carrera")
            // Vamos a forzar la carrera del estudiante si no es admin
            const student = await request.server.prisma.usuario.findUnique({
                where: { id_usuario: user.id_usuario },
                select: { id_carrera: true }
            });
            if (student?.id_carrera) {
                where.id_carrera = student.id_carrera;
            }
        }

        const requerimientos = await request.server.prisma.requerimiento.findMany({
            where,
            include: {
                carrera: true,
                cliente: {
                    select: { nombre: true, apellido: true, foto_perfil: true }
                },
                _count: {
                    select: { postulaciones: true }
                }
            },
            orderBy: { fecha_publicacion: 'desc' }
        });

        return reply.send(requerimientos);
    },

    // Actualizar requerimiento (Solo dueño CLIENTE)
    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number, rol: string };
        const body = request.body as {
            titulo?: string;
            descripcion?: string;
            id_carrera?: number;
            presupuesto?: number | null;
        };

        if (user.rol !== 'CLIENTE') {
            return reply.status(403).send({ message: 'Solo clientes pueden actualizar requerimientos' });
        }

        const requerimiento = await request.server.prisma.requerimiento.findUnique({
            where: { id_requerimiento: parseInt(id) }
        });

        if (!requerimiento || requerimiento.id_cliente !== user.id_usuario) {
            return reply.status(403).send({ message: 'No autorizado para editar este requerimiento' });
        }

        const updated = await request.server.prisma.requerimiento.update({
            where: { id_requerimiento: parseInt(id) },
            data: {
                titulo: body.titulo ?? requerimiento.titulo,
                descripcion: body.descripcion ?? requerimiento.descripcion,
                id_carrera: body.id_carrera ?? requerimiento.id_carrera,
                presupuesto: body.presupuesto ?? requerimiento.presupuesto
            }
        });

        return reply.send(updated);
    },

    // Eliminación lógica (marcar como ELIMINADO, no borrar de la BD)
    async softDelete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number, rol: string };

        if (user.rol !== 'CLIENTE') {
            return reply.status(403).send({ message: 'Solo clientes pueden eliminar requerimientos' });
        }

        const requerimiento = await request.server.prisma.requerimiento.findUnique({
            where: { id_requerimiento: parseInt(id) }
        });

        if (!requerimiento || requerimiento.id_cliente !== user.id_usuario) {
            return reply.status(403).send({ message: 'No autorizado para eliminar este requerimiento' });
        }

        const deleted = await request.server.prisma.requerimiento.update({
            where: { id_requerimiento: parseInt(id) },
            data: { estado: 'ELIMINADO' }
        });

        return reply.send(deleted);
    },

    // Crear requerimiento (Solo Cliente)
    async create(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as { id_usuario: number, rol: string };
        const body = request.body as { titulo: string, descripcion: string, id_carrera: number, presupuesto?: number };

        if (user.rol !== 'CLIENTE') {
            return reply.status(403).send({ message: 'Solo los clientes pueden publicar requerimientos' });
        }

        const requerimiento = await request.server.prisma.requerimiento.create({
            data: {
                id_cliente: user.id_usuario,
                id_carrera: body.id_carrera,
                titulo: body.titulo,
                descripcion: body.descripcion,
                presupuesto: body.presupuesto
            }
        });

        return reply.status(201).send(requerimiento);
    },

    // Postularse (Solo Estudiante)
    async postular(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number, rol: string };

        if (user.rol !== 'ESTUDIANTE') {
            return reply.status(403).send({ message: 'Solo estudiantes pueden postularse' });
        }

        const requerimiento = await request.server.prisma.requerimiento.findUnique({
            where: { id_requerimiento: parseInt(id) }
        });

        if (!requerimiento || requerimiento.estado !== 'ABIERTO') {
            return reply.status(400).send({ message: 'Requerimiento no disponible' });
        }

        // Verificar carrera
        const student = await request.server.prisma.usuario.findUnique({
            where: { id_usuario: user.id_usuario },
            select: { id_carrera: true }
        });

        if (student?.id_carrera !== requerimiento.id_carrera) {
            return reply.status(403).send({ message: 'No perteneces a la carrera solicitada' });
        }

        // Verificar si ya postuló
        const existing = await request.server.prisma.postulacion.findFirst({
            where: { id_requerimiento: parseInt(id), id_estudiante: user.id_usuario }
        });

        if (existing) {
            return reply.status(400).send({ message: 'Ya te has postulado' });
        }

        const postulacion = await request.server.prisma.postulacion.create({
            data: {
                id_requerimiento: parseInt(id),
                id_estudiante: user.id_usuario
            }
        });

        return reply.status(201).send(postulacion);
    },

    // Ver postulantes (Solo Dueño)
    async getPostulantes(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number };

        const requerimiento = await request.server.prisma.requerimiento.findUnique({
            where: { id_requerimiento: parseInt(id) }
        });

        if (!requerimiento || requerimiento.id_cliente !== user.id_usuario) {
            return reply.status(403).send({ message: 'No autorizado' });
        }

        const postulaciones = await request.server.prisma.postulacion.findMany({
            where: { id_requerimiento: parseInt(id) },
            include: {
                estudiante: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        email: true,
                        telefono: true,
                        foto_perfil: true,
                        bio: true,
                        calificacion_promedio: true,
                        habilidades: { include: { habilidad: true } }
                    }
                }
            }
        });

        return reply.send(postulaciones);
    }
};
