import Fastify from 'fastify';
const app = Fastify({
    logger: process.env.NODE_ENV === 'development' ? {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        },
    } : true
});
const build = async () => {
    try {
        await app.listen({ port: 3000 });
    }
    catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};
build();
