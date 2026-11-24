import { defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { FileUploadKey, type FileUploadState } from "./file-upload-context.ts";
import { useNativeListener } from "./use-native-listener.ts";

/** The button that opens the file dialog (spec/file-upload.md). */
export const FileUploadTrigger: PartComponent<
    Record<never, never>,
    FileUploadState
> = publicComponent(
    defineComponent({
        name: "FileUploadTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.Trigger",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setOwn = elementSetter(element);
            const setElement = (value: unknown) => {
                setOwn(value);
                context.setTrigger(value);
            };
            useNativeListener(element, "click", () => context.openDialog());
            return () =>
                renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        type: "button",
                        disabled: context.state.value.disabled,
                        "data-primitives-part": "file-upload-trigger",
                        ...context.attributes.value,
                        ref: setElement,
                    },
                );
        },
    }),
);
