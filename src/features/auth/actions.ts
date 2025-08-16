"use server";
import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "./validators";
import { serverSignIn, serverSignUp, serverSignOut } from "./api";

export async function signUpAction(email: string, password: string, displayName: string, steamId64?: string) {
    const parsed = signUpSchema.safeParse({
        email,
        password,
        displayName,
        steamId64,
    });


    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    try {
        await serverSignUp(parsed.data);
        return { ok: true, message: "Account created successfully. Please check your email to confirm." };
    } catch (e: any) {
        return { ok: false, message: e.message ?? "Failed to sign up" };
    }
}

export async function signInAction(email: string, password: string) {
    const parsed = signInSchema.safeParse({
        email,
        password,
    });
    if (!parsed.success) {
        return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
    try {
        await serverSignIn(parsed.data);
        return { ok: true, message: "Signed in successfully" };
    } catch (e: any) {
        return { ok: false, message: e.message ?? "Failed to sign in" };
    }
}

export async function signOutAction() {
    try {
        await serverSignOut();
    } finally {
        redirect("/sign-in");
    }
}