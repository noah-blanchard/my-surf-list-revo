export function epochToMinSecMS(
    seconds: number | null | undefined,
    opts: { allowHours?: boolean } = { allowHours: true }
): string {
    if (seconds == null || !Number.isFinite(seconds)) return "--:--.---";

    const sign = seconds < 0 ? "-" : "";
    const totalMs = Math.round(Math.abs(seconds) * 1000);

    const ms = totalMs % 1000;
    const totalSec = Math.floor(totalMs / 1000);
    const s = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);

    if (opts.allowHours && totalMin >= 60) {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${sign}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
    }

    const m = totalMin;
    return `${sign}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}
