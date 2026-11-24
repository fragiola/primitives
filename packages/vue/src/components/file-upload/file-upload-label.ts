import { defineComponent, onBeforeUnmount, onMounted } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { FileUploadKey, type FileUploadState } from "./file-upload-context.ts";

/** The label of the HiddenInput (a press opens the dialog), naming the Root (spec/file-upload.md). */
export const FileUploadLabel: PartComponent<
    Record<never, never>,
    FileUploadState
> = publicComponent(
    defineComponent({
        name: "FileUploadLabel",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.Label",
            );
            onMounted(() => context.setLabelled(true));
            onBeforeUnmount(() => context.setLabelled(false));
            return () =>
                renderPart(
                    "label",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        id: context.labelId,
                        for: context.inputId(),
                        "data-primitives-part": "file-upload-label",
                        ...context.attributes.value,
                    },
                );
        },
    }),
);
