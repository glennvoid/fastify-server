import type { FastifyPluginAsync } from 'fastify';
import type { Mongoose, MongooseOptions } from 'mongoose';
import mongoose from "mongoose";
import fp from 'fastify-plugin'

declare module 'fastify' {
    interface fastifyInstance {
        mongoose: Mongoose
    }
}

export interface Options {
    url: string,
}

const mongoosePlugin: FastifyPluginAsync<Options> = async (instance, options) => {

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
}

export default fp(mongoosePlugin, "4.x")
