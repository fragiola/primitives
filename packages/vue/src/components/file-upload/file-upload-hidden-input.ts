import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";
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

/**
 * The native file input: the form's control, its files the value (spec/file-upload.md, "Forms").
 * Hidden from the tab order and the accessibility tree; the Trigger and the Dropzone open it.
 */
export const FileUploadHiddenInput: PartComponent<
    Record<never, never>,
    FileUploadState
> = publicComponent(
    defineComponent({
        name: "FileUploadHiddenInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.HiddenInput",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setOwn = elementSetter(element);
            const setElement = (value: unknown) => {
                setOwn(value);
                context.setInput(value);
            };
            useNativeListener(element, "change", (event, input) => {
                const files = [...((input as HTMLInputElement).files ?? [])];
                if (files.length > 0) {
                    context.pick(files, "input-change", event);
                }
            });
            return () => {
                const state = context.state.value;
                return renderPart(
                    "input",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        type: "file",
                        id: context.inputId(),
                        name: context.name(),
                        accept: context.accept(),
                        multiple: context.multiple(),
                        capture: context.capture(),
                        required: context.required(),
                        disabled: state.disabled,
                        tabindex: -1,
                        "aria-hidden": "true",
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "file-upload-hidden-input",
                        ref: setElement,
                    },
                    () => [],
                );
            };
        },
    }),
);
