import { inDocumentOrder } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    bridgeForm,
    normalizeOtp,
    type OtpValidationType,
    otpInputMode,
    otpPattern,
    removeOtpCharacter,
    replaceOtp,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    Fragment,
    h,
    type PropType,
    provide,
    ref,
    shallowRef,
    useId,
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
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { OTPFieldKey, type OTPFieldState } from "./otp-field-context.ts";

export interface OTPFieldRootProps {
    /** The number of slots. */
    length: number;
    /** The code (`v-model:value`). */
    value?: string;
    defaultValue?: string;
    /** The characters a slot accepts (default `"numeric"`). */
    validationType?: OtpValidationType;
    /** The slots hide their characters (`type="password"`). */
    mask?: boolean;
    /** The first slot's and the hidden input's `autocomplete` (default `"one-time-code"`). */
    autoComplete?: string;
    /** The slots' virtual keyboard (default from `validationType`). */
    inputMode?: string;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
    /** The first slot's `id`; slot `n` gets `<id>-<n>`. */
    id?: string;
}

export type OTPFieldRootEmits = {
    "update:value": (value: string) => true;
    valueChange: (value: string, details: ChangeDetails) => true;
    /** The value became `length` long, or a complete code was pasted again. */
    valueComplete: (value: string, details: ChangeDetails) => true;
    /** Typed or pasted text held characters `validationType` refuses. */
    valueInvalid: (text: string, details: ChangeDetails) => true;
};

/**
 * Holds an OTP field's code (`v-model:value`), its slots and its hidden form input
 * (spec/otp-field.md: one native input per slot, in a `group` with one tab stop).
 */
