// ui/components/profile/MeEditProfile.tsx
"use client";

import { Modal, TextInput, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  EditProfileSchema,
  type EditProfilePayload,
  type EditProfileResponse,
} from "@/features/profiles/validators";
import { mantineZodResolver } from "@/lib/zod/zodResolver";
import { editProfileAction } from "../actions";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { useAuth } from "@/features/auth/context/AuthContext";

type Props = {
  opened: boolean;
  onClose: () => void;
  initialDisplayName?: string | null;
  initialSteamId64?: string | null;
};

export function EditProfile({
  opened,
  onClose,
  initialDisplayName,
  initialSteamId64,
}: Props) {
  const qc = useQueryClient();
  const auth = useAuth();

  const form = useForm<EditProfilePayload>({
    initialValues: {
      display_name: initialDisplayName ?? "",
      steam_id64: initialSteamId64 ?? "",
    },
    validate: mantineZodResolver(EditProfileSchema, {
      duplicateStrategy: "first", // ou "all"
      pathSeparator: ".",
      formLevelKey: "_form",
    }),
    validateInputOnBlur: true,
    validateInputOnChange: true,
  });

  useEffect(() => {
    if (opened) {
      form.setValues({
        display_name: initialDisplayName ?? "",
        steam_id64: initialSteamId64 ?? "",
      });
      form.resetDirty();
      form.clearErrors();
    }
  }, [opened, initialDisplayName, initialSteamId64]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation<EditProfileResponse, Error, EditProfilePayload>({
    mutationFn: (payload) => editProfileAction(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["api", "profiles", auth?.user?.id] });
      onClose();
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title="Edit profile" centered>
      <form onSubmit={form.onSubmit((values) => mutation.mutateAsync(values))}>
        <TextInput
          label="Display Name"
          placeholder="Your display name"
          withAsterisk
          mt="xs"
          {...form.getInputProps("display_name")}
        />

        <TextInput
          label="SteamID64"
          placeholder="765XXXXXXXXXXXXXX"
          withAsterisk
          mt="md"
          {...form.getInputProps("steam_id64")}
        />

        {/* Exemple d'affichage d'une erreur globale (si jamais) */}
        {form.errors._form && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            {form.errors._form}
          </div>
        )}

        <Group justify="flex-end" mt="lg">
          <GlowButton variant="default" type="button" onClick={onClose}>
            Cancel
          </GlowButton>
          <GlowButton type="submit" loading={mutation.isPending}>
            Save
          </GlowButton>
        </Group>
      </form>
    </Modal>
  );
}
