import { Schema, model, Types, Model } from 'mongoose';
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import bcrypt from 'bcryptjs';


const UserObjectSchema = z.object({ _id: z.custom<Types.ObjectId>(), email: z.string().email().min(5), password: z.string().min(8) });

const EmailAndPassword = UserObjectSchema.pick({ email: true, password: true })
const EmailAndPasswordResponse = UserObjectSchema.omit({ password: true })

export type UserSchema = z.infer<typeof EmailAndPassword>

export const UserBodySchema = zodToJsonSchema(EmailAndPassword, { name: "createUser" });
export const UserResponseSchema = zodToJsonSchema(EmailAndPasswordResponse, { name: "createdUser" });

interface UserMethods {
    matchPassword(p: string): Promise<boolean>;
}

type UserModel = Model<UserSchema, {}, UserMethods>

const userSchema = new Schema<UserSchema, UserModel, UserMethods>(
    {
        email: { type: String, required: true },
        password: { type: String, required: true },
    }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

export const userModel = model<UserSchema, UserModel>("User", userSchema)