"use client";
import { Badge } from "@mantine/core";
type Status = "Planned" | "On hold" | "Dropped" | "Completed" | "Ongoing";
export function MapStatusBadge({ status }: { status: Status }) {
  const color =
    status === "Completed" ? "teal" :
    status === "Ongoing"   ? "indigo" :
    status === "On hold"   ? "yellow" :
    status === "Dropped"   ? "red" : "gray";
  return <Badge color={color} variant="light">{status}</Badge>;
}
