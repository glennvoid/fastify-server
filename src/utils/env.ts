import { z } from 'zod'

const env = z.object({
    NODE_ENV: z.string(),
    MONGO_URI: z.string(),
    PORT: z.number(),
})

env.parse(process.env)

declare global {
    namespace NodeJS {
        interface ProcessEnv
            extends z.infer<typeof env> { }
    }
}