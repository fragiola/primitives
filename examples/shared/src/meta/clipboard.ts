import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Copy code block",
    description:
        'An install command in a code block with a copy button: a press writes it to the clipboard, the icon turns into a check for two seconds, and a screen reader hears the app\'s "Copied".',
    category: "display",
    order: 7,
    features: [
        "Clipboard.Root",
        "Clipboard.Trigger",
        "Clipboard.Indicator",
        "timeout",
        "announcement",
        "data-copied",
    ],
    docs: "/docs/api/clipboard",
    height: 220,
} satisfies ExampleMeta;
