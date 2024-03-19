import type { FastifyPluginCallback } from 'fastify';
import type { Mongoose, MongooseOptions } from 'mongoose';
import mongoose from "mongoose";
import fp from 'fastify-plugin'

declare module 'fastify' {
    interface FastifyInstance {
        mongoose: Mongoose
    }
}

export interface Options {
    url: string,
}

const MongoosePlugin: FastifyPluginCallback<Options> = (instance, options, done) => {
    instance.addHook('onListen', async () => {
        try {
            await mongoose.connect(options.url)
        } catch (error) {
            instance.log.error(`Error connecting to MongoDB: ${error}`)
        }
    })

    mongoose.connection.on('connected', () => instance.log.info('connected'));
    mongoose.connection.on('open', () => instance.log.info('open'));
    mongoose.connection.on('disconnecting', () => instance.log.info('disconnecting'));
    mongoose.connection.on('disconnected', () => instance.log.info('disconnected'));
    mongoose.connection.on('reconnected', () => instance.log.info('reconnected'));
    mongoose.connection.on('close', () => instance.log.info('close'));

    instance.decorate('mongoose', mongoose);

    instance.addHook('onClose', async () => {
        await mongoose.disconnect()
    });

    done()
}

export default fp(MongoosePlugin, {
    fastify: '4.x',
    name: 'mongoose-plugin'
})
