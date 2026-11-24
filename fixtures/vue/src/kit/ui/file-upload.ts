import { FileUpload as Primitive } from "@fragiola/primitives-vue/file-upload";
import { fileUpload } from "examples-shared/recipes/file-upload";
import { styled } from "../styled.ts";

export const FileUpload = {
    Root: styled(Primitive.Root, fileUpload.root),
    Label: styled(Primitive.Label, fileUpload.label),
    Dropzone: styled(Primitive.Dropzone, fileUpload.dropzone),
    Trigger: styled(Primitive.Trigger, fileUpload.trigger),
    HiddenInput: Primitive.HiddenInput,
    ItemGroup: styled(Primitive.ItemGroup, fileUpload["item-group"]),
    Item: styled(Primitive.Item, fileUpload.item),
    ItemPreview: styled(Primitive.ItemPreview, fileUpload["item-preview"]),
    ItemPreviewImage: styled(
        Primitive.ItemPreviewImage,
        fileUpload["item-preview-image"],
    ),
    ItemName: styled(Primitive.ItemName, fileUpload["item-name"]),
    ItemSizeText: styled(Primitive.ItemSizeText, fileUpload["item-size-text"]),
    ItemDeleteTrigger: styled(
        Primitive.ItemDeleteTrigger,
        fileUpload["item-delete-trigger"],
    ),
    ClearTrigger: styled(Primitive.ClearTrigger, fileUpload["clear-trigger"]),
};
