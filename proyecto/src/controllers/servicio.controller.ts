import { FastifyReply, FastifyRequest } from 'fastify';
import { ServicioDTO } from '../models/servicio.js';

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

        return reply.send({
            ...servicio,
            imagenes: imagenesUrls
        });
    },

    async getAll(request: FastifyRequest, reply: FastifyReply) {
        const { categoria, buscar } = request.query as { categoria?: string, buscar?: string };

        const servicios = await request.server.prisma.servicio.findMany({
            where: {
                activo: true,
                id_categoria: categoria ? parseInt(categoria) : undefined,
                OR: buscar ? [
                    { titulo: { contains: buscar } },
                    { descripcion: { contains: buscar } }
                ] : undefined
            },
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
                ? s.resenas.reduce((sum, r) => sum + r.calificacion, 0) / numResenas
                : null;
            const rating = promedioServicio ?? (s.usuario?.calificacion_promedio ? Number(s.usuario.calificacion_promedio) : null);
            const { resenas, ...rest } = s;
            return { ...rest, calificacion_promedio: rating, _count: s._count };
        });
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
