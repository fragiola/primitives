import {
    bridgeForm,
    VISUALLY_HIDDEN_INPUT_STYLE,
} from "@fragiola/primitives/form";
import {
    clampNumber,
    formatNumber,
    isNumberText,
    parseNumber,
    type ScrubPoint,
    stepNumber,
} from "@fragiola/primitives/number";
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
    NumberFieldKey,
    type NumberFieldState,
} from "./number-field-context.ts";

export interface NumberFieldRootProps {
    /** A number, or `null` while empty (`v-model:value`). */
    value?: number | null;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    /** The amount of a step (default `1`). */
    step?: number;
    /** The amount of a step with Alt (default `0.1`). */
    smallStep?: number;
    /** The amount of a step with Shift, Page Up and Page Down (default `10`). */
    largeStep?: number;
    /** A step from a value off the grid goes to the grid's next point. */
    snapOnStep?: boolean;
    /** A typed value outside `[min, max]` is clamped on blur (default `true`). */
    clampOnBlur?: boolean;
    /** How the Input writes the value; default: the plain number in the locale. */
    format?: Intl.NumberFormatOptions;
    /** The locale of the format and the parsing (BCP 47; default: the runtime's). */
    locale?: string;
    /** The mouse wheel steps the value over the focused Input. */
    allowWheelScrub?: boolean;
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

export type NumberFieldRootEmits = {
    "update:value": (value: number | null) => true;
    valueChange: (value: number | null, details: ChangeDetails) => true;
    /**
     * The value once a change is complete: on blur after typing, at a key or wheel step, at the
     * release of a button press or a scrub (spec/number-field.md, "Committing").
     */
    valueCommitted: (value: number | null, details: ChangeDetails) => true;
};

const NUMBER_OR_NULL = [Number, null] as PropType<number | null>;

/**
 * Holds a NumberField's value (`v-model:value`), its text and its hidden form input
 * (spec/number-field.md, the APG spinbutton).
 */
export const NumberFieldRoot: PartComponent<
    NumberFieldRootProps,
    NumberFieldState,
    NumberFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "NumberFieldRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: NUMBER_OR_NULL, default: undefined },
            defaultValue: { type: NUMBER_OR_NULL, default: null },
            min: { type: Number, default: undefined },
            max: { type: Number, default: undefined },
            step: { type: Number, default: 1 },
            smallStep: { type: Number, default: 0.1 },
            largeStep: { type: Number, default: 10 },
            snapOnStep: { type: Boolean, default: false },
            clampOnBlur: { type: Boolean, default: true },
            format: {
                type: Object as PropType<Intl.NumberFormatOptions>,
                default: undefined,
            },
            locale: { type: String, default: undefined },
            allowWheelScrub: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            id: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: number | null) => true,
            valueChange: (_value: number | null, _details: ChangeDetails) =>
                true,
            valueCommitted: (_value: number | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const generatedId = useId();
            const inputId = () => props.id ?? generatedId;
            const own = useControllable<number | null, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            // the text the user typed, until the blur formats it (`null`: the formatted value)
            const typed = ref<string | null>(null);
            const scrubbing = ref(false);
            const cursor = shallowRef<ScrubPoint | null>(null);
            const input = shallowRef<HTMLElement | null>(null);
            const hidden = shallowRef<HTMLInputElement | null>(null);
            const field = useFieldControl({
                id: inputId,
                labelable: true,
                value: () => own.value.value,
                filled: () => own.value.value !== null,
                input: () => hidden.value,
                focusTarget: () => input.value,
            });
            const disabled = () => props.disabled || field.disabled();
            const formattedValue = computed(() =>
                formatNumber(own.value.value, {
                    locale: props.locale,
                    format: props.format,
                }),
            );
            const state = computed<NumberFieldState>(() => ({
                value: own.value.value,
                inputValue: typed.value ?? formattedValue.value,
                disabled: disabled(),
                readOnly: props.readOnly,
                required: props.required,
                scrubbing: scrubbing.value,
            }));

            // the value as of the last change, so a held button's steps never read a value a
            // controlled consumer has not rendered yet
            let current = own.value.value;
            watch(
                () => own.value.value,
                (next) => {
                    current = next;
                },
                { flush: "sync" },
            );
            // the reason of the last change not committed yet
            let pending: ChangeReason | null = null;
            const setValue = (next: number | null, details: ChangeDetails) => {
                if (details.reason === "none") {
                    pending = null;
                } else if (!Object.is(next, current)) {
                    pending = details.reason;
                }
                current = next;
                own.set(next, details);
                // an override for the steps of this task only: a consumer that refused the value
                // renders nothing, and the next task steps from the value it kept
                setTimeout(() => {
                    current = own.value.value;
                });
            };
            /** Reports the value when a change is pending (spec/number-field.md, "Committing"). */
            const commit = (event: Event | undefined) => {
                const reason = pending;
                if (reason === null) {
                    return;
                }
                pending = null;
                emit("valueCommitted", current, { reason, event });
            };
            /** A key or the wheel commits its step at once. */
            const commitsAtOnce = (reason: ChangeReason) =>
                reason === "keyboard" || reason === "wheel";
            const options = () => ({
                locale: props.locale,
                format: props.format,
            });
            /** The value a step starts from: the typed text when it reads as a number. */
            const base = (): number | null => {
                const text = typed.value;
                if (text === null) {
                    return current;
                }
                const parsed = parseNumber(text, options());
                return parsed === null || Number.isNaN(parsed)
                    ? current
                    : parsed;
            };
            const amount = (
                event: { altKey?: boolean; shiftKey?: boolean } | undefined,
            ) =>
                event?.altKey
                    ? props.smallStep
                    : event?.shiftKey
                      ? props.largeStep
                      : props.step;
            const stepBy = (
                by: number,
                reason: ChangeReason,
                event: Event | undefined,
                times = 1,
            ) => {
                if (disabled() || props.readOnly) {
                    return false;
                }
                let next = base();
                for (let index = 0; index < times; index += 1) {
                    next = stepNumber(next, by, {
                        min: props.min,
                        max: props.max,
                        snapOnStep: props.snapOnStep,
                    });
                }
                typed.value = null;
                if (!Object.is(next, current)) {
                    setValue(next, { reason, event });
                }
                if (commitsAtOnce(reason)) {
                    commit(event);
                }
                const bound = by > 0 ? props.max : props.min;
                return bound === undefined || next !== bound;
            };
            const stepTo = (
                next: number,
                reason: ChangeReason,
                event: Event | undefined,
            ) => {
                if (disabled() || props.readOnly) {
                    return;
                }
                typed.value = null;
                if (!Object.is(next, current)) {
                    setValue(next, { reason, event });
                }
                if (commitsAtOnce(reason)) {
                    commit(event);
                }
            };
            const onInputText = (text: string, event: Event) => {
                if (disabled() || props.readOnly) {
                    return false;
                }
                if (!isNumberText(text, options())) {
                    // refused: the text stays as it was (spec/number-field.md, "Typing")
                    return false;
                }
                typed.value = text;
                if (text.trim() === "") {
                    setValue(null, { reason: "input-clear", event });
                    return true;
                }
                const parsed = parseNumber(text, options());
                if (parsed !== null && !Number.isNaN(parsed)) {
                    setValue(parsed, { reason: "input-change", event });
                }
                return true;
            };
            const onInputBlur = (event: Event) => {
                if (typed.value === null) {
                    return;
                }
                let next = base();
                if (props.clampOnBlur && next !== null) {
                    next = clampNumber(next, props.min, props.max);
                }
                typed.value = null;
                if (!Object.is(next, current)) {
                    setValue(next, { reason: "input-blur", event });
                }
                commit(event);
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
                                const rendered = own.value.value;
                                field.reset();
                                typed.value = null;
                                setValue(props.defaultValue, {
                                    reason: "none",
                                });
                                // the rendered value, which a patch follows (a controlled
                                // field that refuses the reset keeps its input)
                                element.value =
                                    rendered === null ? "" : String(rendered);
                                // and the Input's text: Vue sets `value` as a property only, so
                                // the browser's reset emptied it, and an unchanged value patches
                                // nothing
                                const text = input.value;
                                if (text instanceof HTMLInputElement) {
                                    text.value =
                                        rendered === null
                                            ? ""
                                            : formatNumber(rendered, options());
                                }
                            },
                            invalid: () => input.value,
                        }),
                    );
                },
                { flush: "post" },
            );

            const attributes = () => ({
                ...stateAttributes({
                    disabled: disabled(),
                    readonly: props.readOnly,
                    required: props.required,
                    scrubbing: scrubbing.value,
                }),
                ...field.attributes(),
            });
            provide(NumberFieldKey, {
                state,
                inputId,
                min: () => props.min,
                max: () => props.max,
                format: () => props.format,
                formattedValue: () => formattedValue.value,
                allowWheelScrub: () => props.allowWheelScrub,
                field,
                attributes,
                amount,
                stepBy,
                stepTo,
                commit,
                onInputText,
                onInputBlur,
                setInputElement: elementSetter(input),
                scrubbing,
                cursor,
            });

            return () => {
                const currentState = state.value;
                const { value } = currentState;
                return h(Fragment, [
                    renderPart(
                        "div",
                        { attrs, slots },
                        props.as,
                        currentState,
                        {
                            "data-primitives-part": "number-field-root",
                            ...attributes(),
                        },
                    ),
                    h("input", {
                        ref: (element: unknown) => {
                            hidden.value = element as HTMLInputElement | null;
                        },
                        type: "number",
                        "aria-hidden": "true",
                        tabindex: -1,
                        name: field.name() ?? props.name,
                        value: value === null ? "" : String(value),
                        min: props.min,
                        max: props.max,
                        step: "any",
                        required: currentState.required,
                        disabled: currentState.disabled,
                        onFocus: () => input.value?.focus(),
                        style: VISUALLY_HIDDEN_INPUT_STYLE,
                        "data-primitives-part": "number-field-hidden-input",
                    }),
                ]);
            };
        },
    }),
);
