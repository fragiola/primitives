import { defineComponent, shallowRef, watch } from "vue";
import { useFileDropTarget } from "../../composables/use-file-drop-target.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FileUploadKey, type FileUploadState } from "./file-upload-context.ts";

/**
 * DropZone's drop target inside a FileUpload (spec/file-upload.md): its drops and pastes are the
 * Root's picks, its press opens the HiddenInput's dialog.
 */
export const FileUploadDropzone: PartComponent<
    Record<never, never>,
    FileUploadState
> = publicComponent(
    defineComponent({
        name: "FileUploadDropzone",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                FileUploadKey,
                "FileUpload.Dropzone",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setOwn = elementSetter(element);
            const setElement = (value: unknown) => {
                setOwn(value);
                context.setDropzone(value);
            };
            const disabled = () => context.state.value.disabled;
            const dropTarget = useFileDropTarget(element, {
                disabled,
                onFiles: context.pick,
                onDropTargetChange: (active) => context.setDropTarget(active),
                onActivate: context.openDialog,
            });
            watch(disabled, (next) => {
                if (next) {
                    context.setDropTarget(false);
                }
            });
            return () => {
                const isDisabled = disabled();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    context.state.value,
                    {
                        role: "button",
                        tabindex: isDisabled ? undefined : 0,
                        "aria-disabled": isDisabled ? "true" : undefined,
                        "data-primitives-part": "file-upload-dropzone",
                        ...context.attributes.value,
                        ...stateAttributes({ "drop-target": dropTarget.value }),
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
