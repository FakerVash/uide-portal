import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

export default fp(async (fastify: FastifyInstance) => {
    // Simple Prisma Client for Docker
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        },
        log: ['warn', 'error']
    });

    fastify.decorate('prisma', prisma);

    // Graceful shutdown
    fastify.addHook('onClose', async (fastify) => {
        await prisma.$disconnect();
    });
});
