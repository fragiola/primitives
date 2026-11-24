import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { FileUploadKey, type FileUploadState } from "./file-upload-context.ts";

/** The list of Items (spec/file-upload.md). */
export const FileUploadItemGroup: PartComponent<
    Record<never, never>,
    FileUploadState
> = publicComponent(
    defineComponent({
        name: "FileUploadItemGroup",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.ItemGroup",
            );
            return () =>
                renderPart(
                    "ul",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        "data-primitives-part": "file-upload-item-group",
                        ...context.attributes.value,
                    },
                );
        },
    }),
);
