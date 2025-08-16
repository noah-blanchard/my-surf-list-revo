"use client";

import * as React from "react";
import {
  Paper, Stack, TextInput, PasswordInput, Title, Text, Alert, Divider, Anchor, Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { GlowButton } from "@/ui/components/buttons/GlowButton";

type ActionResult =
  | { ok: true; message?: string; needsConfirmation?: boolean }
  | { ok: false; message?: string };

export function SignUpForm({
  action,
  title = "Create account",
  submitLabel = "Create account",
}: {
  action: (email: string, password: string, displayName: string, steamId64?: string) => Promise<ActionResult>;
  title?: string;
  submitLabel?: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: { email: "", password: "", displayName: "", steamId64: "" },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email address"),
      password: (v) => (v.length >= 6 ? null : "Minimum 6 characters"),
      displayName: (v) => {
        const name = (v ?? "").trim();
        if (name.length < 2) return "Display Name must be at least 2 characters";
        if (name.length > 32) return "Display Name must be at most 32 characters";
        return null;
      },
      // steam id isnt optional
      steamId64: (v) => {
        if (!v) return "SteamID64 is required";
        if (!/^\d{17}$/.test(v)) return "SteamID64 must be 17 digits";
        if (!v.startsWith("765")) return "SteamID64 should start with 765…";
        return null;
      },
    },
  });

  const onSubmit = form.onSubmit(async ({ email, password, displayName, steamId64 }) => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const sid = steamId64.trim();
    const res = await action(email, password, displayName.trim(), sid);
    setLoading(false);


    if (!res?.ok) {
      setError(res?.message ?? "An error occurred");
      return;
    }
    setSuccessMsg(
      res?.needsConfirmation
        ? res.message ?? "Check your inbox to confirm your account."
        : res.message ?? "Account created."
    );
  });

  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      radius="md"
      p="lg"
      withBorder
      style={{
        maxWidth: 420, minWidth: 420,
        backdropFilter: "blur(10px)",
        background: "rgba(20,20,20,0.55)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Stack gap="md">
        <Title order={2} ta="center">{title}</Title>
        <Text c="dimmed" ta="center" size="sm">Create an account to continue</Text>
        <Divider my="xs" variant="dashed" />

        {successMsg ? (
          <>
            <Alert color="teal" icon={<IconCheck size={16} />} title="Verification required">
              {successMsg}
            </Alert>
            <Anchor size="sm" href="/sign-in">Go to Sign in</Anchor>
          </>

        ) : (
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              withAsterisk
              size="md"
              radius="md"
              {...form.getInputProps("email")}
            />

            <TextInput
              label="Display Name"
              placeholder="e.g. Nono"
              withAsterisk
              size="md"
              radius="md"
              {...form.getInputProps("displayName")}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              withAsterisk
              size="md"
              radius="md"
              {...form.getInputProps("password")}
            />

            <TextInput
              label="SteamID64"
              withAsterisk
              placeholder="7656XXXXXXXXXXXXXX"
              description="17 digits. You can add or change it later in your profile."
              size="md"
              radius="md"
              {...form.getInputProps("steamId64")}
            />

            <Group justify="space-between" mt="md">
              <Anchor size="sm" href="/sign-in">Already have an account? Sign in</Anchor>
            </Group>

            {error && (
              <Alert color="red" icon={<IconAlertTriangle size={16} />}>
                {error}
              </Alert>
            )}

            <GlowButton
              type="submit"
              fullWidth
              loading={loading}
              variant="default"
              glowGradient="ocean"
              glowOpacity={0.3}
            >
              {submitLabel}
            </GlowButton>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
