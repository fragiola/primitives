import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Edit profile",
    description:
        "A modal dialog with a form: focus moves into it, Tab stays inside, Escape or Close closes it and focus returns to the trigger.",
    category: "overlays",
    order: 1,
    features: [
        "Dialog.Root",
        "Dialog.Trigger",
        "Dialog.Portal",
        "Dialog.Backdrop",
        "Dialog.Popup",
        "Dialog.Title",
        "Dialog.Description",
        "Dialog.Close",
    ],
    docs: "/docs/api/dialog",
    height: 360,
} satisfies ExampleMeta;
