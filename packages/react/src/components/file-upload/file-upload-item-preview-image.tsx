import { useLayoutEffect, useState } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

export type FileUploadItemPreviewImageProps = PartProps<FileUploadItemState>;

/**
 * The Item's file as an image, through an object URL made once mounted and revoked when it
 * unmounts or its file changes (spec/file-upload.md); `alt` is the app's.
 */
export function FileUploadItemPreviewImage(
    props: FileUploadItemPreviewImageProps,
) {
    const { item, state } = useFileUploadItem("FileUpload.ItemPreviewImage");
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [src, setSrc] = useState<string>();
    const { file } = item;
    useLayoutEffect(() => {
        const url = image?.ownerDocument.defaultView?.URL;
        if (url === undefined) {
            return undefined;
        }
        const objectUrl = url.createObjectURL(file);
        setSrc(objectUrl);
        return () => {
            url.revokeObjectURL(objectUrl);
        };
    }, [image, file]);
    return renderElement(
        "img",
        props,
        state,
        {
            src,
            "data-primitives-part": "file-upload-item-preview-image",
            ...item.attributes,
        },
        setImage as (element: HTMLElement | null) => void,
    );
}
