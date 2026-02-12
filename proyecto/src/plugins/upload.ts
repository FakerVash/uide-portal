import fp from 'fastify-plugin';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';

export default fp(async (fastify) => {
    // Registrar multipart para manejo de archivos
    await fastify.register(multipart, {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB límite
        }
    });

    // Registrar static para servir las imágenes
    // Las imágenes serán accesibles en http://localhost:3000/uploads/imagen.jpg
    await fastify.register(fastifyStatic, {
        root: path.resolve(process.cwd(), 'uploads'),
        prefix: '/uploads/',
    });
});
