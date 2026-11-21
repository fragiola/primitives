// The example themes, in switcher order (light, dark, ide, paper, terminal: the ecosystem's five,
// guidelines decisions.md#example-themes). Each has a CSS file next to this one; the CSS is the
// source of the values, this list is the switcher's and the site's (site/examples.json).

export const THEMES = [
    {
        name: "light",
        title: "Light",
        description: "Neutral and quiet: the reference look.",
        scheme: "light",
        swatch: [
            "oklch(0.96 0.003 250)",
            "oklch(1 0 0)",
            "oklch(0.55 0.2 300)",
            "oklch(0.15 0.01 250)",
        ],
    },
    {
        name: "dark",
        title: "Dark",
        description: "The same shapes as Light, on dark palettes.",
        scheme: "dark",
        swatch: [
            "oklch(0.13 0.01 250)",
            "oklch(0.19 0.01 250)",
            "oklch(0.7 0.18 300)",
            "oklch(0.95 0.005 250)",
        ],
    },
    {
        name: "ide",
        title: "IDE",
        description:
            "A dense code-editor look: square corners, hairlines, no motion.",
        scheme: "dark",
        swatch: [
            "oklch(0.2 0.006 260)",
            "oklch(0.235 0.006 260)",
            "oklch(0.55 0.16 245)",
            "oklch(0.9 0.005 260)",
        ],
    },
    {
        name: "paper",
        title: "Paper",
        description:
            "Warm and spacious: a serif face, soft round corners, slow motion.",
        scheme: "light",
        swatch: [
            "oklch(0.955 0.014 85)",
            "oklch(0.99 0.006 85)",
            "oklch(0.46 0.09 220)",
            "oklch(0.25 0.03 60)",
        ],
    },
    {
        name: "terminal",
        title: "Terminal",
        description:
            "Phosphor green on black: monospace, square boxes, a solid backdrop.",
        scheme: "dark",
        swatch: [
            "oklch(0.13 0.012 150)",
            "oklch(0.16 0.016 150)",
            "oklch(0.75 0.18 145)",
            "oklch(0.87 0.19 145)",
        ],
    },
] as const;

export type ThemeName = (typeof THEMES)[number]["name"];

export const DEFAULT_THEME: ThemeName = "light";

export function isThemeName(value: unknown): value is ThemeName {
    return THEMES.some((theme) => theme.name === value);
}
