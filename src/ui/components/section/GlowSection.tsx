"use client";

import React from "react";
import { Paper, Stack, Title, type PaperProps } from "@mantine/core";
import { GLOW_GRADIENTS, type GlowGradient, type GlowGradientKey } from "@/constants/gradients/GlowGradients";

export type GlowSectionProps = PaperProps & {
  title?: string;
  children: React.ReactNode;
  glowGradient?: GlowGradientKey | GlowGradient;
  glowSize?: number;
  glowOpacity?: number;
  disableGlow?: boolean;
  popOut?: boolean; // If true, the section will slightly scale up on hover
};

export function GlowSection({
  title,
  children,
  glowGradient = "twilight",
  glowSize = 1200,
  glowOpacity = 0.10,
  disableGlow = false,
  popOut = true, 
  style,
  ...paperProps
}: GlowSectionProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const gradientObj: GlowGradient =
    typeof glowGradient === "string" ? GLOW_GRADIENTS[glowGradient] : glowGradient;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleEnter = () => {
    setHovered(true);
  };

  const handleLeave = () => {
    setHovered(false);
  };

  const overlayStyle: React.CSSProperties = disableGlow
    ? { display: "none" }
    : {
      position: "absolute",
      inset: -1,
      borderRadius: "inherit",
      pointerEvents: "none",
      background: `radial-gradient(${glowSize}px ${glowSize}px at ${pos.x}px ${pos.y}px, ${gradientObj.from}, ${gradientObj.to} 40%, transparent 80%)`,
      opacity: hovered ? glowOpacity : 0,
      transition: "opacity 120ms ease",
      filter: "blur(24px)", // plus grand = plus diffus
      mixBlendMode: "screen",
      zIndex: 0,
    };

  return (
    <Paper
      p="md"
      radius="md"
      withBorder
      {...paperProps}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ position: "relative", overflow: "hidden", zIndex: 0, ...style, transform: popOut && hovered ? "scale(1.01)" : "scale(1)", transition: "transform 150ms ease" }}
    >
      <span aria-hidden style={overlayStyle} />
      <Stack gap="xs" style={{ position: "relative", zIndex: 1 }}>
        {title && <Title order={5}>{title}</Title>}
        {children}
      </Stack>
    </Paper>
  );
}
