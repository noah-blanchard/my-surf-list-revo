"use client";

import * as React from "react";
import {
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Title,
  Text,
  Alert,
  Divider,
  Anchor,
  Group,
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
  action: (
    email: string,
    password: string,
    displayName: string,
    steamId64?: string
  ) => Promise<ActionResult>;
  title?: string;
  submitLabel?: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // util
  const onlyDigits = (v: string) => v.replace(/\D+/g, "");

  const form = useForm({
    initialValues: { email: "", password: "", displayName: "", steamId64: "" },
    validateInputOnBlur: true,
    validateInputOnChange: true,
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email address"),
      password: (v) => (v.trim().length >= 6 ? null : "Minimum 6 characters"),
      displayName: (v) => {
        const name = (v ?? "").trim();
        if (name.length < 2)
          return "Display Name must be at least 2 characters";
        if (name.length > 32)
          return "Display Name must be at most 32 characters";
        return null;
      },
      // ⚠️ Tu avais "You can add or change it later" mais champ requis.
      // Je laisse REQUIS comme ton commentaire l’indiquait; si tu veux le rendre optionnel, dis-moi et je te pousse la version.
      steamId64: (v) => {
        const s = onlyDigits(v ?? "");
        if (!s) return "SteamID64 is required";
        if (!/^\d{17}$/.test(s)) return "SteamID64 must be 17 digits";
        if (!s.startsWith("765")) return "SteamID64 should start with 765…";
        return null;
      },
    },
    transformValues: (values) => ({
      email: values.email.trim(),
      password: values.password,
      displayName: values.displayName.trim(),
      steamId64: onlyDigits(values.steamId64.trim()),
    }),
  });

  const disabled = loading || !!successMsg;

  const onSubmit = form.onSubmit(async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    // applique transformValues
    const { email, password, displayName, steamId64 } =
      form.getTransformedValues();

    try {
      const res = await action(email, password, displayName, steamId64);

      if (!res?.ok) {
        setError(res?.message ?? "An error occurred");
      } else {
        setSuccessMsg(
          res?.needsConfirmation
            ? res.message ?? "Check your inbox to confirm your account."
            : res.message ?? "Account created."
        );
      }
    } catch (e) {
      setError((e as Error)?.message ?? "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  });

  return (
    <Paper
      component="form"
      onSubmit={onSubmit}
      radius="md"
      p="lg"
      withBorder
      style={{
        maxWidth: 420,
        minWidth: 420,
        backdropFilter: "blur(10px)",
        background: "rgba(20,20,20,0.55)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <Stack gap="md">
        <Title order={2} ta="center">
          {title}
        </Title>
        <Text c="dimmed" ta="center" size="sm">
          Create an account to continue
        </Text>
        <Divider my="xs" variant="dashed" />

        {successMsg ? (
          <>
            <Alert
              color="teal"
              icon={<IconCheck size={16} />}
              title="Verification required"
            >
              {successMsg}
            </Alert>
            <Anchor size="sm" href="/sign-in">
              Go to Sign in
            </Anchor>
          </>
        ) : (
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              withAsterisk
              size="md"
              radius="md"
              disabled={disabled}
              {...form.getInputProps("email")}
            />

            <TextInput
              label="Display Name"
              placeholder="e.g. Nono"
              withAsterisk
              size="md"
              radius="md"
              disabled={disabled}
              {...form.getInputProps("displayName")}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              withAsterisk
              size="md"
              radius="md"
              disabled={disabled}
              {...form.getInputProps("password")}
            />

            <TextInput
              label="SteamID64"
              withAsterisk
              placeholder="7656XXXXXXXXXXXXXX"
              description="17 digits."
              size="md"
              radius="md"
              disabled={disabled}
              {...form.getInputProps("steamId64")}
              // Normalise en direct à la saisie
              onChange={(e) =>
                form.setFieldValue(
                  "steamId64",
                  onlyDigits(e.currentTarget.value)
                )
              }
            />

            <Group justify="space-between" mt="md">
              <Anchor size="sm" href="/sign-in">
                Already have an account? Sign in
              </Anchor>
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
              disabled={disabled || !form.isValid()}
            >
              {submitLabel}
            </GlowButton>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
