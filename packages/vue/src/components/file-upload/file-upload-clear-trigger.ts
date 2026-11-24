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

/** Removes every file; hidden while there is none (spec/file-upload.md). */
export const FileUploadClearTrigger: PartComponent<
    Record<never, never>,
    FileUploadState
> = publicComponent(
    defineComponent({
        name: "FileUploadClearTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.ClearTrigger",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            useNativeListener(element, "click", (event) =>
                context.clear(event),
            );
            return () => {
                const state = context.state.value;
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    disabled: state.disabled,
                    hidden:
                        (state.empty && state.rejectedFiles.length === 0) ||
                        undefined,
                    "data-primitives-part": "file-upload-clear-trigger",
                    ...context.attributes.value,
                    ref: setElement,
                });
            };
        },
    }),
);