export const OTPFieldRoot: PartComponent<
    OTPFieldRootProps,
    OTPFieldState,
    OTPFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "OTPFieldRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            length: { type: Number, required: true },
            value: { type: String, default: undefined },
            defaultValue: { type: String, default: "" },
            validationType: {
                type: [String, RegExp] as PropType<OtpValidationType>,
                default: "numeric",
            },
            mask: { type: Boolean, default: false },
            autoComplete: { type: String, default: "one-time-code" },
            inputMode: { type: String, default: undefined },
            required: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            id: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: string) => true,
            valueChange: (_value: string, _details: ChangeDetails) => true,
            valueComplete: (_value: string, _details: ChangeDetails) => true,
            valueInvalid: (_text: string, _details: ChangeDetails) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const generatedId = useId();
            const id = () => props.id ?? generatedId;
            const direction = useProvidedDirection();
            const own = useControllable<string, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = computed(
                () =>
                    normalizeOtp(
                        own.value.value,
                        props.length,
                        props.validationType,
                    ).value,
            );
            const items = shallowRef<readonly HTMLInputElement[]>([]);
            const ordered = computed(() =>
                inDocumentOrder(items.value, (slot) => slot),
            );
            const focusedIndex = ref<number | null>(null);
            const root = shallowRef<HTMLElement | null>(null);
            const setRoot = elementSetter(root);
            const hidden = shallowRef<HTMLInputElement | null>(null);
            const last = () => Math.max(props.length - 1, 0);
            const field = useFieldControl({
                id,
                labelable: true,
                value: () => value.value,
                filled: () => value.value !== "",
                input: () => hidden.value,
                focusTarget: () =>
                    ordered.value[Math.min(value.value.length, last())] ?? null,
            });
            const disabled = () => props.disabled || field.disabled();
            const state = computed<OTPFieldState>(() => ({
                value: value.value,
                length: props.length,
                complete:
                    value.value.length === props.length && props.length > 0,
                disabled: disabled(),
                readOnly: props.readOnly,
                required: props.required,
            }));

            // the value as of the last change: a focus right after it reads it before the
            // consumer's update renders
            let current = value.value;
            watch(
                value,
                (next) => {
                    current = next;
                },
                { flush: "sync" },
            );

            const register = (element: HTMLInputElement) => {
                items.value = [...items.value, element];
                return () => {
                    items.value = items.value.filter(
                        (slot) => slot !== element,
                    );
                };
            };

            const setValue = (
                next: string,
                reason: ChangeReason,
                event: Event | undefined,
            ) => {
                const details: ChangeDetails = { reason, event };
                if (next === current) {
                    // a complete code pasted again completes again (Base UI)
                    if (
                        reason === "input-paste" &&
                        next.length === props.length
                    ) {
                        emit("valueComplete", next, details);
                    }
                    return;
                }
                current = next;
                own.set(next, details);
                if (next.length === props.length) {
                    emit("valueComplete", next, details);
                }
            };
            const focusSlot = (index: number) => {
                const target = Math.max(
                    0,
                    Math.min(index, current.length, props.length - 1),
                );
                const slot = ordered.value[target];
                if (slot !== undefined) {
                    slot.focus();
                    slot.select();
                }
            };
            const commit = (
                index: number,
                text: string,
                reason: "input-change" | "input-paste",
                event: Event,
            ) => {
                if (disabled() || props.readOnly) {
                    return;
                }
                const normalized = normalizeOtp(
                    text,
                    props.length,
                    props.validationType,
                );
                if (normalized.rejected) {
                    emit("valueInvalid", text, { reason, event });
                }
                if (normalized.value === "") {
                    if (reason === "input-change" && text === "") {
                        setValue(
                            removeOtpCharacter(current, index),
                            "input-clear",
                            event,
                        );
                    }
                    return;
                }
                const next = replaceOtp(
                    current,
                    index,
                    normalized.value,
                    props.length,
                    props.validationType,
                );
                setValue(next, reason, event);
                focusSlot(index + Array.from(normalized.value).length);
            };

            const onSlotKeydown = (index: number, event: KeyboardEvent) => {
                if (event.defaultPrevented || disabled()) {
                    return;
                }
                const input = event.currentTarget as HTMLInputElement;
                const end = Math.min(current.length, props.length - 1);
                const boundary =
                    (event.ctrlKey || event.metaKey) && !event.altKey;
                const rtl = getDirection(input, direction()) === "rtl";
                const previousKey = rtl ? "ArrowRight" : "ArrowLeft";
                const nextKey = rtl ? "ArrowLeft" : "ArrowRight";
                const move = (target: number) => {
                    event.preventDefault();
                    focusSlot(target);
                };
                if (event.key === previousKey) {
                    move(boundary ? 0 : Math.max(0, index - 1));
                    return;
                }
                if (event.key === nextKey) {
                    move(
                        boundary ? end : Math.min(props.length - 1, index + 1),
                    );
                    return;
                }
                if (event.key === "Home" || event.key === "ArrowUp") {
                    move(0);
                    return;
                }
                if (event.key === "End" || event.key === "ArrowDown") {
                    move(end);
                    return;
                }
                if (props.readOnly) {
                    return;
                }
                const character = Array.from(current)[index] ?? "";
                if (event.key === "Backspace" && boundary) {
                    event.preventDefault();
                    setValue("", "keyboard", event);
                    focusSlot(0);
                    return;
                }
                if (event.key === "Delete") {
                    event.preventDefault();
                    setValue(
                        removeOtpCharacter(current, index),
                        "keyboard",
                        event,
                    );
                    focusSlot(index);
                    return;
                }
                if (event.key === "Backspace") {
                    event.preventDefault();
                    const target = Math.max(0, index - 1);
                    setValue(
                        removeOtpCharacter(
                            current,
                            character === "" ? target : index,
                        ),
                        "keyboard",
                        event,
                    );
                    focusSlot(target);
                    return;
                }
                const selectsAll =
                    input.selectionStart === 0 &&
                    input.selectionEnd === input.value.length;
                if (
                    event.key.length === 1 &&
                    !boundary &&
                    selectsAll &&
                    character === event.key
                ) {
                    // the character it already holds: only move on
                    event.preventDefault();
                    if (index < props.length - 1) {
                        focusSlot(index + 1);
                    }
                }
            };

            const onSlotFocus = (index: number, element: HTMLInputElement) => {
                if (index > current.length) {
                    // no gap: the first empty slot takes the focus
                    focusSlot(current.length);
                    return;
                }
                focusedIndex.value = index;
                element.select();
                field.onFocus();
            };
            const onSlotBlur = (related: EventTarget | null) => {
                if (related instanceof Node && root.value?.contains(related)) {
                    return;
                }
                focusedIndex.value = null;
                field.onBlur();
            };

            // a form reset returns it to its default, and writes the rendered value back
            // (Switch's way, docs/decisions.md)
            watch(
                hidden,
                (element, _, onCleanup) => {
                    if (element === null) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                const rendered = value.value;
                                field.reset();
                                setValue(
                                    normalizeOtp(
                                        props.defaultValue,
                                        props.length,
                                        props.validationType,
                                    ).value,
                                    "none",
                                    undefined,
                                );
                                // the rendered value, which a patch follows (a controlled
                                // field that refuses the reset keeps its input)
                                element.value = rendered;
                            },
                            invalid: () =>
                                ordered.value[
                                    Math.min(current.length, props.length - 1)
                                ] ?? null,
                        }),
                    );
                },
                { flush: "post" },
            );

            const attributes = () => ({
                ...stateAttributes({
                    disabled: state.value.disabled,
                    readonly: state.value.readOnly,
                    required: state.value.required,
                    complete: state.value.complete,
                }),
                ...field.attributes(),
            });
            provide(OTPFieldKey, {
                state,
                field,
                id,
                mask: () => props.mask,
                autoComplete: () => props.autoComplete,
                inputMode: () =>
                    props.inputMode ?? otpInputMode(props.validationType),
                activeIndex: () =>
                    focusedIndex.value ?? Math.min(value.value.length, last()),
                attributes,
                register,
                indexOf: (element) =>
                    element === null ? -1 : ordered.value.indexOf(element),
                onSlotText: (index, text, event) =>
                    commit(index, text, "input-change", event),
                onSlotPaste: (index, text, event) =>
                    commit(index, text, "input-paste", event),
                onSlotKeydown,
                onSlotFocus,
                onSlotBlur,
                focusSlot,
            });

            // the browser's autofill of the hidden input
            const onHiddenInput = (event: Event) => {
                const { value: next } = normalizeOtp(
                    (event.target as HTMLInputElement).value,
                    props.length,
                    props.validationType,
                );
                if (!disabled() && !props.readOnly) {
                    setValue(next, "input-change", event);
                }
            };

            return () => {
                const currentState = state.value;
                const aria = field.aria();
                return h(Fragment, [
                    renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        currentState,
                        {
                            role: "group",
                            "aria-labelledby": aria["aria-labelledby"],
                            "aria-describedby": aria["aria-describedby"],
                            "data-primitives-part": "otp-field-root",
                            ...attributes(),
                            ref: setRoot,
                        },
                    ),
                    h("input", {
                        ref: (element: unknown) => {
                            hidden.value = element as HTMLInputElement | null;
                        },
                        type: "text",
                        "aria-hidden": "true",
                        tabindex: -1,
                        name: field.name() ?? props.name,
                        value: currentState.value,
                        autocomplete: props.autoComplete,
                        maxlength: props.length,
                        pattern: otpPattern(props.validationType, props.length),
                        required: currentState.required,
                        disabled: currentState.disabled,
                        onFocus: () => focusSlot(0),
                        onInput: onHiddenInput,
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "otp-field-hidden-input",
                    }),
                ]);
            };
        },
    }),
);
