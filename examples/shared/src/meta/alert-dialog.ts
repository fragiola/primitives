import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Discard draft",
    description:
        "An alert dialog before a destructive action: focus starts on the least destructive answer, a press outside does nothing, Escape or Keep editing closes it, and Discard clears the draft.",
    category: "overlays",
    order: 5,
    features: [
        "AlertDialog.Root",
        "AlertDialog.Trigger",
        "AlertDialog.Portal",
        "AlertDialog.Backdrop",
        "AlertDialog.Popup",
        "AlertDialog.Title",
        "AlertDialog.Description",
        "AlertDialog.Close",
        "open",
    ],
    docs: "/docs/api/alert-dialog",
    height: 360,
} satisfies ExampleMeta;
