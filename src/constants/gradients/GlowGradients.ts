export type GlowGradient = { from: string; to: string };

export const GLOW_GRADIENTS = {
    ocean:      { from: "blue",   to: "cyan" },
    sunset:     { from: "pink",   to: "orange" },
    aurora:     { from: "lime",   to: "teal" },
    magma:      { from: "yellow", to: "red" },
    grape:      { from: "violet", to: "grape" },
    forest:     { from: "lime",   to: "green" },
    twilight:   { from: "purple", to: "indigo" },
    flamingo:   { from: "red",    to: "pink" },
    sky:        { from: "cyan",   to: "blue" },
    gold:       { from: "orange", to: "yellow" },
    mint:       { from: "green",  to: "teal" },
    lavender:   { from: "pink",   to: "violet" },
    steel:      { from: "blue",   to: "gray" },
    peach:      { from: "yellow", to: "orange" },
    cherry:     { from: "pink",   to: "red" },
    ice:        { from: "white",  to: "cyan" },
    sand:       { from: "gray",   to: "yellow" },
    emerald:    { from: "teal",   to: "green" },
    sapphire:   { from: "indigo", to: "blue" },
    rose:       { from: "grape",  to: "pink" },
    bronze:     { from: "brown",  to: "orange" },
    dusk:       { from: "indigo", to: "purple" },
    lemon:      { from: "yellow", to: "lime" },
    frost:      { from: "blue",   to: "white" },
} satisfies Record<string, GlowGradient>;

export type GlowGradientKey = keyof typeof GLOW_GRADIENTS;
