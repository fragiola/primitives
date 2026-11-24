import { FileUpload as Primitive } from "@fragiola/primitives-react/file-upload";
import { fileUpload } from "examples-shared/recipes/file-upload";
import type { ComponentProps } from "react";

export const FileUpload = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={fileUpload.root} {...props} />
    ),
    Label: (props: ComponentProps<typeof Primitive.Label>) => (
        <Primitive.Label className={fileUpload.label} {...props} />
    ),
    Dropzone: (props: ComponentProps<typeof Primitive.Dropzone>) => (
        <Primitive.Dropzone className={fileUpload.dropzone} {...props} />
    ),
    Trigger: (props: ComponentProps<typeof Primitive.Trigger>) => (
        <Primitive.Trigger className={fileUpload.trigger} {...props} />
    ),
    HiddenInput: Primitive.HiddenInput,
    ItemGroup: (props: ComponentProps<typeof Primitive.ItemGroup>) => (
        <Primitive.ItemGroup className={fileUpload["item-group"]} {...props} />
    ),
    Item: (props: ComponentProps<typeof Primitive.Item>) => (
        <Primitive.Item className={fileUpload.item} {...props} />
    ),
    ItemPreview: (props: ComponentProps<typeof Primitive.ItemPreview>) => (
        <Primitive.ItemPreview
            className={fileUpload["item-preview"]}
            {...props}
        />
    ),
    ItemPreviewImage: (
        props: ComponentProps<typeof Primitive.ItemPreviewImage>,
    ) => (
        <Primitive.ItemPreviewImage
            className={fileUpload["item-preview-image"]}
            {...props}
        />
    ),
    ItemName: (props: ComponentProps<typeof Primitive.ItemName>) => (
        <Primitive.ItemName className={fileUpload["item-name"]} {...props} />
    ),
    ItemSizeText: (props: ComponentProps<typeof Primitive.ItemSizeText>) => (
        <Primitive.ItemSizeText
            className={fileUpload["item-size-text"]}
            {...props}
        />
    ),
    ItemDeleteTrigger: (
        props: ComponentProps<typeof Primitive.ItemDeleteTrigger>,
    ) => (
        <Primitive.ItemDeleteTrigger
            className={fileUpload["item-delete-trigger"]}
            {...props}
        />
    ),
    ClearTrigger: (props: ComponentProps<typeof Primitive.ClearTrigger>) => (
        <Primitive.ClearTrigger
            className={fileUpload["clear-trigger"]}
            {...props}
        />
    ),
};
