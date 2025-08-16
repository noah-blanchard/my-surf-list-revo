// Gradients réutilisables pour GlowButton (couleurs Mantine ou hex)
export type GlowGradient = { from: string; to: string };

export const GLOW_GRADIENTS = {
    ocean:      { from: "cyan",   to: "blue" },
    sunset:     { from: "orange", to: "pink" },
    aurora:     { from: "teal",   to: "lime" },
    magma:      { from: "red",    to: "yellow" },
    grape:      { from: "grape",  to: "violet" },
    forest:     { from: "green",  to: "lime" },
    twilight:   { from: "indigo", to: "purple" },
    flamingo:   { from: "pink",   to: "red" },
    sky:        { from: "blue",   to: "cyan" },
    gold:       { from: "yellow", to: "orange" },
    mint:       { from: "teal",   to: "green" },
    lavender:   { from: "violet", to: "pink" },
    steel:      { from: "gray",   to: "blue" },
    peach:      { from: "orange", to: "yellow" },
    cherry:     { from: "red",    to: "pink" },
    ice:        { from: "cyan",   to: "white" },
    sand:       { from: "yellow", to: "gray" },
    emerald:    { from: "green",  to: "teal" },
    sapphire:   { from: "blue",   to: "indigo" },
    rose:       { from: "pink",   to: "grape" },
    bronze:     { from: "orange", to: "brown" },
    dusk:       { from: "purple", to: "indigo" },
    lemon:      { from: "lime",   to: "yellow" },
    frost:      { from: "white",  to: "blue" },
} satisfies Record<string, GlowGradient>;

export type GlowGradientKey = keyof typeof GLOW_GRADIENTS;
