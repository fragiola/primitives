import { bridgeForm } from "@fragiola/primitives/form";
import {
    type FocusEvent as ReactFocusEvent,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type EditableActivationMode,
    EditableContext,
    type EditableContextValue,
    type EditableState,
    type EditableSubmitMode,
} from "./editable-context.ts";

export interface EditableRootProps extends PartProps<EditableState> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string, details: ChangeDetails) => void;
    /** An edit ended by committing, with its value. */
    onValueCommit?: (value: string, details: ChangeDetails) => void;
    /** An edit ended by reverting, with the value it went back to. */
    onValueRevert?: (value: string, details: ChangeDetails) => void;
    /** What starts an edit on the Preview (default `"focus"`). */
    activationMode?: EditableActivationMode;
    /** What commits an edit (default `"both"`). */
    submitMode?: EditableSubmitMode;
    /** The Preview's text while empty, and the Input's placeholder. */
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

/** Where the focus goes once the next render shows or hides the edit. */
type PendingFocus = "input" | "return" | null;

/**
 * Holds an Editable's value and its edit (spec/editable.md, Zag's and Reka's inline edit): the
 * activations, the commit and revert, and the focus return.
 */
export function EditableRoot({
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onValueCommit,
    onValueRevert,
    activationMode = "focus",
    submitMode = "both",
    placeholder,
    maxLength,
    disabled: disabledProp = false,
    readOnly = false,
    required = false,
    name,
    id: idProp,
    children,
    ...props
}: EditableRootProps) {
    const generated = useId();
    const inputId = idProp ?? generated;
    const [value, setValue] = useControllableState(
        valueProp,
        defaultValue,
        onValueChange,
    );
    const [editing, setEditing] = useState(false);
    const [input, setInputElement] = useState<HTMLInputElement | null>(null);
    const elements = useRef<{
        preview: HTMLElement | null;
        edit: HTMLElement | null;
        submit: HTMLElement | null;
        cancel: HTMLElement | null;
    }>({ preview: null, edit: null, submit: null, cancel: null });
    const field = useFieldControl({
        id: inputId,
        labelable: true,
        value,
        filled: value !== "",
        input: () => input,
        focusTarget: () =>
            latest.current.editing ? input : elements.current.preview,
    });
    const disabled = disabledProp || field.disabled;
    const interactive = !disabled && !readOnly;

    // the value an edit started from, which a revert goes back to
    const start = useRef(value);
    const pending = useRef<PendingFocus>(null);
    // the Preview takes the focus back after an edit: that focus starts no edit
    const returning = useRef(false);
    const latest = useRef({
        value,
        editing,
        interactive,
        activationMode,
        submitMode,
        defaultValue,
        setValue,
        onValueCommit,
        onValueRevert,
        input,
        reset: field.reset,
    });
    latest.current = {
        value,
        editing,
        interactive,
        activationMode,
        submitMode,
        defaultValue,
        setValue,
        onValueCommit,
        onValueRevert,
        input,
        reset: field.reset,
    };

    // after the render that shows the Input, or hides it again (spec/editable.md, "Focus")
    // biome-ignore lint/correctness/useExhaustiveDependencies: runs once the edit changed
    useLayoutEffect(() => {
        const next = pending.current;
        pending.current = null;
        if (next === "input") {
            input?.focus();
            input?.select();
        } else if (next === "return") {
            const { edit, preview } = elements.current;
            if (
                edit !== null &&
                !edit.hidden &&
                !(edit as HTMLButtonElement).disabled
            ) {
                edit.focus();
            } else if (preview !== null) {
                returning.current = true;
                preview.focus();
                returning.current = false;
            }
        }
    }, [editing]);

    const actions = useMemo(() => {
        const leave = (returnFocus: boolean) => {
            latest.current.editing = false;
            pending.current = returnFocus ? "return" : null;
            setEditing(false);
        };
        const commit = (
            reason: string,
            event: Event | undefined,
            returnFocus: boolean,
        ) => {
            const current = latest.current;
            if (!current.editing) {
                return;
            }
            leave(returnFocus);
            current.onValueCommit?.(current.value, {
                reason: reason as ChangeDetails["reason"],
                event,
            });
        };
        const revert = (
            reason: string,
            event: Event | undefined,
            returnFocus: boolean,
        ) => {
            const current = latest.current;
            if (!current.editing) {
                return;
            }
            leave(returnFocus);
            const details = {
                reason: reason as ChangeDetails["reason"],
                event,
            };
            current.setValue(start.current, details);
            current.onValueRevert?.(start.current, details);
        };
        const edit = () => {
            const current = latest.current;
            if (!current.interactive || current.editing) {
                return;
            }
            start.current = current.value;
            current.editing = true;
            pending.current = "input";
            setEditing(true);
        };
        return {
            edit,
            onPreviewFocus: () => {
                if (
                    returning.current ||
                    latest.current.activationMode !== "focus"
                ) {
                    return;
                }
                edit();
            },
            commit: (
                reason: "keyboard" | "submit-press",
                event: Event | undefined,
            ) => commit(reason, event, true),
            revert: (
                reason: "escape-key" | "cancel-press",
                event: Event | undefined,
            ) => revert(reason, event, true),
            onInputText: (text: string, event: Event) => {
                latest.current.setValue(text, {
                    reason: "input-change",
                    event,
                });
            },
            onFocusOut: (event: FocusEvent) => {
                const current = latest.current;
                if (!current.editing) {
                    return;
                }
                const related = event.relatedTarget as Node | null;
                const { submit, cancel } = elements.current;
                const parts = [current.input, submit, cancel];
                // only a blur of the edit's own parts ends it: the EditTrigger or the Preview,
                // hidden as the edit starts, may report a blur to nowhere (spec/editable.md)
                if (!parts.includes(event.target as HTMLElement)) {
                    return;
                }
                for (const part of parts) {
                    if (
                        part !== null &&
                        related !== null &&
                        part.contains(related)
                    ) {
                        return;
                    }
                }
                const target = event.target as Element;
                if (related === null && !target.ownerDocument.hasFocus()) {
                    // the window lost the focus: the edit goes on
                    return;
                }
                const commits =
                    current.submitMode === "blur" ||
                    current.submitMode === "both";
                if (commits) {
                    commit("input-blur", event, related === null);
                } else {
                    revert("input-blur", event, related === null);
                }
            },
        };
    }, []);

    // a form reset ends an edit and returns the value to its default (spec/editable.md, "Forms");
    // an invalid Input moves the focus to the focus target
    useEffect(() => {
        if (input === null) {
            return undefined;
        }
        return bridgeForm(input, {
            reset: () => {
                const current = latest.current;
                if (current.editing) {
                    const active = input.ownerDocument.activeElement;
                    const { submit, cancel } = elements.current;
                    const inEdit =
                        active !== null &&
                        [input, submit, cancel].includes(active as HTMLElement);
                    current.editing = false;
                    pending.current = inEdit ? "return" : null;
                    setEditing(false);
                }
                current.reset();
                current.setValue(current.defaultValue, { reason: "none" });
            },
            invalid: () =>
                latest.current.editing ? input : elements.current.preview,
        });
    }, [input]);

    const empty = value === "";
    const state: EditableState = {
        value,
        editing,
        empty,
        disabled,
        readOnly,
        required,
    };
    const attributes = useMemo(
        () =>
            stateAttributes({
                editing,
                empty,
                disabled,
                readonly: readOnly,
                required,
            }),
        [editing, empty, disabled, readOnly, required],
    );
    const setters = useMemo(
        () => ({
            setInputElement: (element: HTMLElement | null) =>
                setInputElement(element as HTMLInputElement | null),
            setPreviewElement: (element: HTMLElement | null) => {
                elements.current.preview = element;
            },
            setEditTriggerElement: (element: HTMLElement | null) => {
                elements.current.edit = element;
            },
            setSubmitTriggerElement: (element: HTMLElement | null) => {
                elements.current.submit = element;
            },
            setCancelTriggerElement: (element: HTMLElement | null) => {
                elements.current.cancel = element;
            },
        }),
        [],
    );
    const context = useMemo<EditableContextValue>(
        () => ({
            value,
            editing,
            empty,
            disabled,
            readOnly,
            required,
            inputId,
            name: field.name ?? name,
            placeholder,
            maxLength,
            activationMode,
            submitMode,
            field,
            attributes,
            ...actions,
            ...setters,
        }),
        [
            value,
            editing,
            empty,
            disabled,
            readOnly,
            required,
            inputId,
            name,
            placeholder,
            maxLength,
            activationMode,
            submitMode,
            field,
            attributes,
            actions,
            setters,
        ],
    );
    return (
        <EditableContext.Provider value={context}>
            {renderElement("div", { ...props, children }, state, {
                "data-primitives-part": "editable-root",
                ...attributes,
                ...field.attributes,
                onBlur: (event: ReactFocusEvent) =>
                    actions.onFocusOut(event.nativeEvent),
            })}
        </EditableContext.Provider>
    );
}
