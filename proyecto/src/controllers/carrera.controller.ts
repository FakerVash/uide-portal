import { FastifyReply, FastifyRequest } from 'fastify';
import { CarreraDTO } from '../models/carrera.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const CarreraController = {
    async getAll(request: FastifyRequest, reply: FastifyReply) {
        return await request.server.prisma.carrera.findMany({
            include: {
                facultad: true,
                _count: {
                    select: { usuarios: true }
                }
            },
            orderBy: { nombre_carrera: 'asc' }
        });
    },

    async getById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const carrera = await request.server.prisma.carrera.findUnique({
            where: { id_carrera: parseInt(id) },
            include: {
                facultad: true,
                _count: {
                    select: { usuarios: true }
                }
            }
        });

        if (!carrera) {
            return reply.status(404).send({ error: 'Carrera no encontrada' });
        }

        return carrera;
    },

    async create(request: FastifyRequest, reply: FastifyReply) {
        const body = request.body as CarreraDTO;
        try {
            const carrera = await request.server.prisma.carrera.create({
                data: body,
                include: {
                    facultad: true,
                    _count: {
                        select: { usuarios: true }
                    }
                }
            });
            return reply.status(201).send(carrera);
        } catch (error) {
            return reply.status(400).send({ error: 'Error al crear carrera' });
        }
    },

    async update(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const body = request.body as CarreraDTO;

        try {
            const carrera = await request.server.prisma.carrera.update({
                where: { id_carrera: parseInt(id) },
                data: body,
                include: {
                    facultad: true,
                    _count: {
                        select: { usuarios: true }
                    }
                }
            });
            return carrera;
        } catch (error) {
            return reply.status(404).send({ error: 'Carrera no encontrada' });
        }
    },

    async delete(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

        try {
            await request.server.prisma.carrera.delete({
                where: { id_carrera: parseInt(id) }
            });
            return reply.status(204).send();
        } catch (error) {
            return reply.status(404).send({ error: 'Carrera no encontrada' });
        }
    },

    async uploadImage(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const { tipo = 'imagen' } = request.query as { tipo?: string };

        try {
            const data = await request.file();
            if (!data) {
                return reply.status(400).send({ error: 'No se proporcionó ninguna imagen' });
            }

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(data.mimetype)) {
                return reply.status(400).send({ error: 'Tipo de archivo no permitido' });
            }

            // Crear directorio si no existe
            const uploadDir = path.join(process.cwd(), 'uploads', 'carreras');
            await mkdir(uploadDir, { recursive: true });

            // Generar nombre de archivo
            const extension = data.filename.split('.').pop();
            const filename = `carrera-${id}-${tipo}-${Date.now()}.${extension}`;
            const filepath = path.join(uploadDir, filename);

            // Guardar archivo
            const buffer = await data.toBuffer();
            await writeFile(filepath, buffer);

            // Actualizar base de datos
            const updateData = tipo === 'banner'
                ? { banner_carrera: `/uploads/carreras/${filename}` }
                : { imagen_carrera: `/uploads/carreras/${filename}` };

            const carrera = await request.server.prisma.carrera.update({
                where: { id_carrera: parseInt(id) },
                data: updateData,
                include: { facultad: true }
            });

            return {
                message: 'Imagen subida exitosamente',
                carrera,
                imageUrl: `/uploads/carreras/${filename}`
            };

        } catch (error) {
            return reply.status(500).send({ error: 'Error al subir imagen' });
        }
    },

    async toggleActive(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };

        try {
            const carrera = await request.server.prisma.carrera.findUnique({
                where: { id_carrera: parseInt(id) }
            });

            if (!carrera) {
                return reply.status(404).send({ error: 'Carrera no encontrada' });
            }

            const updatedCarrera = await request.server.prisma.carrera.update({
                where: { id_carrera: parseInt(id) },
                data: { activo: !carrera.activo },
                include: { facultad: true }
            });

            return {
                message: `Carrera ${updatedCarrera.activo ? 'activada' : 'desactivada'} exitosamente`,
                carrera: updatedCarrera
            };

        } catch (error) {
            return reply.status(500).send({ error: 'Error al cambiar estado' });
        }
    }
};
