"use client";

import * as React from "react";
import {
    Paper,
    Stack,
    TextInput,
    PasswordInput,
    Title,
    Text,
    Divider,
    Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { GlowButton } from "@/ui/components/buttons/GlowButton";

type ActionResult = { ok?: false; message?: string } | any;

export function AuthForm({
    title,
    action,
    submitLabel = "Continuer",
    onSuccess,
}: {
    title: string;
    action: (email: string, password: string) => Promise<ActionResult>;
    submitLabel?: string;
    onSuccess?: () => void;
}) {
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<string | null>(null);

    const form = useForm({
        initialValues: { email: "", password: "", remember: true },
        validate: {
            email: (v) =>
                /^\S+@\S+\.\S+$/.test(v) ? null : "Adresse email invalide",
            password: (v) =>
                v.length >= 6 ? null : "Le mot de passe doit contenir au moins 6 caractères",
        },
    });

    const handleSubmit = form.onSubmit(async ({ email, password }) => {
        setMessage(null);
        setLoading(true);
        try {
            const res = await action(email, password);
            if (res?.ok === false) {
                setMessage(res.message ?? "Échec de l'authentification");
                notifications.show({
                    title: "Erreur",
                    message: res.message ?? "Échec de l'authentification",
                });
                return;
            }
            onSuccess?.();
        } catch (e: any) {
            const msg = e?.message ?? "Erreur inattendue";
            setMessage(msg);
            notifications.show({ title: "Erreur", message: msg });
        } finally {
            setLoading(false);
        }
    });

    return (
        <Paper
            radius="md"
            p="lg"
            withBorder
            style={{
                maxWidth: 420,
                minWidth: 420,

                width: "100%",
                backdropFilter: "blur(10px)",
                background: "rgba(20,20,20,0.55)",
                borderColor: "rgba(255,255,255,0.08)",
            }}
            component="form"
            onSubmit={handleSubmit}
        >
            <Flex style={{ height: "100%" }} direction="column" justify={"space-between"} gap="md">
                <Title order={2} ta="center">
                    {title}
                </Title>

                <Text c="dimmed" ta="center" size="sm">
                    Enter your email and password to continue
                </Text>

                <Divider my="xs" variant="dashed" />

                <TextInput
                    name="email"
                    label="Email"
                    placeholder="you@example.com"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("email")}
                />

                <PasswordInput
                    name="password"
                    label="Password"
                    placeholder="••••••••"
                    size="md"
                    radius="md"
                    withAsterisk
                    {...form.getInputProps("password")}
                />

                {message && (
                    <Text c="red.5" size="sm">
                        {message}
                    </Text>
                )}

                <GlowButton
                    type="submit"
                    size="md"
                    radius="md"
                    loading={loading}
                    glowGradient="ocean"
                    glowSize={100}
                    glowOpacity={0.3}
                    fullWidth
                    variant="outline"
                >
                    {submitLabel}
                </GlowButton>
            </Flex>
        </Paper>
    );
}
