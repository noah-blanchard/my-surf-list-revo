"use client";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";

export function useKsfSync() {
    const [running, setRunning] = React.useState(false);
    const [pct, setPct] = React.useState(0);
    const [label, setLabel] = React.useState<string>("Idle");
    const esRef = React.useRef<EventSource | null>(null);

    const qc = useQueryClient();



    const start = React.useCallback(() => {
        if (running) return;
        setRunning(true);
        setPct(0);
        setLabel("Starting…");

        const es = new EventSource(`/api/ksf/sync`); // 👈 aucun paramètre
        esRef.current = es;

        es.addEventListener("progress", async (evt) => {
            try {
                const data = JSON.parse((evt as MessageEvent).data) as { phase: string; pct: number; message?: string };
                setPct(Math.max(0, Math.min(100, data.pct)));
                setLabel(data.message ?? data.phase);
                if (data.phase === "done" || data.phase === "error") {

                    qc.invalidateQueries({ queryKey: ["userStats"], exact: false });
                    setRunning(false);
                    es.close();
                }
            } catch { }
        });

        es.onerror = () => {
            setRunning(false);
            setLabel("connection lost");
            es.close();
        };
    }, [running]);

    const cancel = React.useCallback(() => {
        esRef.current?.close();
        esRef.current = null;
        setRunning(false);
        setLabel("Cancelled");
    }, []);

    return { running, pct, label, start, cancel };
}
