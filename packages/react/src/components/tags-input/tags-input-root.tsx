import {
    tagsInputInputKeyTarget,
    tagsInputTagKeyTarget,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    editTag,
    type TagRefusal,
    type TagRules,
    takeTags,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type ClipboardEvent,
    type FocusEvent,
    type FormEvent,
    type KeyboardEvent,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { flushSync } from "react-dom";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { useElement } from "../../hooks/use-element.ts";
import { useFieldControl } from "../../hooks/use-field-control.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TagsInputContext, type TagsInputEdit } from "./tags-input-context.ts";

/** What `onValueInvalid` reports: why the text was refused (spec/tags-input.md, "API"). */
export interface TagsInputInvalidDetails extends ChangeDetails {
    cause: TagRefusal;
}

export interface TagsInputRootState {
    disabled: boolean;
    empty: boolean;
}

export interface TagsInputRootProps
    extends Omit<PartProps<TagsInputRootState>, "children"> {
    /** The tags, in order. */
    value?: readonly string[];
    defaultValue?: readonly string[];
    onValueChange?: (value: string[], details: ChangeDetails) => void;
    /** The Input's text. */
    inputValue?: string;
    defaultInputValue?: string;
    onInputValueChange?: (text: string, details: ChangeDetails) => void;
    /** A text was refused as a tag: a duplicate, past `max`, or refused by `validate`. */
    onValueInvalid?: (text: string, details: TagsInputInvalidDetails) => void;
    /** Ends a tag while typing and splits a paste (default `","`); `null` for none. */
    delimiter?: string | null;
    /** The most tags (default `Infinity`). */
    max?: number;
    /** A text equal to a tag is accepted (default `false`). */
    allowDuplicates?: boolean;
    /** `false` refuses a trimmed text; `value` is the tags it would join. */
    validate?: (tag: string, value: readonly string[]) => boolean;
    /** Leaving the TagsInput adds the text as tags, or clears it (default: it stays). */
    blurBehavior?: "add" | "clear";
    /** Enter and a double press on a Tag edit it in its TagInput (default `false`). */
    editable?: boolean;
    disabled?: boolean;
    name?: string;
    /** The form's validation fails while there is no tag. */
    required?: boolean;
    /** The Tags and the rest; a function of the value, for an uncontrolled root. */
    children?: ReactNode | ((state: { value: readonly string[] }) => ReactNode);
}

const NONE: readonly string[] = [];
const NOOP = () => {};
const TAG_SELECTOR = '[data-primitives-part="tags-input-tag"]';

/** A key of a text composition (an IME), which the TagsInput leaves alone. */
function composing(event: KeyboardEvent): boolean {
    return event.nativeEvent.isComposing || event.keyCode === 229;
}

/**
 * A text input that turns what is typed into tags (spec/tags-input.md): adding, removing and
 * editing tags, their keys and focus, the hidden form inputs and the Field binding.
 */
export function TagsInputRoot(props: TagsInputRootProps) {
    const {
        value: valueProp,
        defaultValue = NONE,
        onValueChange,
        inputValue: inputValueProp,
        defaultInputValue = "",
        onInputValueChange,
        onValueInvalid,
        delimiter = ",",
        max = Number.POSITIVE_INFINITY,
        allowDuplicates = false,
        validate,
        blurBehavior,
        editable = false,
        disabled: disabledProp = false,
        name,
        required = false,
        children,
        ...rest
    } = props;
    const [value, setValue] = useControllableState<
        readonly string[],
        ChangeDetails
    >(
        valueProp,
        defaultValue,
        onValueChange as
            | ((value: readonly string[], details: ChangeDetails) => void)
            | undefined,
    );
    const [text, setText] = useControllableState<string, ChangeDetails>(
        inputValueProp,
        defaultInputValue,
        onInputValueChange,
    );
    const [editing, setEditingState] = useState<TagsInputEdit | null>(null);
    const editingRef = useRef<TagsInputEdit | null>(null);
    const setEditing = useCallback((next: TagsInputEdit | null) => {
        editingRef.current = next;
        setEditingState(next);
    }, []);
    const [element, ref] = useElement<HTMLElement>();
    const [input, setInput] = useState<HTMLInputElement | null>(null);
    const validation = useRef<HTMLInputElement>(null);
    const direction = useContext(DirectionContext);
    const inputId = useId();

    const rules: TagRules = { delimiter, max, allowDuplicates, validate };
    const latest = useRef({
        value,
        text,
        rules,
        input,
        element,
        onValueInvalid,
    });
    latest.current = { value, text, rules, input, element, onValueInvalid };

    // in a Field, the Input is the labelable control (spec/tags-input.md, "Forms")
    const field = useFieldControl({
        id: input?.id || inputId,
        labelable: true,
        value: [...value],
        filled: value.length > 0,
        input: () => validation.current,
        focusTarget: () => latest.current.input,
    });
    const disabled = disabledProp || field.disabled;

    /** The rendered Tags, in order. */
    const tags = useCallback(
        (): HTMLElement[] => [
            ...(latest.current.element?.querySelectorAll<HTMLElement>(
                TAG_SELECTOR,
            ) ?? []),
        ],
        [],
    );
    const focusInput = useCallback(() => latest.current.input?.focus(), []);
    const focusTag = useCallback(
        (target: number | "input") => {
            if (target === "input") {
                focusInput();
            } else {
                tags()[target]?.focus();
            }
        },
        [tags, focusInput],
    );
    const refuse = useCallback(
        (
            refused: readonly { text: string; cause: TagRefusal }[],
            reason: ChangeReason,
            event: Event | undefined,
        ) => {
            for (const entry of refused) {
                latest.current.onValueInvalid?.(entry.text, {
                    reason,
                    event,
                    cause: entry.cause,
                });
            }
        },
        [],
    );
    /** Offers `offered` as tags (spec/tags-input.md, "Adding tags"). */
    const offer = useCallback(
        (
            offered: string,
            whole: boolean,
            reason: ChangeReason,
            event: Event | undefined,
        ) => {
            const current = latest.current;
            const taken = takeTags(
                current.value,
                offered,
                current.rules,
                whole,
            );
            if (taken.added.length > 0) {
                setValue([...taken.value], { reason, event });
            }
            refuse(taken.refused, reason, event);
            setText(taken.text, { reason, event });
        },
        [setValue, setText, refuse],
    );

    const onInputChange = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            const next = event.currentTarget.value;
            const { delimiter: current } = latest.current.rules;
            if (current !== null && current !== "" && next.includes(current)) {
                offer(next, false, "input-change", event.nativeEvent);
            } else {
                setText(next, {
                    reason: "input-change",
                    event: event.nativeEvent,
                });
            }
        },
        [offer, setText],
    );
    const onInputPaste = useCallback(
        (event: ClipboardEvent<HTMLInputElement>) => {
            const pasted = event.clipboardData.getData("text");
            const { delimiter: current } = latest.current.rules;
            // a paste without the delimiter is an ordinary paste
            if (
                current === null ||
                current === "" ||
                !pasted.includes(current)
            ) {
                return;
            }
            event.preventDefault();
            const target = event.currentTarget;
            const start = target.selectionStart ?? target.value.length;
            const end = target.selectionEnd ?? start;
            offer(
                target.value.slice(0, start) + pasted + target.value.slice(end),
                true,
                "input-paste",
                event.nativeEvent,
            );
        },
        [offer],
    );
    const onInputKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.defaultPrevented || composing(event)) {
                return;
            }
            const target = event.currentTarget;
            const action = tagsInputInputKeyTarget(
                event,
                target,
                latest.current.value.length,
                getDirection(target, direction) === "rtl",
            );
            if (action === null) {
                return;
            }
            if (action.type === "add") {
                // an empty text leaves Enter to the form, which submits
                if (target.value.trim() === "") {
                    return;
                }
                event.preventDefault();
                offer(target.value, true, "keyboard", event.nativeEvent);
                return;
            }
            event.preventDefault();
            focusTag(action.index);
        },
        [direction, offer, focusTag],
    );

    const remove = useCallback(
        (index: number, reason: ChangeReason, event: Event) => {
            const current = latest.current.value;
            if (index < 0 || index >= current.length) {
                return;
            }
            flushSync(() =>
                setValue(
                    current.filter((_, position) => position !== index),
                    { reason, event },
                ),
            );
        },
        [setValue],
    );
    const startEdit = useCallback(
        (index: number) => {
            const current = latest.current.value[index];
            if (!editable || disabled || current === undefined) {
                return;
            }
            setEditing({ index, text: current });
        },
        [editable, disabled, setEditing],
    );
    const onTagKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>, index: number) => {
            if (
                event.defaultPrevented ||
                event.target !== event.currentTarget ||
                composing(event)
            ) {
                return;
            }
            const action = tagsInputTagKeyTarget(
                event,
                index,
                latest.current.value.length,
                {
                    rtl: getDirection(event.currentTarget, direction) === "rtl",
                    editable,
                },
            );
            if (action === null) {
                return;
            }
            if (action.type === "type") {
                // the character goes on to the Input
                focusInput();
                return;
            }
            event.preventDefault();
            if (action.type === "focus") {
                focusTag(action.target);
            } else if (action.type === "remove") {
                remove(index, "keyboard", event.nativeEvent);
                focusTag(action.focus);
            } else {
                startEdit(index);
            }
        },
        [direction, editable, focusInput, focusTag, remove, startEdit],
    );

    const setEditText = useCallback(
        (next: string) => {
            const current = editingRef.current;
            if (current !== null) {
                setEditing({ index: current.index, text: next });
            }
        },
        [setEditing],
    );
    const commitEdit = useCallback(
        (reason: ChangeReason, event: Event, focus: boolean) => {
            const edit = editingRef.current;
            if (edit === null) {
                return;
            }
            const current = latest.current;
            const result = editTag(
                current.value,
                edit.index,
                edit.text,
                current.rules,
            );
            if (result.type === "refused") {
                refuse([result], reason, event);
                // leaving it drops a refused edit; Enter goes on editing
                if (!focus) {
                    setEditing(null);
                }
                return;
            }
            flushSync(() => {
                setEditing(null);
                if (result.type !== "unchanged") {
                    setValue([...result.value], { reason, event });
                }
            });
            if (!focus) {
                return;
            }
            if (result.type === "removed") {
                // as Delete: the tag now at its place, else the previous one, else the Input
                const left = result.value.length;
                focusTag(
                    edit.index < left
                        ? edit.index
                        : left > 0
                          ? left - 1
                          : "input",
                );
            } else {
                focusTag(edit.index);
            }
        },
        [refuse, setEditing, setValue, focusTag],
    );
    const cancelEdit = useCallback(() => {
        const edit = editingRef.current;
        if (edit === null) {
            return;
        }
        flushSync(() => setEditing(null));
        focusTag(edit.index);
    }, [setEditing, focusTag]);
    const onTagInputBlur = useCallback(
        (index: number, event: FocusEvent<HTMLInputElement>) => {
            if (editingRef.current?.index === index) {
                commitEdit("input-blur", event.nativeEvent, false);
            }
        },
        [commitEdit],
    );
    const clear = useCallback(
        (event: Event) => {
            const current = latest.current;
            setEditing(null);
            if (current.value.length > 0) {
                setValue([], { reason: "clear-press", event });
            }
            if (current.text !== "") {
                setText("", { reason: "clear-press", event });
            }
            focusInput();
        },
        [setEditing, setValue, setText, focusInput],
    );

    // a form reset returns the tags and the text to their defaults (spec/tags-input.md, "Forms")
    const reset = useRef({
        defaultValue,
        defaultInputValue,
        setValue,
        setText,
        setEditing,
        markReset: field.reset,
    });
    reset.current = {
        defaultValue,
        defaultInputValue,
        setValue,
        setText,
        setEditing,
        markReset: field.reset,
    };
    useEffect(() => {
        const hidden = validation.current;
        if (hidden === null) {
            return undefined;
        }
        return bridgeForm(hidden, {
            reset: () => {
                const current = reset.current;
                current.markReset();
                current.setEditing(null);
                current.setValue(current.defaultValue, { reason: "none" });
                current.setText(current.defaultInputValue, { reason: "none" });
            },
            invalid: () => latest.current.input,
        });
    }, []);

    const empty = value.length === 0;
    const context = useMemo(
        () => ({
            value,
            text,
            disabled,
            required,
            empty,
            editing,
            inputId,
            setInput,
            fieldAria: field.aria,
            focusInput,
            onInputChange,
            onInputKeyDown,
            onInputPaste,
            onTagKeyDown,
            startEdit,
            setEditText,
            commitEdit,
            cancelEdit,
            onTagInputBlur,
            remove,
            clear,
        }),
        [
            value,
            text,
            disabled,
            required,
            empty,
            editing,
            inputId,
            field.aria,
            focusInput,
            onInputChange,
            onInputKeyDown,
            onInputPaste,
            onTagKeyDown,
            startEdit,
            setEditText,
            commitEdit,
            cancelEdit,
            onTagInputBlur,
            remove,
            clear,
        ],
    );
    const fieldName = field.name ?? name;
    const state = { disabled, empty };
    const content =
        typeof children === "function" ? children({ value }) : children;
    return (
        <TagsInputContext.Provider value={context}>
            {renderElement(
                "div",
                {
                    ...rest,
                    children: (
                        <>
                            {content}
                            <input
                                ref={validation}
                                aria-hidden="true"
                                tabIndex={-1}
                                value=""
                                required={required && empty}
                                disabled={disabled}
                                onChange={NOOP}
                                style={VISUALLY_HIDDEN_INPUT_STYLE}
                                data-primitives-part="tags-input-hidden-input"
                            />
                            {fieldName !== undefined
                                ? value.map((tag, index) => (
                                      <input
                                          // biome-ignore lint/suspicious/noArrayIndexKey: duplicates are allowed; a tag is its place
                                          key={index}
                                          type="hidden"
                                          name={fieldName}
                                          value={tag}
                                          disabled={disabled}
                                          data-primitives-part="tags-input-hidden-input"
                                      />
                                  ))
                                : null}
                        </>
                    ),
                },
                state,
                {
                    "data-primitives-part": "tags-input-root",
                    ...field.attributes,
                    ...stateAttributes(state),
                    onFocus: field.onFocus,
                    // leaving the TagsInput (spec/tags-input.md, "API": `blurBehavior`)
                    onBlur: (event: FocusEvent<HTMLElement>) => {
                        const next = event.relatedTarget;
                        if (
                            next instanceof Node &&
                            event.currentTarget.contains(next)
                        ) {
                            return;
                        }
                        const current = latest.current.text;
                        if (blurBehavior === "add" && current.trim() !== "") {
                            offer(
                                current,
                                true,
                                "input-blur",
                                event.nativeEvent,
                            );
                        } else if (blurBehavior === "clear" && current !== "") {
                            setText("", {
                                reason: "input-blur",
                                event: event.nativeEvent,
                            });
                        }
                        field.onBlur();
                    },
                },
                ref,
            )}
        </TagsInputContext.Provider>
    );
}
