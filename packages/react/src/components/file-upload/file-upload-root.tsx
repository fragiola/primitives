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
    type FocusEvent,
    type ReactNode,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { LIVE_REGION_STYLE } from "../../utils/live-region-style.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    FileUploadContext,
    type FileUploadContextValue,
    type FileUploadState,
} from "./file-upload-context.ts";

/** What `announcement` receives after a pick. */
export interface FileUploadPickDetails extends ChangeDetails {
    /** The accepted files after the pick. */
    value: File[];
    /** The pick's accepted files. */
    acceptedFiles: File[];
    rejectedFiles: FileRejection<File>[];
}

export interface FileUploadRootProps
    extends Omit<PartProps<FileUploadState>, "children"> {
    value?: File[];
    defaultValue?: File[];
    onValueChange?: (value: File[], details: ChangeDetails) => void;
    onFileReject?: (
        rejections: FileRejection<File>[],
        details: ChangeDetails,
    ) => void;
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
    children?: ReactNode | ((state: FileUploadState) => ReactNode);
}

const NO_FILES: File[] = [];

/**
 * A form control holding a list of files (spec/file-upload.md): the checks of each pick, the
 * accepted and rejected lists, the hidden file input its files are assigned to, the Field binding,
 * and a polite live region it renders as its last child.
 */
