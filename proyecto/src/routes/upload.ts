import { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import util from 'util';
import { randomUUID } from 'crypto';

const pump = util.promisify(pipeline);

const uploadRoutes: FastifyPluginAsync = async (fastify, opts) => {
    fastify.post('/', async (request, reply) => {
        const data = await request.file();

        if (!data) {
            return reply.status(400).send({ message: 'No se subió ningún archivo' });
        }

        const extension = path.extname(data.filename);
        // Sanitize filename: remove spaces and special chars if needed, but definitely trim
        const uniqueFilename = `${randomUUID()}${extension}`.trim();
        const uploadPath = path.resolve(process.cwd(), 'uploads', uniqueFilename);

        await pump(data.file, fs.createWriteStream(uploadPath));

        // Construir URL relativa (el frontend/proxy debe manejar la base)
        const url = `/uploads/${uniqueFilename}`;

        return {
            message: 'Archivo subido exitosamente',
            url: url,
            filename: uniqueFilename
        };
    });
};

export default uploadRoutes;
