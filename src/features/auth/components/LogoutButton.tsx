import { useState } from "react";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { signOutAction } from "../actions";
import { Modal, Button, Text } from "@mantine/core";

export function SignOutButton() {
    const [opened, setOpened] = useState(false);
    const [loading, setLoading] = useState(false);

    async function logout() {
        setLoading(true);
        await signOutAction();
        setLoading(false);
    }

    return (
        <>
            <GlowButton glowGradient={"magma"} glowOpacity={0.7} glowSize={200} onClick={() => setOpened(true)}>
                Logout
            </GlowButton>
            <Modal
                radius={"md"}
                opened={opened}
                onClose={() => setOpened(false)}
                title="Confirm Logout"
                centered
            >
                <Text mb="md" fw={500}>Are you sure you want to logout?</Text>
                <GlowButton loading={loading} color="red" glowGradient={"magma"} glowOpacity={0.7} glowSize={200} onClick={logout} mr="sm">
                    Yes, Logout
                </GlowButton>
                <GlowButton variant="default" glowOpacity={0.7} glowSize={200} onClick={() => setOpened(false)}>
                    Cancel
                </GlowButton>
            </Modal>
        </>
    );
}