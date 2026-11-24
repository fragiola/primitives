import type { MouseEvent } from "react";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import type { FileUploadItemState } from "./file-upload-context.ts";
import { useFileUploadItem } from "./use-file-upload-item.ts";

export type FileUploadItemDeleteTriggerProps = PartProps<FileUploadItemState>;

/** Removes the Item's file, moving the focus on (spec/file-upload.md, "Focus"). */
export function FileUploadItemDeleteTrigger(
    props: FileUploadItemDeleteTriggerProps,
) {
    const { root, item, state } = useFileUploadItem(
        "FileUpload.ItemDeleteTrigger",
    );
    return renderElement("button", props, state, {
        type: "button",
        disabled: root.disabled,
        "data-primitives-part": "file-upload-item-delete-trigger",
        ...item.attributes,
        onClick: (event: MouseEvent<HTMLElement>) =>
            root.remove(item.file, event.nativeEvent, event.currentTarget),
    });
}
