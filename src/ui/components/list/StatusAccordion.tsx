"use client";
import { Accordion, Paper, Text } from "@mantine/core";
import { MapListRow } from "./MapListRow";
import type { MapItem } from "@/features/user-maps/validators";

export function StatusAccordion({
    sections,
    defaultValue,
    highlight,
}: {
    sections: { key: string; title: string; items: MapItem[]; emptyHint?: string }[];
    defaultValue?: string[]; // clé(s) ouvertes par défaut
    highlight: string;
}) {
    return (
        <Paper withBorder radius="md" p="sm">
            <Accordion multiple defaultValue={defaultValue} variant="separated">
                {sections.map((s) => (
                    <Accordion.Item key={s.key} value={s.key}>
                        <Accordion.Control>
                            {s.title}
                        </Accordion.Control>
                        <Accordion.Panel>
                            {s.items.length ? (
                                s.items.map((m) => (
                                    <MapListRow
                                        key={m.id}
                                        name={m.name}
                                        tier={m.tier}
                                        isLinear={m.is_linear}
                                        highlight={highlight}
                                    />
                                ))
                            ) : (
                                <Text size="sm" c="dimmed">
                                    {s.emptyHint ?? "No items"}
                                </Text>
                            )}
                        </Accordion.Panel>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Paper>
    );
}
