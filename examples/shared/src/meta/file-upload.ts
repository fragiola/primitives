import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Attachments field",
    description:
        "A required Field of attachments: files dropped on the zone, pasted on it or picked in the file dialog are checked by type, size and count; the accepted ones list their name and size with a remove button, the rejected ones say why, a polite region announces each pick, and the form submits the files.",
    category: "forms",
    order: 30,
    features: [
        "FileUpload.Root",
        "FileUpload.Dropzone",
        "FileUpload.Trigger",
        "FileUpload.HiddenInput",
        "FileUpload.ItemGroup",
        "FileUpload.Item",
        "FileUpload.ItemName",
        "FileUpload.ItemSizeText",
        "FileUpload.ItemDeleteTrigger",
        "FileUpload.ClearTrigger",
        "maxFiles",
        "maxFileSize",
        "announcement",
        "Field.Root",
        "Field.Error",
    ],
    docs: "/docs/api/file-upload",
    height: 520,
} satisfies ExampleMeta;
