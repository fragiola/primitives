import { bridgeForm } from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    nextTick,
    type PropType,
    provide,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type EditableActivationMode,
    EditableKey,
    type EditableState,
    type EditableSubmitMode,
} from "./editable-context.ts";

export interface EditableRootProps {
    /** The text (controlled; `v-model:value`). */
    value?: string;
    defaultValue?: string;
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
    /** The Input's `name`. */
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

export type EditableRootEmits = {
    "update:value": (value: string) => true;
    valueChange: (value: string, details: ChangeDetails) => true;
    /** An edit ended by committing, with its value. */
    valueCommit: (value: string, details: ChangeDetails) => true;
    /** An edit ended by reverting, with the value it went back to. */
    valueRevert: (value: string, details: ChangeDetails) => true;
};

/**
 * Holds an Editable's value and its edit (spec/editable.md, Zag's and Reka's inline edit): the
 * activations, the commit and revert, and the focus return.
 */
export const EditableRoot: PartComponent<
    EditableRootProps,
    EditableState,
    EditableRootEmits
> = publicComponent(
    defineComponent({
        name: "EditableRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, default: undefined },
            defaultValue: { type: String, default: "" },
            activationMode: {
                type: String as PropType<EditableActivationMode>,
                default: "focus",
            },
            submitMode: {
                type: String as PropType<EditableSubmitMode>,
                default: "both",
            },
            placeholder: { type: String, default: undefined },
            maxLength: { type: Number, default: undefined },
            disabled: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            id: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: string) => true,
            valueChange: (_value: string, _details: ChangeDetails) => true,
            valueCommit: (_value: string, _details: ChangeDetails) => true,
            valueRevert: (_value: string, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const generatedId = useId();
            const inputId = () => props.id ?? generatedId;
            const value = useControllable<string, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const editing = shallowRef(false);
            const input = shallowRef<HTMLElement | null>(null);
            const preview = shallowRef<HTMLElement | null>(null);
            const editTrigger = shallowRef<HTMLElement | null>(null);
            const submitTrigger = shallowRef<HTMLElement | null>(null);
            const cancelTrigger = shallowRef<HTMLElement | null>(null);
            const field = useFieldControl({
                id: inputId,
                labelable: true,
                value: () => value.value.value,
                filled: () => value.value.value !== "",
                input: () => input.value as HTMLInputElement | null,
                focusTarget: () =>
                    editing.value ? input.value : preview.value,
            });
            const disabled = () => props.disabled || field.disabled();
            const interactive = () => !disabled() && !props.readOnly;

            // the value an edit started from, which a revert goes back to
            let start = value.value.value;
            // where the focus goes once the edit's next render shows or hides it
            let pending: "input" | "return" | null = null;
            // the Preview takes the focus back after an edit: that focus starts no edit
            let returning = false;
            // a controlled value the consumer kept does not re-render the input: re-assert it
            const reassert = () => {
                const element = input.value as HTMLInputElement | null;
                void nextTick().then(() => {
                    if (
                        element !== null &&
                        element.value !== value.value.value
                    ) {
                        element.value = value.value.value;
                    }
                });
            };

            // after the render that shows the Input, or hides it again (spec/editable.md, "Focus")
            watch(
                editing,
                () => {
                    const next = pending;
                    pending = null;
                    if (next === "input") {
                        const element = input.value as HTMLInputElement | null;
                        element?.focus();
                        element?.select();
                    } else if (next === "return") {
                        const edit = editTrigger.value;
                        if (
                            edit !== null &&
                            !edit.hidden &&
                            !(edit as HTMLButtonElement).disabled
                        ) {
                            edit.focus();
                        } else if (preview.value !== null) {
                            returning = true;
                            preview.value.focus();
                            returning = false;
                        }
                    }
                },
                { flush: "post" },
            );

            const leave = (returnFocus: boolean) => {
                pending = returnFocus ? "return" : null;
                editing.value = false;
            };
            const commit = (
                reason: ChangeReason,
                event: Event | undefined,
                returnFocus: boolean,
            ) => {
                if (!editing.value) {
                    return;
                }
                leave(returnFocus);
                emit("valueCommit", value.value.value, { reason, event });
            };
            const revert = (
                reason: ChangeReason,
                event: Event | undefined,
                returnFocus: boolean,
            ) => {
                if (!editing.value) {
                    return;
                }
                leave(returnFocus);
                const details = { reason, event };
                value.set(start, details);
                reassert();
                emit("valueRevert", start, details);
            };
            const edit = () => {
                if (!interactive() || editing.value) {
                    return;
                }
                start = value.value.value;
                pending = "input";
                editing.value = true;
            };

            // the focus left a part of the Root: an edit ends once it is outside the edit's parts
            const onFocusout = (event: FocusEvent) => {
                if (!editing.value) {
                    return;
                }
                const related = event.relatedTarget as Node | null;
                const parts = [
                    input.value,
                    submitTrigger.value,
                    cancelTrigger.value,
                ];
                // only the edit's parts end it: the EditTrigger or the Preview hidden while it
                // starts loses the focus too (Chromium blurs a focused element it hides)
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
                if (
                    props.submitMode === "blur" ||
                    props.submitMode === "both"
                ) {
                    commit("input-blur", event, related === null);
                } else {
                    revert("input-blur", event, related === null);
                }
            };

            // a form reset ends an edit and returns the value to its default (spec/editable.md,
            // "Forms"); an invalid Input moves the focus to the focus target
            watch(
                input,
                (element, _, onCleanup) => {
                    if (
                        !(element instanceof HTMLInputElement) &&
                        !(element instanceof HTMLTextAreaElement)
                    ) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element as HTMLInputElement, {
                            reset: () => {
                                if (editing.value) {
                                    const active =
                                        element.ownerDocument.activeElement;
                                    const inEdit =
                                        active !== null &&
                                        [
                                            element,
                                            submitTrigger.value,
                                            cancelTrigger.value,
                                        ].includes(active as HTMLElement);
                                    leave(inEdit);
                                }
                                field.reset();
                                value.set(props.defaultValue, {
                                    reason: "none",
                                });
                                element.value = value.value.value;
                            },
                            invalid: () =>
                                editing.value ? element : preview.value,
                        }),
                    );
                },
                { flush: "post" },
            );

            const state = computed<EditableState>(() => ({
                value: value.value.value,
                editing: editing.value,
                empty: value.value.value === "",
                disabled: disabled(),
                readOnly: props.readOnly,
                required: props.required,
            }));
            const attributes = computed(() =>
                stateAttributes({
                    editing: state.value.editing,
                    empty: state.value.empty,
                    disabled: state.value.disabled,
                    readonly: state.value.readOnly,
                    required: state.value.required,
                }),
            );
            provide(EditableKey, {
                state,
                inputId,
                name: () => field.name() ?? props.name,
                placeholder: () => props.placeholder,
                maxLength: () => props.maxLength,
                activationMode: () => props.activationMode,
                submitMode: () => props.submitMode,
                field,
                attributes,
                edit,
                onPreviewFocus: () => {
                    if (returning || props.activationMode !== "focus") {
                        return;
                    }
                    edit();
                },
                commit: (reason, event) => commit(reason, event, true),
                revert: (reason, event) => revert(reason, event, true),
                onInputText: (text, event) => {
                    value.set(text, { reason: "input-change", event });
                    reassert();
                },
                setInput: elementSetter(input),
                setPreview: elementSetter(preview),
                setEditTrigger: elementSetter(editTrigger),
                setSubmitTrigger: elementSetter(submitTrigger),
                setCancelTrigger: elementSetter(cancelTrigger),
            });

            return () =>
                renderPart("div", { attrs, slots }, props.as, state.value, {
                    "data-primitives-part": "editable-root",
                    ...attributes.value,
                    ...field.attributes(),
                    onFocusout,
                });
        },
    }),
);
