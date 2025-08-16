import { z } from "zod";

const steamId64Schema = z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
        .string()
        .regex(/^\d{17}$/, "SteamID64 must be 17 digits")
        .refine((s) => s.startsWith("765"), "SteamID64 should start with 765…")
);

export const signUpSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        displayName: z
            .string()
            .trim()
            .min(2, "Display Name must be at least 2 characters")
            .max(32, "Display Name must be at most 32 characters"),
        steamId64: steamId64Schema, // now required
    })
    .required();

export const signInSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(1, "Password is required"),
    })
    .required();

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
