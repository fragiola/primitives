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
    typesDelimiter,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    type ComputedRef,
    computed,
    defineComponent,
    h,
    nextTick,
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
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
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
import {
    composing,
    type TagsInputEdit,
    TagsInputKey,
} from "./tags-input-context.ts";

/** What `valueInvalid` reports: why the text was refused (spec/tags-input.md, "API"). */
export interface TagsInputInvalidDetails extends ChangeDetails {
    cause: TagRefusal;
}

export interface TagsInputRootState {
    disabled: boolean;
    empty: boolean;
}

/** What the Root's default scoped slot receives. */
export interface TagsInputSlotProps {
    /** The tags, in order: render one Tag per value. */
    value: readonly string[];
}

export interface TagsInputRootSlots {
    default?: (scope: TagsInputSlotProps) => VNode[];
    render?: (scope: RenderSlotProps<TagsInputRootState>) => VNode[];
}

export interface TagsInputRootProps {
    as?: AsProp;
    /** The tags, in order (`v-model:value`). */
    value?: readonly string[];
    defaultValue?: readonly string[];
    /** The Input's text (`v-model:input-value`). */
    inputValue?: string;
    defaultInputValue?: string;
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
}

export type TagsInputRootEmits = {
    "update:value": (value: string[]) => true;
    valueChange: (value: string[], details: ChangeDetails) => true;
    "update:inputValue": (text: string) => true;
    inputValueChange: (text: string, details: ChangeDetails) => true;
    /** A text was refused as a tag: a duplicate, past `max`, or refused by `validate`. */
    valueInvalid: (text: string, details: TagsInputInvalidDetails) => true;
};

const NONE: readonly string[] = [];
const TAG_SELECTOR = '[data-primitives-part="tags-input-tag"]';

/**
 * A text input that turns what is typed into tags (spec/tags-input.md): adding, removing and
 * editing tags, their keys and focus, the hidden form inputs and the Field binding.
 */
export const TagsInputRoot: PublicComponent<
    TagsInputRootProps,
    TagsInputRootSlots,
    TagsInputRootEmits
