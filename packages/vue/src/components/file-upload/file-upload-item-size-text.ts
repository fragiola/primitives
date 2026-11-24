import { formatFileSize } from "@fragiola/primitives/file";
import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

/** The Item's file size in the locale's bytes, unless the app gives content (spec/file-upload.md). */
export const FileUploadItemSizeText: PartComponent<
    Record<never, never>,
    FileUploadItemState
> = publicComponent(
    defineComponent({
        name: "FileUploadItemSizeText",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { root, item, state } = useFileUploadItem(
                "FileUpload.ItemSizeText",
            );
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        "data-primitives-part": "file-upload-item-size-text",
                        ...item.attributes.value,
                    },
                    () =>
                        slots.default?.({ state: state.value }) ??
                        formatFileSize(item.file().size, root.locale()),
                );
        },
    }),
);
