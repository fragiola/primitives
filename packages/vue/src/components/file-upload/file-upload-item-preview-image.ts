import { defineComponent, shallowRef, watch } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

/**
 * The Item's file as an image, through an object URL made once mounted and revoked when it
 * unmounts or its file changes (spec/file-upload.md); `alt` is the app's.
 */
export const FileUploadItemPreviewImage: PartComponent<
    Record<never, never>,
    FileUploadItemState
> = publicComponent(
    defineComponent({
        name: "FileUploadItemPreviewImage",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const { item, state } = useFileUploadItem(
                "FileUpload.ItemPreviewImage",
            );
            const image = shallowRef<HTMLElement | null>(null);
            const setImage = elementSetter(image);
            const src = shallowRef<string>();
            watch(
                [image, item.file],
                ([element, file], _, onCleanup) => {
                    const url = element?.ownerDocument.defaultView?.URL;
                    if (url === undefined) {
                        return;
                    }
                    const objectUrl = url.createObjectURL(file);
                    src.value = objectUrl;
                    onCleanup(() => url.revokeObjectURL(objectUrl));
                },
                { flush: "post" },
            );
            return () =>
                renderPart(
                    "img",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        src: src.value,
                        "data-primitives-part":
                            "file-upload-item-preview-image",
                        ...item.attributes.value,
                        ref: setImage,
                    },
                    () => [],
                );
        },
    }),
);
