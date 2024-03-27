import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import closeWithGrace from 'close-with-grace'
import type { CloseWithGraceCallback } from 'close-with-grace'

import mongoose from './plugins/mongoose'
import lucia from './plugins/lucia'
import userRoutes from './routes/user'

const app: FastifyInstance = Fastify({
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

app.register(lucia)

app.register(mongoose, {
    url: process.env.MONGO_URI
})
app.register(userRoutes, { prefix: "auth" })

app.listen({ port: process.env.PORT }, (err) => {
    if (err) {
        app.log.error(err.message)
        process.exit(1)
    }
})

closeWithGrace({ delay: 500 }, function (opts, cb) {
    app.log.info(opts.signal, 'server closing')
    app.close(cb)
} as CloseWithGraceCallback)
