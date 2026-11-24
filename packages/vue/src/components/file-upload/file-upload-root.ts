import { announceText } from "@fragiola/primitives/clipboard";
import {
    acceptAttribute,
    assignFiles,
    checkFiles,
    type FileAccept,
    type FileRejection,
} from "@fragiola/primitives/file";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    h,
    type PropType,
    provide,
    type SlotsType,
    shallowRef,
    useId,
    type VNode,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { LIVE_REGION_STYLE } from "../../utils/live-region-style.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { FileUploadKey, type FileUploadState } from "./file-upload-context.ts";

/** What `announcement` receives after a pick. */
export interface FileUploadPickDetails extends ChangeDetails {
    /** The accepted files after the pick. */
    value: File[];
    /** The pick's accepted files. */
    acceptedFiles: File[];
    rejectedFiles: FileRejection<File>[];
}

export interface FileUploadRootSlots {
    default?: (scope: FileUploadState) => VNode[];
    render?: (scope: RenderSlotProps<FileUploadState>) => VNode[];
}

export interface FileUploadRootProps {
    as?: AsProp;
    /** The accepted files (`v-model:value`). */
    value?: File[];
    defaultValue?: File[];
    accept?: FileAccept;
    /** At most this many files (default `1`: a new pick replaces the file). */
    maxFiles?: number;
    minFileSize?: number;
    maxFileSize?: number;
    validate?: (
        file: File,
        value: readonly File[],
    ) => readonly string[] | null | undefined;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    capture?: "user" | "environment";
    /** The HiddenInput's id. */
    id?: string;
    /** ItemSizeText's locale (default: the runtime's). */
    locale?: string;
    /** The text announced (politely) after each pick. */
    announcement?: (details: FileUploadPickDetails) => string;
}

export type FileUploadRootEmits = {
    "update:value": (value: File[]) => true;
    valueChange: (value: File[], details: ChangeDetails) => true;
    fileReject: (
        rejections: FileRejection<File>[],
        details: ChangeDetails,
    ) => true;
};

const NO_FILES: File[] = [];
const DELETE_SELECTOR =
    '[data-primitives-part="file-upload-item-delete-trigger"]';

/**
 * A form control holding a list of files (spec/file-upload.md): the checks of each pick, the
 * accepted and rejected lists, the hidden file input its files are assigned to, the Field binding,
 * and a polite live region it renders as its last child.
 */
export const FileUploadRoot: PublicComponent<
    FileUploadRootProps,
    FileUploadRootSlots,
    FileUploadRootEmits
