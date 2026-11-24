import {
    afterRenderEffect,
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
    signal,
    untracked,
} from "@angular/core";
import { announceText } from "@fragiola/primitives/clipboard";
import {
    acceptAttribute,
    assignFiles,
    checkFiles,
    type FileAccept,
    type FileRejection,
    fieldFiles,
} from "@fragiola/primitives/file";
import { bridgeForm } from "@fragiola/primitives/form";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    type ChangeReason,
    controllable,
    createLiveRegion,
    dataValue,
    injectHost,
    injectId,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** The state every part renders with (spec/file-upload.md, "API"). */
export interface FileUploadState {
    /** The accepted files. */
    value: File[];
    /** The last pick's rejected files, with their reasons. */
    rejectedFiles: FileRejection<File>[];
    disabled: boolean;
    /** No accepted file. */
    empty: boolean;
    /** A drag of files is over the Dropzone. */
    dropTarget: boolean;
}

/** What `announcement` receives after a pick. */
export interface FileUploadPickDetails extends ChangeDetails {
    /** The accepted files after the pick. */
    value: File[];
    /** The pick's accepted files. */
    acceptedFiles: File[];
    rejectedFiles: FileRejection<File>[];
}

const NO_FILES: File[] = [];
const DELETE_TRIGGER =
    '[data-primitives-part="file-upload-item-delete-trigger"]';
const ITEM_GROUP = '[data-primitives-part="file-upload-item-group"]';

/**
 * A form control holding a list of files (spec/file-upload.md): `<div fileUploadRoot
 * #upload="fileUploadRoot" [maxFiles]="3" accept="image/*">` around its parts, the Items rendered
 * from `upload.state().value` (and `rejectedFiles`). The checks of each pick, the hidden file
 * input its files are assigned to, the Field binding, and a polite live region appended as its last
 * child once the page renders in the browser.
 */
@Directive({
    selector: "[fileUploadRoot]",
    exportAs: "fileUploadRoot",
    host: {
        role: "group",
        "data-primitives-part": "file-upload-root",
        "[attr.aria-labelledby]": "labelledBy()",
        "[attr.aria-describedby]": "field.describedBy()",
        "[attr.aria-invalid]": "field.ariaInvalid()",
        "[attr.data-invalid]": "data().invalid",
        "[attr.data-valid]": "data().valid",
        "[attr.data-dirty]": "data().dirty",
        "[attr.data-touched]": "data().touched",
        "[attr.data-filled]": "data().filled",
        "[attr.data-focused]": "data().focused",
        "[attr.data-disabled]": "data().disabled",
        "[attr.data-empty]": "data().empty",
        "[attr.data-drop-target]": "data().dropTarget",
        "(focusin)": "field.focused()",
        "(focusout)": "onFocusOut($event)",
    },
})
export class FileUploadRoot {
    /** The accepted files (controlled, `[(value)]`). */
    readonly value = input<File[] | undefined>(undefined);
    readonly valueChange = output<File[]>();
    readonly defaultValue = input<File[] | undefined>(undefined);
    readonly valueChangeDetails = output<ValueChangeEvent<File[]>>();
    /** A pick had rejected files. */
    readonly fileReject = output<ValueChangeEvent<FileRejection<File>[]>>();
    readonly accept = input<FileAccept | undefined>(undefined);
    /** At most this many files (default `1`: a new pick replaces the file). */
    readonly maxFiles = input(1, { transform: numberAttribute });
    readonly minFileSize = input<number | undefined>(undefined);
    readonly maxFileSize = input<number | undefined>(undefined);
    readonly validate = input<
        | ((
              file: File,
              value: readonly File[],
          ) => readonly string[] | null | undefined)
        | undefined
    >(undefined);
    readonly name = input<string | undefined>(undefined);
    readonly required = input(false, { transform: booleanAttribute });
    readonly disabled = input(false, { transform: booleanAttribute });
    readonly capture = input<"user" | "environment" | undefined>(undefined);
    /** The HiddenInput's id. */
    readonly id = input<string | undefined>(undefined);
    /** ItemSizeText's locale (default: the runtime's). */
    readonly locale = input<string | undefined>(undefined);
    /** The text announced (politely) after each pick. */
    readonly announcement = input<
        ((details: FileUploadPickDetails) => string) | undefined
    >(undefined);

    private readonly host = injectHost();
    private readonly announcer = createLiveRegion(
        this.host,
        "file-upload-announcer",
    );
    private readonly files = controllable<File[], ChangeDetails>(
        this.value,
        this.valueChange,
        () => this.defaultValue() ?? NO_FILES,
        (value, details) => this.valueChangeDetails.emit({ value, details }),
    );
    private readonly rejected = signal<FileRejection<File>[]>([]);
    private readonly over = signal(false);
    private readonly labels = signal(0);
    // a pick re-assigns the input's files even when the value did not change (the dialog wrote
    // the picked files into it)
    private readonly syncs = signal(0);
    private readonly generatedId = injectId("primitives-file-upload");
    /** The HiddenInput's id, which the Label is `for`. */
    readonly inputId = computed(() => this.id() ?? `${this.generatedId}-input`);
    readonly labelId = `${this.generatedId}-label`;
    /** The parts' elements, registered by their directives. */
    readonly input = signal<HTMLInputElement | null>(null);
    readonly trigger = signal<HTMLElement | null>(null);
    readonly dropzone = signal<HTMLElement | null>(null);

