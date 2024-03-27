import type { FastifyPluginAsync } from "fastify";
import { userModel, UserBodySchema, UserResponseSchema } from '../db/models/User'
import type { UserSchema } from "../db/models/User";
import { TimeSpan } from "lucia";

const userRoutes: FastifyPluginAsync = async (server) => {
    server.post<{ Body: UserSchema }>('/register', {
        schema: {
            body: UserBodySchema,
            response: {
                201: UserResponseSchema
            },
        }
    }, async (req, reply) => {
        try {
            const user = await userModel.create(req.body)

            const session = await server.lucia.createSession(user._id.toString(), {
                expiresIn: 60 * 60 * 24 * 30,
            })


            await reply.header("set-cookie", server.lucia.createSessionCookie(session.id).serialize()).code(201).send(user)
        } catch (error) {
            return error
        }
    })

    server.post<{ Body: UserSchema }>('/login', {
        schema: {
            body: UserBodySchema,
            response: {
                200: UserResponseSchema
            }
        }
    }, async (req, reply) => {
        try {
            const user = await userModel.findOne({ email: req.body.email })
            if (user && (await user.matchPassword(req.body.password))) {
                const session = await server.lucia.createSession(user._id.toString(), {
                    expiresIn: 60 * 60 * 24 * 30,
                })
                reply
                    .status(200)
                    .header("set-cookie", server.lucia.createSessionCookie(session.id).serialize())
                    .header("location", "/")
                    .send(user)
            }

        } catch (error) {
            return error
        }
    })

    server.post("/logout", async (req, reply) => {
        if (!req.session) {
            reply.status(401);
            return;
        }
        await server.lucia.invalidateSession(req.session.id);
        return reply
            .header("set-cookie", server.lucia.createBlankSessionCookie().serialize())
            .redirect("/login");
    })

    server.setErrorHandler((error, req, reply) => {
        reply.code(error.statusCode as number || 500).send({
            code: error.code,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : null
        })
    })
}

export default userRoutes