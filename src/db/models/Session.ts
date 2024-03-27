import { Schema, model } from 'mongoose';
import { z } from "zod";

const SessionObjectSchema = z.object({ _id: z.string(), user_id: z.string(), expires_at: z.date() })
export type SessionSchema = z.infer<typeof SessionObjectSchema>

const sessionSchema = new Schema<SessionSchema>(
    {
        _id: { type: String, required: true },
        user_id: { type: String, required: true },
        expires_at: { type: Date, required: true },
    },
    {
        _id: false
    }
)

export const Session = model("Session", sessionSchema)