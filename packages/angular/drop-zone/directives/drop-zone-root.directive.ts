import {
    booleanAttribute,
    computed,
    Directive,
    input,
    output,
    untracked,
} from "@angular/core";
import { announceText } from "@fragiola/primitives/clipboard";
import {
    acceptFiles,
    type FileAccept,
    openFileDialog,
    watchFileDrop,
} from "@fragiola/primitives/file";
import {
    type ChangeDetails,
    type ChangeReason,
    createLiveRegion,
    dataValues,
    fileDropTarget,
    injectHost,
} from "@fragiola/primitives-angular/internal";

/** The state the Root renders with. */
export interface DropZoneState {
    dropTarget: boolean;
    disabled: boolean;
}

/** What `(fileDrop)` and `announcement` receive (spec/drop-zone.md, "API"). */
export interface DropZoneDropDetails extends ChangeDetails {
    acceptedFiles: File[];
    rejectedFiles: File[];
    reason: Extract<ChangeReason, "drop" | "input-paste" | "input-change">;
}

/** What `(dropTargetChange)` emits. */
export interface DropZoneDropTargetChangeEvent {
    value: boolean;
    details: ChangeDetails;
}

/**
 * A drop target for files, an APG button that opens the file dialog and takes a paste
 * (spec/drop-zone.md): `<div dropZoneRoot accept="image/*" [announcement]="say" (fileDrop)="...">`.
 * Its polite live region is appended as its last child once the page renders in the browser.
 */
@Directive({
    selector: "[dropZoneRoot]",
    exportAs: "dropZoneRoot",
    host: {
        role: "button",
        "data-primitives-part": "drop-zone-root",
        "[attr.tabindex]": "disabled() ? null : 0",
        "[attr.aria-disabled]": 'disabled() ? "true" : null',
        "[attr.data-drop-target]": "data().dropTarget",
        "[attr.data-disabled]": "data().disabled",
    },
})
export class DropZoneRoot {
    /** The file types it takes, as a file input's `accept`. */
    readonly accept = input<FileAccept | undefined>(undefined);
    /** The dialog picks several files; when `false`, a drop of several rejects them all. */
    readonly multiple = input(true, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    /** The text announced (politely) after each drop, paste or pick. */
    readonly announcement = input<
        ((details: DropZoneDropDetails) => string) | undefined
    >(undefined);
    readonly fileDrop = output<DropZoneDropDetails>();
    readonly dropTargetChange = output<DropZoneDropTargetChangeEvent>();

    private readonly host = injectHost();
    private readonly announcer = createLiveRegion(
        this.host,
        "drop-zone-announcer",
    );
    private readonly dropTarget = fileDropTarget(this.host, {
        watch: watchFileDrop,
        disabled: this.disabled,
        onFiles: (files, reason, event) =>
            this.take(files, reason === "drop" ? "drop" : "input-paste", event),
        onDropTargetChange: (value, event) =>
            this.dropTargetChange.emit({
                value,
                details: { reason: "drop", event },
            }),
        onActivate: () =>
            openFileDialog(
                this.host,
                {
                    accept: untracked(this.accept),
                    multiple: untracked(this.multiple),
                },
                (files, event) => this.take(files, "input-change", event),
            ),
    });
    readonly state = computed<DropZoneState>(() => ({
        dropTarget: this.dropTarget(),
        disabled: this.disabled(),
    }));
    protected readonly data = computed(() => dataValues(this.state()));

    private take(
        files: File[],
        reason: DropZoneDropDetails["reason"],
        event: Event,
    ): void {
        const { accepted, rejected } = acceptFiles(
            files,
            untracked(this.accept),
            untracked(this.multiple),
        );
        const details: DropZoneDropDetails = {
            acceptedFiles: accepted,
            rejectedFiles: rejected,
            reason,
            event,
        };
        this.fileDrop.emit(details);
        const announcement = untracked(this.announcement);
        if (announcement !== undefined) {
            announceText(this.announcer, announcement(details));
        }
    }
}
