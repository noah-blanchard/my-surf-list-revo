"use client";

import React from "react";
import { Button, type ButtonProps } from "@mantine/core";
import { GLOW_GRADIENTS, type GlowGradient, type GlowGradientKey } from "@/constants/gradients/GlowGradients";

// On fusionne les props Mantine + événements natifs du <button>
export type GlowButtonProps = ButtonProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        /** Clé d'un gradient prédéfini OU gradient custom { from, to } */
        glowGradient?: GlowGradientKey | GlowGradient;
        /** Diamètre du halo en px */
        glowSize?: number;
        /** Opacité du halo [0..1] */
        glowOpacity?: number;
        /** Désactiver complètement l'effet */
        disableGlow?: boolean;
    };

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
    (
        {
            glowGradient = "aurora",
            glowSize = 260,
            glowOpacity = 0.25,
            disableGlow = false,
            children,
            style,
            onMouseMove,
            onMouseEnter,
            onMouseLeave,
            ...buttonProps
        },
        ref
    ) => {
        const [hovered, setHovered] = React.useState(false);
        const [pos, setPos] = React.useState({ x: 0, y: 0 });
        const btnRef = React.useRef<HTMLButtonElement | null>(null);

        // fusionner ref externe + interne
        React.useImperativeHandle(ref, () => btnRef.current as HTMLButtonElement);

        const gradientObj: GlowGradient =
            typeof glowGradient === "string" ? GLOW_GRADIENTS[glowGradient] : glowGradient;

        const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            onMouseMove?.(e);
        };

        const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
            setHovered(true);
            onMouseEnter?.(e);
        };

        const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
            setHovered(false);
            onMouseLeave?.(e);
        };

        const overlayStyle: React.CSSProperties = disableGlow
            ? { display: "none" }
            : {
                position: "absolute",
                inset: -1,
                borderRadius: "inherit",
                pointerEvents: "none",
                background: `radial-gradient(${glowSize}px ${glowSize}px at ${pos.x}px ${pos.y}px, ${gradientObj.from}, ${gradientObj.to} 60%, transparent 70%)`,
                opacity: hovered ? glowOpacity : 0,
                transition: "opacity 120ms ease",
                filter: "blur(12px)",
                mixBlendMode: "screen",
                zIndex: 0,
            };

        return (
            <Button
                ref={btnRef}
                variant="default"
                {...buttonProps}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                style={{ position: "relative", overflow: "hidden", zIndex: 0, ...style }}
            >
                <span aria-hidden style={overlayStyle} />
                <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
            </Button>
        );
    }
);

GlowButton.displayName = "GlowButton";
