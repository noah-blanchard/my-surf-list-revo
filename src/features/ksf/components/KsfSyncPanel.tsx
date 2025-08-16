"use client";
import * as React from "react";
import { Paper, Stack, Group, TextInput, SegmentedControl, Switch, Select } from "@mantine/core";
import { KsfSyncButton } from "./KsfSyncButton";

export function KsfSyncPanel({ defaultSteam64 }: { userId: string; defaultSteam64?: string }) {

    const [steam64, setSteam64] = React.useState(defaultSteam64 ?? "");
    const [status, setStatus] = React.useState<"Planned" | "On hold" | "Dropped" | "Completed" | "Ongoing">("Completed");
    const [game, setGame] = React.useState<"css" | "csgo" | "cs2">("css");
    const [mode, setMode] = React.useState("0");
    const [dryRun, setDryRun] = React.useState(false);

    return (
        <Paper withBorder p="md" radius="md">
            <Stack gap="sm">
                <Group grow>
                    <TextInput
                        label="Steam64"
                        placeholder="7656119..."
                        value={steam64}
                        onChange={(e) => setSteam64(e.currentTarget.value)}
                    />
                    <Select
                        label="Status to set"
                        value={status}
                        data={["Completed", "Ongoing", "On hold", "Planned", "Dropped"].map(s => ({ value: s, label: s }))}
                        onChange={(v) => setStatus((v as typeof status) ?? "Completed")}
                    />
                </Group>

                <Group grow>
                    <SegmentedControl
                        value={game}
                        onChange={(v) => setGame(v as typeof game)}
                        data={[
                            { value: "css", label: "CS:S" },
                            { value: "csgo", label: "CS:GO" },
                            { value: "cs2", label: "CS2" },
                        ]}
                    />
                    <TextInput label="Mode" value={mode} onChange={(e) => setMode(e.currentTarget.value)} />
                    <Switch
                        label="Dry-run (no write)"
                        checked={dryRun}
                        onChange={(e) => setDryRun(e.currentTarget.checked)}
                    />
                </Group>

                <KsfSyncButton />
            </Stack>
        </Paper>
    );
}
