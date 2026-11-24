import { defineComponent, shallowRef } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";
import { useNativeListener } from "./use-native-listener.ts";

/** Removes the Item's file, moving the focus on (spec/file-upload.md, "Focus"). */
export const FileUploadItemDeleteTrigger: PartComponent<
    Record<never, never>,
    FileUploadItemState
> = publicComponent(
    defineComponent({
        name: "FileUploadItemDeleteTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { root, item, state } = useFileUploadItem(
                "FileUpload.ItemDeleteTrigger",
            );
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            useNativeListener(element, "click", (event, button) =>
                root.remove(item.file(), event, button),
            );
            return () =>
                renderPart("button", { attrs, slots }, props.as, state.value, {
                    type: "button",
                    disabled: state.value.disabled,
                    "data-primitives-part": "file-upload-item-delete-trigger",
                    ...item.attributes.value,
                    ref: setElement,
                });
        },
    }),
);