export function FileUploadRoot({
    value: valueProp,
    defaultValue = NO_FILES,
    onValueChange,
    onFileReject,
    accept,
    maxFiles = 1,
    minFileSize,
    maxFileSize,
    validate,
    name,
    required = false,
    disabled: disabledProp = false,
    capture,
    id,
    locale,
    announcement,
    children,
    ...props
}: FileUploadRootProps) {
    const [value, setValue] = useControllableState<File[], ChangeDetails>(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const [rejectedFiles, setRejectedFiles] = useState<FileRejection<File>[]>(
        [],
    );
    const [dropTarget, setDropTarget] = useState(false);
    const [labelled, setLabelled] = useState(false);
    const [input, setInput] = useElement<HTMLInputElement>();
    const [trigger, setTrigger] = useElement<HTMLElement>();
    const [dropzone, setDropzone] = useElement<HTMLElement>();
    const [root, setRoot] = useElement<HTMLElement>();
    const announcer = useRef<HTMLSpanElement | null>(null);
    // a pick re-assigns the input's files even when the value did not change (the dialog wrote
    // the picked files into it)
    const [syncs, setSyncs] = useState(0);
    const generatedId = useId();
    const inputId = id ?? `${generatedId}input`;
    const labelId = `${generatedId}label`;

    const field = useFieldControl({
        id: inputId,
        labelable: true,
        value,
        filled: value.length > 0,
        input: () => input,
        focusTarget: () => trigger ?? dropzone,
    });
    const disabled = disabledProp || field.disabled;

    const latest = useRef({
        value,
        rejectedFiles,
        rules: { accept, maxFiles, minFileSize, maxFileSize, validate },
        onFileReject,
        announcement,
        input,
        trigger,
        dropzone,
        root,
        disabled,
    });
    latest.current = {
        value,
        rejectedFiles,
        rules: { accept, maxFiles, minFileSize, maxFileSize, validate },
        onFileReject,
        announcement,
        input,
        trigger,
        dropzone,
        root,
        disabled,
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: `syncs` re-runs it after a pick
    useLayoutEffect(() => {
        if (input !== null) {
            assignFiles(input, value);
        }
    }, [input, value, syncs]);

    const pick = useCallback(
        (files: File[], reason: ChangeReason, event: Event) => {
            const current = latest.current;
            if (current.disabled) {
                return;
            }
            const result = checkFiles(current.value, files, current.rules);
            setSyncs((count) => count + 1);
            setRejectedFiles(result.rejected);
            const details = { reason, event };
            if (result.value !== current.value) {
                setValue(result.value, details);
            }
            if (result.rejected.length > 0) {
                current.onFileReject?.(result.rejected, details);
            }
            if (current.announcement !== undefined && announcer.current) {
                announceText(
                    announcer.current,
                    current.announcement({
                        value: result.value,
                        acceptedFiles: result.accepted,
                        rejectedFiles: result.rejected,
                        reason,
                        event,
                    }),
                );
            }
        },
        [setValue],
    );
    const openDialog = useCallback(() => {
        const current = latest.current;
        if (!current.disabled) {
            current.input?.click();
        }
    }, []);
    const focusControl = useCallback(() => {
        const current = latest.current;
        (current.trigger ?? current.dropzone)?.focus();
    }, []);
    const remove = useCallback(
        (file: File, event: Event, button: HTMLElement) => {
            const current = latest.current;
            // the focus moves to the next delete button, else the previous one, else the
            // Trigger (spec/file-upload.md, "Focus"), in the button's ItemGroup
            const scope =
                button.closest(
                    '[data-primitives-part="file-upload-item-group"]',
                ) ?? current.root;
            const buttons = [
                ...(scope?.querySelectorAll<HTMLElement>(
                    '[data-primitives-part="file-upload-item-delete-trigger"]',
                ) ?? []),
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
            if (current.value.includes(file)) {
                setValue(
                    current.value.filter((entry) => entry !== file),
                    { reason: "delete-press", event },
                );
            } else {
                setRejectedFiles(
                    current.rejectedFiles.filter(
                        (entry) => entry.file !== file,
                    ),
                );
            }
        },
        [setValue, focusControl],
    );
    const clear = useCallback(
        (event: Event) => {
            focusControl();
            setRejectedFiles([]);
            setValue([], { reason: "clear-press", event });
        },
        [setValue, focusControl],
    );

    // a form reset returns to the default value (spec/file-upload.md, "Forms")
    const reset = useRef({ defaultValue, setValue, markReset: field.reset });
    reset.current = { defaultValue, setValue, markReset: field.reset };
    useEffect(() => {
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                const current = reset.current;
                current.markReset();
                setRejectedFiles([]);
                setSyncs((count) => count + 1);
                current.setValue(current.defaultValue, { reason: "none" });
            },
            invalid: () => {
                const current = latest.current;
                return current.trigger ?? current.dropzone;
            },
        });
    }, [input]);

    const empty = value.length === 0;
    const state: FileUploadState = {
        value,
        rejectedFiles,
        disabled,
        empty,
        dropTarget,
    };
    const attributes = useMemo(
        () => ({
            ...field.attributes,
            ...stateAttributes({ disabled, empty, "drop-target": dropTarget }),
        }),
        [field.attributes, disabled, empty, dropTarget],
    );
    const context = useMemo<FileUploadContextValue>(
        () => ({
            value,
            rejectedFiles,
            disabled,
            empty,
            dropTarget,
            inputId,
            labelId,
            name: field.name ?? name,
            accept: acceptAttribute(accept),
            multiple: maxFiles > 1,
            capture,
            required,
            locale,
            attributes,
            setLabelled,
            setInput,
            setTrigger,
            setDropzone,
            setDropTarget,
            pick,
            openDialog,
            remove,
            clear,
        }),
        [
            value,
            rejectedFiles,
            disabled,
            empty,
            dropTarget,
            inputId,
            labelId,
            field.name,
            name,
            accept,
            maxFiles,
            capture,
            required,
            locale,
            attributes,
            setInput,
            setTrigger,
            setDropzone,
            pick,
            openDialog,
            remove,
            clear,
        ],
    );
    const content = typeof children === "function" ? children(state) : children;
    return (
        <FileUploadContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...props,
                    children: (
                        <>
                            {content}
                            <span
                                ref={announcer}
                                aria-live="polite"
                                aria-atomic="true"
                                data-primitives-part="file-upload-announcer"
                                style={LIVE_REGION_STYLE}
                            />
                        </>
                    ),
                },
                state,
                {
                    role: "group",
                    "aria-labelledby": field.inField
                        ? field.aria["aria-labelledby"]
                        : labelled
                          ? labelId
                          : undefined,
                    "aria-describedby": field.aria["aria-describedby"],
                    "aria-invalid": field.aria["aria-invalid"],
                    "data-primitives-part": "file-upload-root",
                    ...attributes,
                    onFocus: field.onFocus,
                    onBlur: (event: FocusEvent<HTMLElement>) => {
                        if (
                            !event.currentTarget.contains(
                                event.relatedTarget as Node | null,
                            )
                        ) {
                            field.onBlur();
                        }
                    },
                },
                setRoot,
            )}
        </FileUploadContext.Provider>
    );
}