    readonly field = fieldControl({
        id: this.inputId,
        labelable: true,
        value: computed(() => fieldFiles(this.files.value())),
        filled: computed(() => this.files.value().length > 0),
        input: () => untracked(this.input),
        focusTarget: () => untracked(this.trigger) ?? untracked(this.dropzone),
    });
    readonly isDisabled = computed(
        () => this.disabled() || this.field.disabled(),
    );
    /** The HiddenInput's name: its Field's, which wins, or its own. */
    readonly formName = computed(() => this.field.name() ?? this.name());
    readonly acceptText = computed(() => acceptAttribute(this.accept()));
    readonly multiple = computed(() => this.maxFiles() > 1);
    readonly state = computed<FileUploadState>(() => {
        const value = this.files.value();
        return {
            value,
            rejectedFiles: this.rejected(),
            disabled: this.isDisabled(),
            empty: value.length === 0,
            dropTarget: this.over() && !this.isDisabled(),
        };
    });
    /** The Field's state attributes and the Root's own, for every part. */
    readonly data = computed(() => {
        const state = this.state();
        return {
            ...this.field.data(),
            disabled: dataValue(state.disabled),
            empty: dataValue(state.empty),
            dropTarget: dataValue(state.dropTarget),
        };
    });
    protected readonly labelledBy = computed(() =>
        this.field.inField
            ? this.field.labelledBy()
            : this.labels() > 0
              ? this.labelId
              : null,
    );

    constructor() {
        afterRenderEffect({
            write: () => {
                const element = this.input();
                const value = this.files.value();
                this.syncs();
                if (element !== null) {
                    assignFiles(element, value);
                }
            },
        });
    }

    /** A Label rendered (`true`) or gone: the Root is labelled by it. */
    setLabelled(labelled: boolean): void {
        this.labels.update((count) => count + (labelled ? 1 : -1));
    }

    setDropTarget(active: boolean): void {
        this.over.set(active);
    }

    /** Bridges the HiddenInput and its form (reset, failed validation); returns the cleanup. */
    connectInput(element: HTMLInputElement): () => void {
        return bridgeForm(element, {
            reset: () => {
                this.field.reset();
                this.rejected.set([]);
                this.syncs.update((count) => count + 1);
                this.files.set(untracked(this.defaultValue) ?? NO_FILES, {
                    reason: "none",
                });
            },
            invalid: () => untracked(this.trigger) ?? untracked(this.dropzone),
        });
    }

    /** New files from the dialog, a drop or a paste. */
    pick(files: File[], reason: ChangeReason, event: Event): void {
        if (untracked(this.isDisabled)) {
            return;
        }
        const current = untracked(this.files.value);
        const result = checkFiles(current, files, {
            accept: untracked(this.accept),
            maxFiles: untracked(this.maxFiles),
            minFileSize: untracked(this.minFileSize),
            maxFileSize: untracked(this.maxFileSize),
            validate: untracked(this.validate),
        });
        this.syncs.update((count) => count + 1);
        this.rejected.set(result.rejected);
        const details = { reason, event };
        if (result.accepted.length > 0) {
            this.files.set(result.value, details);
        }
        if (result.rejected.length > 0) {
            this.fileReject.emit({ value: result.rejected, details });
        }
        const announcement = untracked(this.announcement);
        if (announcement !== undefined) {
            announceText(
                this.announcer,
                announcement({
                    value: result.value,
                    acceptedFiles: result.accepted,
                    rejectedFiles: result.rejected,
                    reason,
                    event,
                }),
            );
        }
    }

    openDialog(): void {
        if (!untracked(this.isDisabled)) {
            untracked(this.input)?.click();
        }
    }

    private focusControl(): void {
        (untracked(this.trigger) ?? untracked(this.dropzone))?.focus();
    }

    /**
     * Removes a file from the value or the rejected list; the focus moves to the next delete
     * button of its ItemGroup, else the previous one, else the Trigger (spec/file-upload.md, "Focus").
     */
    remove(file: File, event: Event, button: HTMLElement): void {
        const scope = button.closest(ITEM_GROUP) ?? this.host;
        const buttons = [
            ...scope.querySelectorAll<HTMLElement>(DELETE_TRIGGER),
        ];
        const index = buttons.indexOf(button);
        const next =
            index === -1
                ? undefined
                : (buttons[index + 1] ?? buttons[index - 1]);
        if (next !== undefined) {
            next.focus();
        } else {
            this.focusControl();
        }
        const value = untracked(this.files.value);
        if (value.includes(file)) {
            this.files.set(
                value.filter((entry) => entry !== file),
                { reason: "delete-press", event },
            );
        } else {
            this.rejected.update((rejected) =>
                rejected.filter((entry) => entry.file !== file),
            );
        }
    }

    /** Empties the value and the rejected list. */
    clear(event: Event): void {
        this.focusControl();
        this.rejected.set([]);
        if (untracked(this.files.value).length > 0) {
            this.files.set(NO_FILES, { reason: "clear-press", event });
        }
    }

    protected onFocusOut(event: FocusEvent): void {
        if (!this.host.contains(event.relatedTarget as Node | null)) {
            this.field.blurred();
        }
    }
}
