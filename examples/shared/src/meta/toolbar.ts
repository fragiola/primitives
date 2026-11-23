import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Text-format toolbar",
    description:
        "A text editor's toolbar: Bold, Italic and Underline (several pressed) and the alignment (one pressed) are ToggleGroups inside one tab stop, with separators, a Clear button and a font size field that keeps its caret keys.",
    category: "forms",
    order: 17,
    features: [
        "Toolbar.Root",
        "Toolbar.Separator",
        "Toolbar.Button",
        "Toolbar.Input",
        "ToggleGroup",
        "Toggle",
        "multiple",
        "roving focus",
    ],
    docs: "/docs/api/toolbar",
    height: 280,
} satisfies ExampleMeta;
