import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "App command menu",
    description:
        "A command palette in a modal dialog that Ctrl+K (⌘K) toggles: typing filters the commands by their names and keywords, the arrows move the highlight while focus stays in the input, Enter runs one, and a nested page of themes closes with Backspace on the empty input.",
    category: "overlays",
    order: 14,
    features: [
        "Command.Root",
        "Command.Input",
        "Command.List",
        "Command.Group",
        "Command.GroupLabel",
        "Command.Separator",
        "Command.Item",
        "Command.Empty",
        "keywords",
        "pages",
        "Dialog.Popup",
    ],
    docs: "/docs/api/command",
    height: 420,
} satisfies ExampleMeta;
