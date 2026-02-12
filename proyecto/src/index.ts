import Fastify from 'fastify';
import buildApp from './app.js';

const fastify = Fastify({
    logger: true
});

const start = async () => {
    try {
        await buildApp(fastify);
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
