import Fastify from 'fastify'
import closeWithGrace from 'close-with-grace'
import type { CloseWithGraceCallback } from 'close-with-grace'

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
})


const run = async () => {
    try {
        await app.listen({ port: 3000 })
    } catch (error) {
        app.log.error(error)
        process.exit(1)
    }
}

closeWithGrace(function (opts, cb) {
    app.log.info(opts.signal, 'server closing')
    app.close(cb)
} as CloseWithGraceCallback)

run()