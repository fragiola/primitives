import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Avatar uploader",
    description:
        "One profile photo: an image dropped on the zone or picked in the file dialog replaces the current one, its preview shown through an object URL (revoked when it is replaced or removed), and a button removes it.",
    category: "forms",
    order: 31,
    features: [
        "FileUpload.Root",
        "FileUpload.Label",
        "FileUpload.Dropzone",
        "FileUpload.Trigger",
        "FileUpload.HiddenInput",
        "FileUpload.Item",
        "FileUpload.ItemPreview",
        "FileUpload.ItemPreviewImage",
        "FileUpload.ItemDeleteTrigger",
        "accept",
    ],
    docs: "/docs/api/file-upload",
    height: 320,
} satisfies ExampleMeta;