> = publicComponent(
    defineComponent({
        name: "TagsInputRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            defaultValue: {
                type: Array as PropType<readonly string[]>,
                default: undefined,
            },
            inputValue: { type: String, default: undefined },
            defaultInputValue: { type: String, default: "" },
            delimiter: {
                type: [String, null] as PropType<string | null>,
                default: ",",
            },
            max: { type: Number, default: Number.POSITIVE_INFINITY },
            allowDuplicates: { type: Boolean, default: false },
            validate: {
                type: Function as PropType<
                    (tag: string, value: readonly string[]) => boolean
                >,
                default: undefined,
            },
            blurBehavior: {
                type: String as PropType<"add" | "clear">,
                default: undefined,
            },
            editable: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            required: { type: Boolean, default: false },
        },
        emits: {
            "update:value": (_value: string[]) => true,
            valueChange: (_value: string[], _details: ChangeDetails) => true,
            "update:inputValue": (_text: string) => true,
            inputValueChange: (_text: string, _details: ChangeDetails) => true,
            valueInvalid: (_text: string, _details: TagsInputInvalidDetails) =>
                true,
        },
        slots: Object as SlotsType<TagsInputRootSlots>,
        setup(props, { attrs, slots, emit }) {
            // read at reset time too: a form reset takes the current defaults (as React does)
            const defaultValue = () => props.defaultValue ?? NONE;
            const own = useControllable<readonly string[], ChangeDetails>(
                () => props.value,
                defaultValue(),
                (next, details) => {
                    emit("update:value", [...next]);
                    emit("valueChange", [...next], details);
                },
            );
            const ownText = useControllable<string, ChangeDetails>(
                () => props.inputValue,
                props.defaultInputValue,
                (next, details) => {
                    emit("update:inputValue", next);
                    emit("inputValueChange", next, details);
                },
            );
            const value: ComputedRef<readonly string[]> = own.value;
            const text: ComputedRef<string> = ownText.value;
            const editing = shallowRef<TagsInputEdit | null>(null);
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const input = shallowRef<HTMLInputElement | null>(null);
            const setInput = (node: unknown) => {
                const next =
                    node instanceof HTMLInputElement
                        ? node
                        : ((node as { $el?: HTMLInputElement } | null)?.$el ??
                          null);
                if (input.value !== next) {
                    input.value = next;
                }
            };
            const validation = shallowRef<HTMLInputElement | null>(null);
            const setValidation = (node: unknown) => {
                validation.value = node as HTMLInputElement | null;
            };
            const direction = useProvidedDirection();
            const inputId = useId();
            const rules = (): TagRules => ({
                delimiter: props.delimiter,
                max: props.max,
                allowDuplicates: props.allowDuplicates,
                validate: props.validate,
            });

            // in a Field, the Input is the labelable control (spec/tags-input.md, "Forms")
            const field = useFieldControl({
                id: () => input.value?.id || inputId,
                labelable: true,
                value: () => [...value.value],
                filled: () => value.value.length > 0,
                input: () => validation.value,
                focusTarget: () => input.value,
            });
            const disabled = () => props.disabled || field.disabled();

            /** The rendered Tags, in order. */
            const tags = (): HTMLElement[] => [
                ...(element.value?.querySelectorAll<HTMLElement>(
                    TAG_SELECTOR,
                ) ?? []),
            ];
            const focusInput = () => input.value?.focus();
            const focusTag = (target: number | "input") => {
                if (target === "input") {
                    focusInput();
                } else {
                    tags()[target]?.focus();
                }
            };
            const refuse = (
                refused: readonly { text: string; cause: TagRefusal }[],
                reason: ChangeReason,
                event: Event | undefined,
            ) => {
                for (const entry of refused) {
                    emit("valueInvalid", entry.text, {
                        reason,
                        event,
                        cause: entry.cause,
                    });
                }
            };
            /** Offers `offered` as tags (spec/tags-input.md, "Adding tags"). */
            const offer = (
                offered: string,
                whole: boolean,
                reason: ChangeReason,
                event: Event | undefined,
            ) => {
                const taken = takeTags(value.value, offered, rules(), whole);
                if (taken.added.length > 0) {
                    own.set([...taken.value], { reason, event });
                }
                refuse(taken.refused, reason, event);
                ownText.set(taken.text, { reason, event });
            };
            /** A controlled text the consumer kept: the Input shows it again once rendered. */
            const reassert = (target: HTMLInputElement) => {
                void nextTick().then(() => {
                    if (target.value !== text.value) {
                        target.value = text.value;
                    }
                });
            };

            const onInputInput = (event: Event) => {
                const target = event.target as HTMLInputElement;
                const next = target.value;
                // only an input that typed the delimiter offers the text: a refused text left in
                // the Input is not offered again on every keystroke (spec/tags-input.md, "Adding
                // tags")
                if (
                    typesDelimiter(
                        text.value,
                        next,
                        props.delimiter,
                        (event as Partial<InputEvent>).data ?? null,
                    )
                ) {
                    offer(next, false, "input-change", event);
                } else {
                    ownText.set(next, { reason: "input-change", event });
                }
                reassert(target);
            };
            const onInputPaste = (event: ClipboardEvent) => {
                const pasted = event.clipboardData?.getData("text") ?? "";
                const { delimiter } = rules();
                // a paste without the delimiter is an ordinary paste
                if (
                    delimiter === null ||
                    delimiter === "" ||
                    !pasted.includes(delimiter)
                ) {
                    return;
                }
                event.preventDefault();
                const target = event.currentTarget as HTMLInputElement;
                const start = target.selectionStart ?? target.value.length;
                const end = target.selectionEnd ?? start;
                offer(
                    target.value.slice(0, start) +
                        pasted +
                        target.value.slice(end),
                    true,
                    "input-paste",
                    event,
                );
                reassert(target);
            };
            const onInputKeydown = (event: KeyboardEvent) => {
                if (event.defaultPrevented || composing(event)) {
                    return;
                }
                const target = event.currentTarget as HTMLInputElement;
                const action = tagsInputInputKeyTarget(
                    event,
                    target,
                    value.value.length,
                    getDirection(target, direction()) === "rtl",
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
                    offer(target.value, true, "keyboard", event);
                    reassert(target);
                    return;
                }
                event.preventDefault();
                focusTag(action.index);
            };

            const remove = (
                index: number,
                reason: ChangeReason,
                event: Event,
            ) => {
                const current = value.value;
                if (index < 0 || index >= current.length) {
                    return;
                }
                // an edit follows its tag: a removal before it moves it down, its own ends it
                // (spec/tags-input.md, "Editing a tag")
                const edit = editing.value;
                if (edit !== null && edit.index >= index) {
                    editing.value =
                        edit.index === index
                            ? null
                            : { index: edit.index - 1, text: edit.text };
                }
                own.set(
                    current.filter((_, position) => position !== index),
                    { reason, event },
                );
            };
            const startEdit = (index: number) => {
                const current = value.value[index];
                if (
                    !props.editable ||
                    disabled() ||
                    current === undefined ||
                    // a double press inside the open TagInput keeps its text
                    editing.value?.index === index
                ) {
                    return;
                }
                editing.value = { index, text: current };
            };
            const onTagKeydown = (event: KeyboardEvent, index: number) => {
                if (
                    event.defaultPrevented ||
                    event.target !== event.currentTarget ||
                    composing(event)
                ) {
                    return;
                }
                const current = event.currentTarget as HTMLElement;
                const action = tagsInputTagKeyTarget(
                    event,
                    index,
                    value.value.length,
                    {
                        rtl: getDirection(current, direction()) === "rtl",
                        editable: props.editable,
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
                    remove(index, "keyboard", event);
                    // the tags that are left, once they render
                    const target = action.focus;
                    void nextTick().then(() => focusTag(target));
                } else {
                    startEdit(index);
                }
            };

            const setEditText = (next: string) => {
                const current = editing.value;
                if (current !== null) {
                    editing.value = { index: current.index, text: next };
                }
            };
            const commitEdit = (
                reason: ChangeReason,
                event: Event,
                focus: boolean,
            ) => {
                const edit = editing.value;
                if (edit === null) {
                    return;
                }
                const result = editTag(
                    value.value,
                    edit.index,
                    edit.text,
                    rules(),
                );
                if (result.type === "refused") {
                    refuse([result], reason, event);
                    // leaving it drops a refused edit; Enter goes on editing
                    if (!focus) {
                        editing.value = null;
                    }
                    return;
                }
                editing.value = null;
                if (result.type !== "unchanged") {
                    own.set([...result.value], { reason, event });
                }
                if (!focus) {
                    return;
                }
                void nextTick().then(() => {
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
                });
            };
            const cancelEdit = () => {
                const edit = editing.value;
                if (edit === null) {
                    return;
                }
                editing.value = null;
                void nextTick().then(() => focusTag(edit.index));
            };
            const onTagInputBlur = (index: number, event: FocusEvent) => {
                // an edit ended by Enter or Escape is already over: it never commits twice
                if (editing.value?.index === index) {
                    commitEdit("input-blur", event, false);
                }
            };
            const clear = (event: Event) => {
                editing.value = null;
                if (value.value.length > 0) {
                    own.set([], { reason: "clear-press", event });
                }
                if (text.value !== "") {
                    ownText.set("", { reason: "clear-press", event });
                }
                focusInput();
            };

            // a form reset returns the tags and the text to their defaults (spec/tags-input.md,
            // "Forms")
            watch(
                validation,
                (hidden, _, onCleanup) => {
                    if (hidden === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(hidden, {
                            reset: () => {
                                field.reset();
                                editing.value = null;
                                own.set(defaultValue(), { reason: "none" });
                                ownText.set(props.defaultInputValue, {
                                    reason: "none",
                                });
                            },
                            invalid: () => input.value,
                        }),
                    );
                },
                { flush: "post" },
            );

            const empty = computed(() => value.value.length === 0);
            provide(TagsInputKey, {
                value,
                text,
                disabled,
                required: () => props.required,
                empty,
                editing,
                inputId,
                setInput,
                fieldAria: field.aria,
                focusInput,
                onInputInput,
                onInputKeydown,
                onInputPaste,
                onTagKeydown,
                startEdit,
                setEditText,
                commitEdit,
                cancelEdit,
                onTagInputBlur,
                remove,
                clear,
            });

            const onFocusin = () => field.onFocus();
            // leaving the TagsInput (spec/tags-input.md, "API": `blurBehavior`)
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget;
                if (next instanceof Node && element.value?.contains(next)) {
                    return;
                }
                const current = text.value;
                if (props.blurBehavior === "add" && current.trim() !== "") {
                    offer(current, true, "input-blur", event);
                } else if (props.blurBehavior === "clear" && current !== "") {
                    ownText.set("", { reason: "input-blur", event });
                }
                field.onBlur();
            };

            return () => {
                const isDisabled = disabled();
                const tagsNow = value.value;
                const isEmpty = empty.value;
                const fieldName = field.name() ?? props.name;
                const state = { disabled: isDisabled, empty: isEmpty };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        "data-primitives-part": "tags-input-root",
                        ...field.attributes(),
                        ...stateAttributes(state),
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () => [
                        slots.default?.({ value: tagsNow }),
                        h("input", {
                            ref: setValidation,
                            "aria-hidden": "true",
                            tabindex: -1,
                            value: "",
                            required: props.required && isEmpty,
                            disabled: isDisabled,
                            style: VISUALLY_HIDDEN_INPUT_STYLE,
                            "data-primitives-part": "tags-input-hidden-input",
                        }),
                        ...(fieldName !== undefined
                            ? tagsNow.map((tag, index) =>
                                  h("input", {
                                      // duplicates are allowed: a tag is its place
                                      key: index,
                                      type: "hidden",
                                      name: fieldName,
                                      value: tag,
                                      disabled: isDisabled,
                                      "data-primitives-part":
                                          "tags-input-hidden-input",
                                  }),
                              )
                            : []),
                    ],
                );
            };
        },
    }),
);
