import { announceText } from "@fragiola/primitives/clipboard";
import {
    acceptFiles,
    type FileAccept,
    openFileDialog,
} from "@fragiola/primitives/file";
import { useCallback, useRef } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useFileDropTarget } from "../../hooks/use-file-drop-target.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { LIVE_REGION_STYLE } from "../../utils/live-region-style.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";

/** The state the Root renders with. */
export interface DropZoneState {
    dropTarget: boolean;
    disabled: boolean;
}

/** What `onFileDrop` and `announcement` receive (spec/drop-zone.md, "API"). */
export interface DropZoneDropDetails extends ChangeDetails {
    acceptedFiles: File[];
    rejectedFiles: File[];
    reason: Extract<ChangeReason, "drop" | "input-paste" | "input-change">;
}

export interface DropZoneRootProps extends PartProps<DropZoneState> {
    /** The file types it takes, as a file input's `accept`. */
    accept?: FileAccept;
    /** The dialog picks several files; when `false`, a drop of several rejects them all. */
    multiple?: boolean;
    disabled?: boolean;
    onFileDrop?: (details: DropZoneDropDetails) => void;
    onDropTargetChange?: (active: boolean, details: ChangeDetails) => void;
    /** The text announced (politely) after each drop, paste or pick. */
    announcement?: (details: DropZoneDropDetails) => string;
}

/**
 * A drop target for files, an APG button that opens the file dialog and takes a paste, announcing
 * the app's text in a polite live region it renders as its last child (spec/drop-zone.md).
 */
export function DropZoneRoot({
    accept,
    multiple = true,
    disabled = false,
    onFileDrop,
    onDropTargetChange,
    announcement,
    children,
    ...props
}: DropZoneRootProps) {
    const [element, setElement] = useElement<HTMLElement>();
    const announcer = useRef<HTMLSpanElement | null>(null);
    const latest = useRef({ accept, multiple, onFileDrop, announcement });
    latest.current = { accept, multiple, onFileDrop, announcement };

    const take = useCallback(
        (
            files: File[],
            reason: DropZoneDropDetails["reason"],
            event: Event,
        ) => {
            const current = latest.current;
            const { accepted, rejected } = acceptFiles(
                files,
                current.accept,
                current.multiple,
            );
            const details: DropZoneDropDetails = {
                acceptedFiles: accepted,
                rejectedFiles: rejected,
                reason,
                event,
            };
            current.onFileDrop?.(details);
            if (current.announcement !== undefined && announcer.current) {
                announceText(announcer.current, current.announcement(details));
            }
        },
        [],
    );
    const dropTarget = useFileDropTarget(element, {
        disabled,
        onFiles: (files, reason, event) =>
            take(files, reason === "drop" ? "drop" : "input-paste", event),
        onDropTargetChange: (active, event) =>
            onDropTargetChange?.(active, { reason: "drop", event }),
        onActivate: () => {
            if (element === null) {
                return;
            }
            const current = latest.current;
            openFileDialog(
                element,
                { accept: current.accept, multiple: current.multiple },
                (files, event) => take(files, "input-change", event),
            );
        },
    });

    const state: DropZoneState = { dropTarget, disabled };
    return renderElement(
        "div",
        {
            ...props,
            children: (
                <>
                    {children}
                    <span
                        ref={announcer}
                        aria-live="polite"
                        aria-atomic="true"
                        data-primitives-part="drop-zone-announcer"
                        style={LIVE_REGION_STYLE}
                    />
                </>
            ),
        },
        state,
        {
            role: "button",
            tabIndex: disabled ? undefined : 0,
            "aria-disabled": disabled ? "true" : undefined,
            "data-primitives-part": "drop-zone-root",
            ...stateAttributes({ "drop-target": dropTarget, disabled }),
        },
        setElement,
    );
}
