import { announceText } from "@fragiola/primitives/clipboard";
import {
    acceptFiles,
    type FileAccept,
    openFileDialog,
} from "@fragiola/primitives/file";
import { defineComponent, h, type PropType, shallowRef } from "vue";
import { useFileDropTarget } from "../../composables/use-file-drop-target.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { LIVE_REGION_STYLE } from "../../utils/live-region-style.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";

/** The state the Root renders with. */
export interface DropZoneState {
    dropTarget: boolean;
    disabled: boolean;
}

/** What `fileDrop` and `announcement` receive (spec/drop-zone.md, "API"). */
export interface DropZoneDropDetails extends ChangeDetails {
    acceptedFiles: File[];
    rejectedFiles: File[];
    reason: Extract<ChangeReason, "drop" | "input-paste" | "input-change">;
}

export interface DropZoneRootProps {
    /** The file types it takes, as a file input's `accept`. */
    accept?: FileAccept;
    /** The dialog picks several files; when `false`, a drop of several rejects them all. */
    multiple?: boolean;
    disabled?: boolean;
    /** The text announced (politely) after each drop, paste or pick. */
    announcement?: (details: DropZoneDropDetails) => string;
}

export type DropZoneRootEmits = {
    fileDrop: (details: DropZoneDropDetails) => true;
    dropTargetChange: (active: boolean, details: ChangeDetails) => true;
};

/**
 * A drop target for files, an APG button that opens the file dialog and takes a paste, announcing
 * the app's text in a polite live region it renders as its last child (spec/drop-zone.md).
 */
export const DropZoneRoot: PartComponent<
    DropZoneRootProps,
    DropZoneState,
    DropZoneRootEmits
> = publicComponent(
    defineComponent({
        name: "DropZoneRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            accept: {
                type: [String, Array] as PropType<FileAccept>,
                default: undefined,
            },
            multiple: { type: Boolean, default: true },
            disabled: { type: Boolean, default: false },
            announcement: {
                type: Function as PropType<
                    (details: DropZoneDropDetails) => string
                >,
                default: undefined,
            },
        },
        emits: {
            fileDrop: (_details: DropZoneDropDetails) => true,
            dropTargetChange: (_active: boolean, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const announcer = shallowRef<HTMLElement | null>(null);
            const setAnnouncer = elementSetter(announcer);
            const take = (
                files: File[],
                reason: DropZoneDropDetails["reason"],
                event: Event,
            ) => {
                const { accepted, rejected } = acceptFiles(
                    files,
                    props.accept,
                    props.multiple,
                );
                const details: DropZoneDropDetails = {
                    acceptedFiles: accepted,
                    rejectedFiles: rejected,
                    reason,
                    event,
                };
                emit("fileDrop", details);
                if (props.announcement !== undefined && announcer.value) {
                    announceText(announcer.value, props.announcement(details));
                }
            };
            const dropTarget = useFileDropTarget(element, {
                disabled: () => props.disabled,
                onFiles: (files, reason, event) =>
                    take(
                        files,
                        reason === "drop" ? "drop" : "input-paste",
                        event,
                    ),
                onDropTargetChange: (active, event) =>
                    emit("dropTargetChange", active, { reason: "drop", event }),
                onActivate: () => {
                    if (element.value === null) {
                        return;
                    }
                    openFileDialog(
                        element.value,
                        { accept: props.accept, multiple: props.multiple },
                        (files, event) => take(files, "input-change", event),
                    );
                },
            });
            return () => {
                const state: DropZoneState = {
                    dropTarget: dropTarget.value,
                    disabled: props.disabled,
                };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        role: "button",
                        tabindex: props.disabled ? undefined : 0,
                        "aria-disabled": props.disabled ? "true" : undefined,
                        "data-primitives-part": "drop-zone-root",
                        ...stateAttributes({
                            "drop-target": state.dropTarget,
                            disabled: state.disabled,
                        }),
                        ref: setElement,
                    },
                    () => [
                        ...(slots.default?.({ state }) ?? []),
                        // the toolkit writes its text: it renders no children
                        h("span", {
                            ref: setAnnouncer,
                            "aria-live": "polite",
                            "aria-atomic": "true",
                            "data-primitives-part": "drop-zone-announcer",
                            style: LIVE_REGION_STYLE,
                        }),
                    ],
                );
            };
        },
    }),
);
