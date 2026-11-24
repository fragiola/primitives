import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

/** The Item's file name, unless the app gives content (spec/file-upload.md). */
export const FileUploadItemName: PartComponent<
    Record<never, never>,
    FileUploadItemState
> = publicComponent(
    defineComponent({
        name: "FileUploadItemName",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { item, state } = useFileUploadItem("FileUpload.ItemName");
            return () =>
                renderPart(
                    "span",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        "data-primitives-part": "file-upload-item-name",
                        ...item.attributes.value,
                    },
                    () =>
                        slots.default?.({ state: state.value }) ??
                        item.file().name,
                );
        },
    }),
);
