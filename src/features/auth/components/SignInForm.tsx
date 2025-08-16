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
import { IconAlertTriangle } from "@tabler/icons-react";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { useRouter } from "next/navigation";

type ActionResult = { ok?: boolean; message?: string };

export function SignInForm({
  action,
  title = "Sign in",
  submitLabel = "Continue",
  forgotHref = "/forgot-password",
}: {
  action: (email: string, password: string) => Promise<ActionResult>;
  title?: string;
  submitLabel?: string;
  forgotHref?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : "Invalid email address"),
      password: (v) => (v.length >= 1 ? null : "Password required"),
    },
  });

  const onSubmit = form.onSubmit(async ({ email, password }) => {
    setError(null);
    setLoading(true);
    const res = await action(email, password);
    setLoading(false);

    console.log(res, "res")

    if (res.ok) {
      router.replace("/dashboard");
    } else if (res.message) {
      setError(res.message);
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
          Enter your email and password to continue
        </Text>
        <Divider my="xs" variant="dashed" />

        <TextInput
          label="Email"
          placeholder="you@example.com"
          withAsterisk
          size="md"
          radius="md"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="••••••••"
          withAsterisk
          size="md"
          radius="md"
          {...form.getInputProps("password")}
        />

        <Group justify="space-between" mt="md">
          <Anchor size="sm" href={forgotHref}>
            Forgot password?
          </Anchor>
          <Anchor size="sm" href="/sign-up">
            Create an account
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
        >
          {submitLabel}
        </GlowButton>
      </Stack>
    </Paper>
  );
}
