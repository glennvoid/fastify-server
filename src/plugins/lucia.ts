import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin'
import { Lucia, verifyRequestOrigin } from "lucia";
import type { User, Session } from "lucia";
import { MongodbAdapter } from '@lucia-auth/adapter-mongodb';
import { connection } from 'mongoose';

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: {
            email: string;
        };
    }
}

declare module "fastify" {
    interface FastifyInstance {
        lucia: Lucia;
    }
    interface FastifyRequest {
        user: User | null;
        session: Session | null;
    }
    interface FastifyReply {
        user: User | null;
        session: Session | null;
    }
}

const adapter = new MongodbAdapter(
    connection.collection("sessions"),
    connection.collection("users")
);

const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "PRODUCTION" // set `Secure` flag in HTTPS
        }
    },
    getUserAttributes: (attributes) => {
        return {
            // we don't need to expose the hashed password!
            email: attributes.email
        };
    }
});

const luciaPlugin: FastifyPluginAsync = async (instance, options) => {
    instance.decorateRequest("user", null)

    instance.addHook("onRequest", (req, reply, done) => {
        if (req.method === "GET") {
            done()
        }

        const originHeader = req.headers.origin ?? null;
        const hostHeader = req.headers.host ?? null;

        if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
            reply.status(403);
        }

        done()
    })

    instance.addHook('preHandler', async (req, reply) => {
        const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");

        if (!sessionId) {
            reply.user = null
            reply.session = null
            return;
        }

        const { session, user } = await lucia.validateSession(sessionId);

        console.log(user)

        if (!session) {
            reply.header("set-cookie", lucia.createBlankSessionCookie().serialize())
        }

        if (session && session.fresh) {
            reply.header("set-cookie", lucia.createSessionCookie(session.id).serialize())
        }

        reply.user = user;
        reply.session = session;

        return;
    })

    instance.decorate("lucia", lucia)
}

export default fp(luciaPlugin, {
    fastify: '4.x',
    name: 'lucia-plugin'
})
