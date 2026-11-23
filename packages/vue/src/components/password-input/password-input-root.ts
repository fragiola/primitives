import { bridgeForm } from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    nextTick,
    provide,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    PasswordInputKey,
    type PasswordInputState,
} from "./password-input-context.ts";

export interface PasswordInputRootProps {
    /** The text (controlled; `v-model:value`). */
    value?: string;
    defaultValue?: string;
    /** Whether the text is shown (controlled; `v-model:visible`). */
    visible?: boolean;
    defaultVisible?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    /** The Input's `name`. */
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

export type PasswordInputRootEmits = {
    "update:value": (value: string) => true;
    valueChange: (value: string, details: ChangeDetails) => true;
    "update:visible": (visible: boolean) => true;
    visibleChange: (visible: boolean, details: ChangeDetails) => true;
};

/**
 * Holds a PasswordInput's text and whether it is shown (spec/password-input.md): its Input is the
 * form control, its VisibilityTrigger a toggle button.
 */
export const PasswordInputRoot: PartComponent<
    PasswordInputRootProps,
    PasswordInputState,
    PasswordInputRootEmits
> = publicComponent(
    defineComponent({
        name: "PasswordInputRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, default: undefined },
            defaultValue: { type: String, default: "" },
            visible: { type: Boolean, default: undefined },
            defaultVisible: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            id: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: string) => true,
            valueChange: (_value: string, _details: ChangeDetails) => true,
            "update:visible": (_visible: boolean) => true,
            visibleChange: (_visible: boolean, _details: ChangeDetails) => true,
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
            const visible = useControllable<boolean, ChangeDetails>(
                () => props.visible,
                props.defaultVisible,
                (next, details) => {
                    emit("update:visible", next);
                    emit("visibleChange", next, details);
                },
            );
            const input = shallowRef<HTMLElement | null>(null);
            const field = useFieldControl({
                id: inputId,
                labelable: true,
                value: () => value.value.value,
                filled: () => value.value.value !== "",
                input: () => input.value as HTMLInputElement | null,
                focusTarget: () => input.value,
            });
            const disabled = () => props.disabled || field.disabled();

            // the Input's selection before its type changed, put back once it rendered
            // (spec/password-input.md, "Focus")
            let selection: {
                start: number | null;
                end: number | null;
                direction: "forward" | "backward" | "none" | null;
            } | null = null;
            watch(
                () => visible.value.value,
                () => {
                    const saved = selection;
                    selection = null;
                    const element = input.value as HTMLInputElement | null;
                    if (
                        saved === null ||
                        element === null ||
                        saved.start === null
                    ) {
                        return;
                    }
                    element.setSelectionRange(
                        saved.start,
                        saved.end ?? saved.start,
                        saved.direction ?? undefined,
                    );
                },
                { flush: "post" },
            );

            // a form reset returns the text and the visibility to their defaults; a submission
            // hides the text (spec/password-input.md, "Forms")
            watch(
                input,
                (element, _, onCleanup) => {
                    if (!(element instanceof HTMLInputElement)) {
                        return;
                    }
                    const cleanup = bridgeForm(element, {
                        reset: () => {
                            field.reset();
                            value.set(props.defaultValue, { reason: "none" });
                            visible.set(props.defaultVisible, {
                                reason: "none",
                            });
                            // the browser reset the input to its default: write the rendered
                            // value back (a patch follows a change)
                            element.value = value.value.value;
                        },
                    });
                    const form = element.form;
                    const onSubmit = (event: Event) => {
                        if (visible.value.value) {
                            visible.set(false, { reason: "none", event });
                        }
                    };
                    form?.addEventListener("submit", onSubmit);
                    onCleanup(() => {
                        cleanup();
                        form?.removeEventListener("submit", onSubmit);
                    });
                },
                { flush: "post" },
            );

            const state = computed<PasswordInputState>(() => ({
                value: value.value.value,
                visible: visible.value.value,
                disabled: disabled(),
                readOnly: props.readOnly,
                required: props.required,
            }));
            const attributes = computed(() =>
                stateAttributes({
                    visible: state.value.visible,
                    disabled: state.value.disabled,
                    readonly: state.value.readOnly,
                    required: state.value.required,
                }),
            );
            provide(PasswordInputKey, {
                state,
                inputId,
                name: () => field.name() ?? props.name,
                field,
                attributes,
                onInputText: (text, event) => {
                    value.set(text, { reason: "input-change", event });
                    // a controlled value the consumer kept does not re-render the input
                    const element = input.value as HTMLInputElement | null;
                    void nextTick().then(() => {
                        if (
                            element !== null &&
                            element.value !== value.value.value
                        ) {
                            element.value = value.value.value;
                        }
                    });
                },
                toggle: (event) => {
                    if (disabled()) {
                        return;
                    }
                    const element = input.value as HTMLInputElement | null;
                    selection =
                        element === null
                            ? null
                            : {
                                  start: element.selectionStart,
                                  end: element.selectionEnd,
                                  direction: element.selectionDirection,
                              };
                    visible.set(!visible.value.value, {
                        reason: "trigger-press",
                        event,
                    });
                },
                setInput: elementSetter(input),
            });

            return () =>
                renderPart("div", { attrs, slots }, props.as, state.value, {
                    "data-primitives-part": "password-input-root",
                    ...attributes.value,
                    ...field.attributes(),
                });
        },
    }),
);