> = publicComponent(
    defineComponent({
        name: "FileUploadRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: Array as PropType<File[]>, default: undefined },
            defaultValue: {
                type: Array as PropType<File[]>,
                default: undefined,
            },
            accept: {
                type: [String, Array] as PropType<FileAccept>,
                default: undefined,
            },
            maxFiles: { type: Number, default: 1 },
            minFileSize: { type: Number, default: undefined },
            maxFileSize: { type: Number, default: undefined },
            validate: {
                type: Function as PropType<
                    (
                        file: File,
                        value: readonly File[],
                    ) => readonly string[] | null | undefined
                >,
                default: undefined,
            },
            name: { type: String, default: undefined },
            required: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            capture: {
                type: String as PropType<"user" | "environment">,
                default: undefined,
            },
            id: { type: String, default: undefined },
            locale: { type: String, default: undefined },
            announcement: {
                type: Function as PropType<
                    (details: FileUploadPickDetails) => string
                >,
                default: undefined,
            },
        },
        emits: {
            "update:value": (_value: File[]) => true,
            valueChange: (_value: File[], _details: ChangeDetails) => true,
            fileReject: (
                _rejections: FileRejection<File>[],
                _details: ChangeDetails,
            ) => true,
        },
        slots: Object as SlotsType<FileUploadRootSlots>,
        setup(props, { attrs, slots, emit }) {
            // read at reset time too: a form reset takes the current default
            const defaultValue = () => props.defaultValue ?? NO_FILES;
            const own = useControllable<File[], ChangeDetails>(
                () => props.value,
                defaultValue(),
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = own.value;
            const rejectedFiles = shallowRef<FileRejection<File>[]>([]);
            const dropTarget = shallowRef(false);
            const labelled = shallowRef(false);
            const input = shallowRef<HTMLElement | null>(null);
            const trigger = shallowRef<HTMLElement | null>(null);
            const dropzone = shallowRef<HTMLElement | null>(null);
            const root = shallowRef<HTMLElement | null>(null);
            const announcer = shallowRef<HTMLElement | null>(null);
            const setAnnouncer = elementSetter(announcer);
            const setRoot = elementSetter(root);
            // a pick re-assigns the input's files even when the value did not change (the dialog
            // wrote the picked files into it)
            const syncs = shallowRef(0);
            const generatedId = useId();
            const inputId = () => props.id ?? `${generatedId}input`;
            const labelId = `${generatedId}label`;
            const fileInput = () => input.value as HTMLInputElement | null;

            const field = useFieldControl({
                id: inputId,
                labelable: true,
                value: () => value.value,
                filled: () => value.value.length > 0,
                input: fileInput,
                focusTarget: () => trigger.value ?? dropzone.value,
            });
            const disabled = () => props.disabled || field.disabled();

            watch(
                [input, value, syncs],
                () => {
                    const element = fileInput();
                    if (element !== null) {
                        assignFiles(element, value.value);
                    }
                },
                { flush: "post" },
            );

            const pick = (
                files: File[],
                reason: ChangeReason,
                event: Event,
            ) => {
                if (disabled()) {
                    return;
                }
                const result = checkFiles(value.value, files, {
                    accept: props.accept,
                    maxFiles: props.maxFiles,
                    minFileSize: props.minFileSize,
                    maxFileSize: props.maxFileSize,
                    validate: props.validate,
                });
                syncs.value += 1;
                rejectedFiles.value = result.rejected;
                const details = { reason, event };
                if (result.value !== value.value) {
                    own.set(result.value, details);
                }
                if (result.rejected.length > 0) {
                    emit("fileReject", result.rejected, details);
                }
                if (props.announcement !== undefined && announcer.value) {
                    announceText(
                        announcer.value,
                        props.announcement({
                            value: result.value,
                            acceptedFiles: result.accepted,
                            rejectedFiles: result.rejected,
                            reason,
                            event,
                        }),
                    );
                }
            };
            const openDialog = () => {
                if (!disabled()) {
                    fileInput()?.click();
                }
            };
            const focusControl = () =>
                (trigger.value ?? dropzone.value)?.focus();
            const remove = (file: File, event: Event, button: HTMLElement) => {
                // the focus moves to the next delete button, else the previous one, else the
                // Trigger (spec/file-upload.md, "Focus"), in the button's ItemGroup
                const scope =
                    button.closest(
                        '[data-primitives-part="file-upload-item-group"]',
                    ) ?? root.value;
                const buttons = [
                    ...(scope?.querySelectorAll<HTMLElement>(DELETE_SELECTOR) ??
                        []),
                ];
                const index = buttons.indexOf(button);
                const next =
                    index === -1
                        ? undefined
                        : (buttons[index + 1] ?? buttons[index - 1]);
                if (next !== undefined) {
                    next.focus();
                } else {
                    focusControl();
                }
                if (value.value.includes(file)) {
                    own.set(
                        value.value.filter((entry: File) => entry !== file),
                        { reason: "delete-press", event },
                    );
                } else {
                    rejectedFiles.value = rejectedFiles.value.filter(
                        (entry) => entry.file !== file,
                    );
                }
            };
            const clear = (event: Event) => {
                focusControl();
                rejectedFiles.value = [];
                own.set([], { reason: "clear-press", event });
            };

            // a form reset returns to the default value (spec/file-upload.md, "Forms")
            watch(
                input,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element as HTMLInputElement, {
                            reset: () => {
                                field.reset();
                                rejectedFiles.value = [];
                                syncs.value += 1;
                                own.set(defaultValue(), { reason: "none" });
                            },
                            invalid: () => trigger.value ?? dropzone.value,
                        }),
                    );
                },
                { flush: "post" },
            );

            const state = computed<FileUploadState>(() => ({
                value: value.value,
                rejectedFiles: rejectedFiles.value,
                disabled: disabled(),
                empty: value.value.length === 0,
                dropTarget: dropTarget.value,
            }));
            const attributes = computed(() => ({
                ...field.attributes(),
                ...stateAttributes({
                    disabled: state.value.disabled,
                    empty: state.value.empty,
                    "drop-target": state.value.dropTarget,
                }),
            }));
            provide(FileUploadKey, {
                state,
                inputId,
                labelId,
                name: () => field.name() ?? props.name,
                accept: () => acceptAttribute(props.accept),
                multiple: () => props.maxFiles > 1,
                capture: () => props.capture,
                required: () => props.required,
                locale: () => props.locale,
                attributes,
                setLabelled: (next) => {
                    labelled.value = next;
                },
                setInput: elementSetter(input),
                setTrigger: elementSetter(trigger),
                setDropzone: elementSetter(dropzone),
                setDropTarget: (active) => {
                    dropTarget.value = active;
                },
                pick,
                openDialog,
                remove,
                clear,
            });

            const onFocusin = () => field.onFocus();
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget;
                if (next instanceof Node && root.value?.contains(next)) {
                    return;
                }
                field.onBlur();
            };

            return () => {
                const aria = field.aria();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state.value,
                    {
                        role: "group",
                        "aria-labelledby": field.inField
                            ? aria["aria-labelledby"]
                            : labelled.value
                              ? labelId
                              : undefined,
                        "aria-describedby": aria["aria-describedby"],
                        "aria-invalid": aria["aria-invalid"],
                        "data-primitives-part": "file-upload-root",
                        ...attributes.value,
                        onFocusin,
                        onFocusout,
                        ref: setRoot,
                    },
                    () => [
                        ...(slots.default?.(state.value) ?? []),
                        // the toolkit writes its text: it renders no children
                        h("span", {
                            ref: setAnnouncer,
                            "aria-live": "polite",
                            "aria-atomic": "true",
                            "data-primitives-part": "file-upload-announcer",
                            style: LIVE_REGION_STYLE,
                        }),
                    ],
                );
            };
        },
    }),
);
