import { getDirection } from "@fragiola/primitives/direction";
import { ratingKeyTarget } from "@fragiola/primitives/range";
import {
    computed,
    defineComponent,
    provide,
    type SlotsType,
    shallowRef,
    type VNode,
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
import { RatingKey } from "./rating-context.ts";

export interface RatingRootState {
    value: number;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

/** What the Root's default scoped slot receives (spec/rating.md, "API"). */
export interface RatingRootRenderState {
    /** The stars' indexes, `1` to `count`. */
    items: number[];
    value: number;
}

export interface RatingRootSlots {
    default?: (scope: RatingRootRenderState) => VNode[];
    render?: (scope: RenderSlotProps<RatingRootState>) => VNode[];
}

export interface RatingRootProps {
    as?: AsProp;
    /** The score, `0` for none (controlled). */
    value?: number;
    /** The score at first (default `0`: none). */
    defaultValue?: number;
    /** The number of stars (default `5`). */
    count?: number;
    /** Half steps: the arrows step by 0.5, a press on a star's inline-start half chooses its half. */
    allowHalf?: boolean;
    /** A press that chooses the current value again clears it (default `false`). */
    allowClear?: boolean;
    /** Shown and focusable; nothing changes it. */
    readOnly?: boolean;
    /** Every star is disabled. */
    disabled?: boolean;
    /** The form's validation fails while the value is `0`. */
    required?: boolean;
    /** The HiddenInput's name. */
    name?: string;
    /** The arrows wrap from `count` to the first step and back (default `true`). */
    loopFocus?: boolean;
}

export type RatingRootEmits = {
    /** The new score (`v-model:value`); `0` for none. */
    "update:value": (value: number) => true;
    valueChange: (value: number, details: ChangeDetails) => true;
};

/**
 * A score chosen among stars (`v-model:value`; spec/rating.md, the APG's rating radio group): the
 * `radiogroup`, one `radio` per star, one tab stop, the arrows step the value and move the focus,
 * a pointer previews the value it would choose.
 */
export const RatingRoot: PublicComponent<
    RatingRootProps,
    RatingRootSlots,
    RatingRootEmits
> = publicComponent(
    defineComponent({
        name: "RatingRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: Number, default: undefined },
            defaultValue: { type: Number, default: 0 },
            count: { type: Number, default: 5 },
            allowHalf: { type: Boolean, default: false },
            allowClear: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            disabled: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: number) => true,
            valueChange: (_value: number, _details: ChangeDetails) => true,
        },
        slots: Object as SlotsType<RatingRootSlots>,
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<number, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const value = computed(() => own.value.value);
            const element = shallowRef<HTMLElement | null>(null);
            const setElement = elementSetter(element);
            const direction = useProvidedDirection();
            const hovered = shallowRef<number | null>(null);
            const stars = new Map<number, HTMLElement>();
            let hiddenInput: HTMLInputElement | null = null;

            const tabStopElement = () => {
                const current = value.value;
                return stars.get(current > 0 ? Math.ceil(current) : 1) ?? null;
            };
            // inside a Field, the Root is the field's control (spec/field.md, "Integration
            // contract"), as RadioGroup; the validated element is the HiddenInput
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => value.value,
                filled: () => value.value > 0,
                input: () => hiddenInput,
                element: () => element.value,
                focusTarget: tabStopElement,
            });
            const disabled = () => props.disabled || field.disabled();
            const interactive = () => !disabled() && !props.readOnly;

            const choose = (next: number, reason: ChangeReason, event: Event) =>
                own.set(next, { reason, event });
            const preview = (next: number | null) => {
                hovered.value = interactive() ? next : null;
            };
            const keyDown = (key: string, index: number, event: Event) => {
                const root = element.value;
                if (!interactive() || root === null) {
                    return false;
                }
                const current = value.value;
                if (key === " ") {
                    // checks the focused star, when it is not checked (spec/rating.md,
                    // "Keyboard")
                    if (Math.ceil(current) !== index || current <= 0) {
                        choose(index, "keyboard", event);
                    }
                    return true;
                }
                const target = ratingKeyTarget(key, current, {
                    count: props.count,
                    allowHalf: props.allowHalf,
                    rtl: getDirection(root, direction()) === "rtl",
                    loop: props.loopFocus,
                });
                if (target === null) {
                    return false;
                }
                stars.get(Math.ceil(target))?.focus();
                choose(target, "keyboard", event);
                return true;
            };
            const registerItem = (index: number, star: HTMLElement) => {
                stars.set(index, star);
                return () => {
                    if (stars.get(index) === star) {
                        stars.delete(index);
                    }
                };
            };
            const setHiddenInput = (input: HTMLInputElement | null) => {
                hiddenInput = input;
            };
            const reset = () => {
                field.reset();
                own.set(props.defaultValue, { reason: "none" });
            };

            const displayed = computed(() =>
                interactive() && hovered.value !== null
                    ? hovered.value
                    : value.value,
            );
            const tabStop = computed(() =>
                disabled()
                    ? null
                    : value.value > 0
                      ? Math.ceil(value.value)
                      : 1,
            );
            provide(RatingKey, {
                value,
                displayed,
                allowHalf: () => props.allowHalf,
                allowClear: () => props.allowClear,
                disabled,
                readOnly: () => props.readOnly,
                required: () => props.required,
                name: () => field.name() ?? props.name,
                tabStop,
                choose,
                preview,
                keyDown,
                registerItem,
                setHiddenInput,
                reset,
                tabStopElement,
            });
            const items = computed(() =>
                Array.from({ length: props.count }, (_, index) => index + 1),
            );

            // the preview ends when the pointer leaves the stars' Root
            const onPointerleave = () => {
                hovered.value = null;
            };
            // focus within the Root; touched once focus leaves it
            const onFocusin = () => field.onFocus();
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget as Node | null;
                if (next === null || !element.value?.contains(next)) {
                    field.onBlur();
                }
            };
            return () => {
                const isDisabled = disabled();
                const { readOnly, required } = props;
                const current = value.value;
                const state: RatingRootState = {
                    value: current,
                    disabled: isDisabled,
                    readOnly,
                    required,
                };
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        role: "radiogroup",
                        "aria-readonly": readOnly ? "true" : undefined,
                        "aria-disabled": isDisabled ? "true" : undefined,
                        "aria-required": required ? "true" : undefined,
                        ...field.aria(),
                        "data-primitives-part": "rating-root",
                        ...field.attributes(),
                        ...stateAttributes({
                            disabled: isDisabled,
                            readonly: readOnly,
                            required,
                        }),
                        onPointerleave,
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                    () =>
                        slots.default?.({ items: items.value, value: current }),
                );
            };
        },
    }),
);
