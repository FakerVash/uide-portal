import { FastifyReply, FastifyRequest } from 'fastify';
import { EmailService } from '../services/email.service.js';

export const RequerimientoController = {
    // Listar requerimientos (para Estudiantes o Clientes)
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as { id_usuario: number, rol: string, id_carrera?: number };
        const { carrera, mis_requerimientos, ver_archivados } = request.query as { carrera?: string, mis_requerimientos?: string, ver_archivados?: string };

        const where: any = {};

        // Por defecto, no mostrar los que están eliminados lógicamente
        where.estado = { not: 'ELIMINADO' };

        // Filtrar por archivado (por defecto solo no archivados)
        if (ver_archivados !== 'true') {
            where.archivado = false;
        }

        // Si quiere ver SUS requerimientos (Cliente o Estudiante)
        if (mis_requerimientos === 'true' && (user.rol === 'CLIENTE' || user.rol === 'ESTUDIANTE')) {
            where.id_cliente = user.id_usuario;
        }
        // Si no es "mis requerimientos", forzar estado ABIERTO para que los estudiantes
        // no vean requerimientos cerrados en la bolsa de trabajo
        else {
            where.estado = 'ABIERTO';
            // Si es estudiante, mostrar solo de su carrera (o filtro explícito)
            if (user.rol === 'ESTUDIANTE') {
                const student = await request.server.prisma.usuario.findUnique({
                    where: { id_usuario: user.id_usuario },
                    select: { id_carrera: true }
                });
                if (student?.id_carrera) {
                    where.id_carrera = student.id_carrera;
                }
            }
        }

        const requerimientos = await request.server.prisma.requerimiento.findMany({
            where,
            include: {
                carrera: true,
                cliente: {
                    select: { nombre: true, apellido: true, foto_perfil: true }
                },
                postulaciones: {
                    where: { estado: 'ACEPTADA' },
                    include: {
                        estudiante: {
                            select: { nombre: true, apellido: true, telefono: true, email: true, foto_perfil: true }
                        }
                    }
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

        if (user.rol !== 'CLIENTE' && user.rol !== 'ESTUDIANTE') {
            return reply.status(403).send({ message: 'No tienes permiso para actualizar requerimientos' });
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

    // Archivar / Desarchivar requerimiento (Dueño)
    async archive(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number };
        const { archivado } = request.body as { archivado?: boolean };

        const requerimiento = await request.server.prisma.requerimiento.findUnique({
            where: { id_requerimiento: parseInt(id) }
        });

        if (!requerimiento || requerimiento.id_cliente !== user.id_usuario) {
            return reply.status(403).send({ message: 'No autorizado para archivar este requerimiento' });
        }

        const updated = await request.server.prisma.requerimiento.update({
            where: { id_requerimiento: parseInt(id) },
            data: { archivado: archivado ?? true }
        });

        return reply.send(updated);
    },

    // Eliminación lógica (marcar como ELIMINADO, no borrar de la BD)
    async softDelete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number, rol: string };

        if (user.rol !== 'CLIENTE' && user.rol !== 'ESTUDIANTE') {
            return reply.status(403).send({ message: 'No tienes permiso para eliminar requerimientos' });
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

        if (user.rol !== 'CLIENTE' && user.rol !== 'ESTUDIANTE') {
            return reply.status(403).send({ message: 'No tienes permiso para publicar requerimientos' });
        }

        const requerimiento = await request.server.prisma.requerimiento.create({
            data: {
                id_cliente: user.id_usuario,
                id_carrera: body.id_carrera,
                titulo: body.titulo,
                descripcion: body.descripcion,
                presupuesto: body.presupuesto
            },
            include: { carrera: true }
        });

        // Notificar a estudiantes de la carrera (Async)
        (async () => {
            try {
                const estudiantes = await request.server.prisma.usuario.findMany({
                    where: {
                        rol: 'ESTUDIANTE',
                        id_carrera: body.id_carrera,
                        activo: true
                    },
                    select: { email: true }
                });

                if (estudiantes.length > 0) {
                    const emailService = new EmailService();
                    const link = `${process.env.APP_URL || 'http://localhost:5173'}/bolsa-trabajo`; // Ajustar URL según entorno
                    const carreraNombre = requerimiento.carrera.nombre_carrera;

                    for (const est of estudiantes) {
                        // Enviar correos sin esperar (fire-and-forget individual o promesas paralelas si se prefiere)
                        // Aquí lo hacemos secuencial pero sin await global para no bloquear respuesta HTTP
                        await emailService.enviarNotificacionRequerimiento(est.email, body.titulo, carreraNombre, link);
                    }
                }
            } catch (error) {
                console.error('Error notificando estudiantes:', error);
            }
        })();

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

        // No postularse a su propio requerimiento
        if (requerimiento.id_cliente === user.id_usuario) {
            return reply.status(400).send({ message: 'No puedes postularte a tu propio requerimiento' });
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

    // Seleccionar candidato (Solo Dueño)
    async seleccionarCandidato(request: FastifyRequest, reply: FastifyReply) {
        const { id, idPostulacion } = request.params as { id: string, idPostulacion: string };
        const user = request.user as { id_usuario: number, rol: string };

        if (user.rol !== 'CLIENTE' && user.rol !== 'ESTUDIANTE') {
            return reply.status(403).send({ message: 'No tienes permiso para seleccionar candidatos' });
        }

        // 1. Verificar requerimiento y propiedad
        const requerimiento = await request.server.prisma.requerimiento.findUnique({
            where: { id_requerimiento: parseInt(id) },
            include: { carrera: true }
        });

        if (!requerimiento || requerimiento.id_cliente !== user.id_usuario) {
            return reply.status(403).send({ message: 'No autorizado o requerimiento no existe' });
        }

        if (requerimiento.estado !== 'ABIERTO') {
            return reply.status(400).send({ message: 'El requerimiento no está abierto para selección' });
        }

        // 2. Verificar postulación
        const postulacion = await request.server.prisma.postulacion.findUnique({
            where: { id_postulacion: parseInt(idPostulacion) },
            include: { estudiante: true }
        });

        if (!postulacion || postulacion.id_requerimiento !== parseInt(id)) {
            return reply.status(404).send({ message: 'Postulación no válida' });
        }

        // 3. Actualizar estados (Transacción para consistencia)
        // - Requerimiento -> CERRADO (o EN PROCESO si prefieres)
        // - Postulación ganadora -> ACEPTADA
        // - Otras postulaciones -> RECHAZADA (opcional, o dejarlas en PENDIENTE)

        await request.server.prisma.$transaction([
            request.server.prisma.requerimiento.update({
                where: { id_requerimiento: parseInt(id) },
                data: { estado: 'CERRADO' }
            }),
            request.server.prisma.postulacion.update({
                where: { id_postulacion: parseInt(idPostulacion) },
                data: { estado: 'ACEPTADA' }
            })
        ]);

        // 4. Notificar al estudiante seleccionado (Async)
        (async () => {
            try {
                if (postulacion.estudiante.email) {
                    const emailService = new EmailService();
                    const subject = `¡Felicidades! Has sido seleccionado: ${requerimiento.titulo}`;
                    const html = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                            <h2 style="color: #870a42;">¡Has sido seleccionado!</h2>
                            <p>Hola <strong>${postulacion.estudiante.nombre}</strong>,</p>
                            <p>El cliente ha revisado tu perfil y te ha seleccionado para el requerimiento:</p>
                            <blockquote style="background: #f9f9f9; border-left: 4px solid #870a42; padding: 10px;">
                                <strong>${requerimiento.titulo}</strong>
                            </blockquote>
                            <p>Se pondrán en contacto contigo pronto vía WhatsApp o teléfono.</p>
                            <p>¡Mucho éxito!</p>
                        </div>
                    `;
                    // Usamos el metodo generico sendMail del servicio (si es privado, habría que exponer uno público o usar el transporter directamente si es publico)
                    // Asumimos que podemos acceder al transporter o crear un metodo generico de notificacion simple.
                    // Para simplificar, si EmailService tiene metodo 'enviarNotificacionRequerimiento', podemos crear uno 'enviarNotificacionSeleccion'
                    // O si tiene transporter publico. 
                    // Revisando EmailService anterior, tiene un metodo especifico. Agreguemos uno nuevo o usemos sendMail si es accesible.
                    // Vamos a asumir que agregaremos 'enviarNotificacionSeleccion' en EmailService o usaremos una lógica similar.
                    // Por ahora, para no complicar, intentemos usar lo que hay o simplemente log (ya que tendría que editar EmailService también).

                    // Mejor: Editaré EmailService después para agregar 'enviarNotificacionSeleccion'.
                    await emailService.sendHtmlEmail(postulacion.estudiante.email, subject, html);
                    console.log(`Notificando a ${postulacion.estudiante.email} de su selección.`);
                }
            } catch (error) {
                console.error('Error enviando email de selección:', error);
            }
        })();

        return reply.send({ message: 'Candidato seleccionado exitosamente' });
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
                        calificacion_promedio: true,
                        habilidades: { include: { habilidad: true } }
                    }
                }
            }
        });

        return reply.send(postulaciones);
    },

    // Ver mis postulaciones (Solo Estudiante)
    async getMisPostulaciones(request: FastifyRequest, reply: FastifyReply) {
        const user = request.user as { id_usuario: number, rol: string };

        if (user.rol !== 'ESTUDIANTE') {
            return reply.status(403).send({ message: 'Solo estudiantes pueden ver sus postulaciones' });
        }

        const postulaciones = await request.server.prisma.postulacion.findMany({
            where: { id_estudiante: user.id_usuario },
            include: {
                requerimiento: {
                    include: {
                        carrera: true,
                        cliente: {
                            select: { nombre: true, apellido: true, foto_perfil: true }
                        }
                    }
                }
            },
            orderBy: { fecha_postulacion: 'desc' }
        });

        return reply.send(postulaciones);
    }
};
