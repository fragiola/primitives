import { acceptsFile } from "@fragiola/primitives/file";
import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

export interface FileUploadItemPreviewProps {
    /** The files it previews, an `accept` pattern (default `"image/*"`). */
    type?: string;
}

/** A preview, rendered only for a file of its type (spec/file-upload.md). */
export const FileUploadItemPreview: PartComponent<
    FileUploadItemPreviewProps,
    FileUploadItemState
> = publicComponent(
    defineComponent({
        name: "FileUploadItemPreview",
        inheritAttrs: false,
        props: { ...asProp, type: { type: String, default: "image/*" } },
        setup(props, { attrs, slots }) {
            const { item, state } = useFileUploadItem("FileUpload.ItemPreview");
            return () => {
                if (!acceptsFile(item.file(), props.type)) {
                    return null;
                }
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        "data-primitives-part": "file-upload-item-preview",
                        ...item.attributes.value,
                    },
                );
            };
        },
    }),
);
