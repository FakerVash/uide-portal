import { FastifyReply, FastifyRequest } from 'fastify';
import { ServicioDTO } from '../models/servicio.js';
import { AuditService } from '../services/audit.service.js';

export const ServicioController = {
    async getById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const servicio = await request.server.prisma.servicio.findUnique({
            where: { id_servicio: parseInt(id) },
            include: {
                usuario: {
                    select: {
                        id_usuario: true,
                        nombre: true,
                        apellido: true,
                        foto_perfil: true,
                        telefono: true,
                        email: true,
                        calificacion_promedio: true,
                        activo: true,
                        carrera: {
                            select: { nombre_carrera: true }
                        },
                        habilidades: {
                            include: { habilidad: true }
                        }
                    }
                },
                categoria: true,
                imagenes: true,
                resenas: {
                    include: {
                        usuario: {
                            select: { nombre: true, apellido: true, foto_perfil: true }
                        }
                    },
                    orderBy: { fecha_resena: 'desc' }
                },
                _count: {
                    select: { resenas: true }
                }
            }
        });

        if (!servicio || !servicio.activo || !servicio?.usuario?.activo) {
            return reply.status(404).send({ message: 'Servicio no encontrado o inactivo' });
        }

        // Transform imagenes to URL array
        const imagenesUrls = (servicio as any).imagenes?.map((img: any) => img.url) || [];

        // Calculate Average Rating
        const numResenas = (servicio as any)._count?.resenas || 0;
        const promedioServicio = numResenas > 0
            ? (servicio as any).resenas.reduce((sum: number, r: any) => sum + Number(r.calificacion), 0) / numResenas
            : null;

        const rating = promedioServicio ?? (servicio.usuario?.calificacion_promedio ? Number(servicio.usuario.calificacion_promedio) : null);

        const { resenas, ...rest } = servicio as any;

        return reply.send({
            ...rest,
            resenas,
            imagenes: imagenesUrls,
            calificacion_promedio: rating !== null ? parseFloat(rating.toFixed(2)) : null
        });
    },

    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const { categoria, buscar, carrera, mis_servicios, ver_archivados } = request.query as {
            categoria?: string,
            buscar?: string,
            carrera?: string,
            mis_servicios?: string,
            ver_archivados?: string
        };

        const where: any = { activo: true };

        // Filtrar por archivado (por defecto solo no archivados)
        if (ver_archivados !== 'true') {
            where.archivado = false;
        }

        if (categoria) {
            where.id_categoria = parseInt(categoria);
        }

        if (carrera) {
            where.usuario = { id_carrera: parseInt(carrera) };
        }

        if (buscar) {
            where.OR = [
                { titulo: { contains: buscar } },
                { descripcion: { contains: buscar } }
            ];
        }

        // Si es "mis servicios", filtrar por el usuario actual
        if (mis_servicios === 'true' && request.user) {
            const user = request.user as { id_usuario: number };
            where.id_usuario = user.id_usuario;
        }

        const servicios = await request.server.prisma.servicio.findMany({
            where,
            include: {
                usuario: { select: { nombre: true, apellido: true, calificacion_promedio: true } },
                categoria: true,
                _count: { select: { resenas: true } },
                resenas: { select: { calificacion: true } }
            }
        });

        return servicios.map(s => {
            const numResenas = s._count.resenas;
            const promedioServicio = numResenas > 0
                ? s.resenas.reduce((sum, r) => sum + Number(r.calificacion), 0) / numResenas
                : null;
            const rating = promedioServicio ?? (s.usuario?.calificacion_promedio ? Number(s.usuario.calificacion_promedio) : null);
            const { resenas, ...rest } = s;
            return {
                ...rest,
                archivado: s.archivado, // Ensure this is explicitly passed
                calificacion_promedio: rating !== null ? parseFloat(rating.toFixed(2)) : null,
                _count: s._count
            };
        });
    },

    // Archivar / Desarchivar servicio (Dueño)
    async archive(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number };
        const { archivado } = request.body as { archivado?: boolean };

        const servicio = await request.server.prisma.servicio.findUnique({
            where: { id_servicio: parseInt(id) }
        });

        if (!servicio || servicio.id_usuario !== user.id_usuario) {
            return reply.status(403).send({ message: 'No autorizado para archivar este servicio' });
        }

        const updated = await request.server.prisma.servicio.update({
            where: { id_servicio: parseInt(id) },
            data: { archivado: archivado ?? true }
        });

        return reply.send(updated);
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as ServicioDTO;
        const nuevoServicio = await request.server.prisma.servicio.create({
            data: {
                id_usuario: body.id_usuario,
                id_categoria: body.id_categoria,
                titulo: body.titulo,
                descripcion: body.descripcion,
                precio: body.precio,
                tiempo_entrega: body.tiempo_entrega,
                imagen_portada: body.imagen_portada,
                imagenes: body.imagenes && body.imagenes.length > 0 ? {
                    create: body.imagenes.map(url => ({ url }))
                } : undefined
            },
            include: { imagenes: true }
        });

        // Registrar Auditoría
        await AuditService.log(
            request.server,
            body.id_usuario,
            'CREAR_SERVICIO',
            { id_servicio: nuevoServicio.id_servicio, titulo: nuevoServicio.titulo },
            request.ip
        );

        return reply.status(201).send(nuevoServicio);
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = request.user as { id_usuario: number, rol: string };
        const id_usuario_auth = user.id_usuario;
        const body = request.body as Partial<ServicioDTO>;

        // REGLA: Solo el dueño puede editar su servicio
        const servicio = await request.server.prisma.servicio.findUnique({
            where: { id_servicio: parseInt(id) }
        });

        if (!servicio || servicio.id_usuario !== id_usuario_auth) {
            return reply.status(403).send({ message: 'No tienes permiso para editar este servicio' });
        }

        const { imagenes, ...restBody } = body;

        return await request.server.prisma.servicio.update({
            where: { id_servicio: parseInt(id) },
            data: {
                ...restBody,
                imagenes: imagenes ? {
                    deleteMany: {},
                    create: imagenes.map(url => ({ url }))
                } : undefined
            },
            include: { imagenes: true }
        });
    },




    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const user = (request as any).user;

        // Check if service exists and get owner info
        const service = await request.server.prisma.servicio.findUnique({
            where: { id_servicio: parseInt(id) },
            select: { id_usuario: true }
        });

        if (!service) {
            return reply.status(404).send({ error: 'Servicio no encontrado' });
        }

        // Check if user is owner or admin
        if (service.id_usuario !== user.id_usuario && user.rol !== 'ADMIN') {
            return reply.status(403).send({ error: 'No tienes permiso para desactivar este servicio' });
        }

        // Borrado Lógico
        await request.server.prisma.servicio.update({
            where: { id_servicio: parseInt(id) },
            data: { activo: false }
        });

        return reply.status(204).send();
    }
};
