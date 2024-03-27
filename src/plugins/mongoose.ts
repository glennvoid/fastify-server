import type { FastifyPluginAsync } from 'fastify';
import type { Mongoose } from 'mongoose';
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

const MongoosePlugin: FastifyPluginAsync<Options> = async (instance, options) => {
    instance.addHook('onListen', async () => {
        try {
            await mongoose.connect(options.url)
        } catch (error) {
            instance.log.error(`Error connecting to MongoDB: ${error}`)
        }
    })

    mongoose.connection.on('connected', () => instance.log.info('Mongoose database is connected'));
    mongoose.connection.on('open', () => instance.log.info('Mongoose connection is open'));
    mongoose.connection.on('disconnecting', () => instance.log.info('Mongoose database is disconnecting'));
    mongoose.connection.on('disconnected', () => instance.log.info('Mongoose database is disconnected'));
    mongoose.connection.on('reconnected', () => instance.log.info('Mongoose database is reconnected'));
    mongoose.connection.on('close', () => instance.log.info('Mongoose connection is close'));

    instance.decorate('mongoose', mongoose);

    instance.addHook('onClose', async () => {
        await mongoose.disconnect()
    });

}

export default fp(MongoosePlugin, {
    fastify: '4.x',
    name: 'mongoose-plugin'
})
