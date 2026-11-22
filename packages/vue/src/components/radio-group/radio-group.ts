import { radioKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    computed,
    defineComponent,
    type PropType,
    provide,
    shallowRef,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import { useProvidedDirection } from "../../direction/direction-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type RadioEntry, RadioGroupKey } from "./radio-group-context.ts";

export interface RadioGroupState {
    value: string | null;
    disabled: boolean;
    required: boolean;
    orientation: "horizontal" | "vertical" | undefined;
}

export interface RadioGroupProps {
    /** The checked radio's value; `null` for none (controlled). */
    value?: string | null;
    /** The radio checked at first (default: none). */
    defaultValue?: string | null;
    /** Disables every radio. */
    disabled?: boolean;
    /** The form's validation fails while no radio is checked. */
    required?: boolean;
    /** Every radio's hidden input takes it. */
    name?: string;
    /** `aria-orientation` and `data-orientation`; it changes no key (APG). */
    orientation?: "horizontal" | "vertical";
    /** The arrows wrap from the last radio to the first and back (default `true`). */
    loopFocus?: boolean;
}

export type RadioGroupEmits = {
    /** The checked radio's value; `null` when a form reset returns the group to none. */
    "update:value": (value: string | null) => true;
    valueChange: (value: string | null, details: ChangeDetails) => true;
};

/** The radios in document order (those whose element is rendered). */
function inOrder(entries: readonly RadioEntry[]) {
    return entries
        .map((entry) => ({
            value: entry.value(),
            disabled: entry.disabled(),
            element: entry.element(),
        }))
        .filter(
            (entry): entry is typeof entry & { element: HTMLElement } =>
                entry.element !== null,
        )
        .sort((a, b) =>
            a.element.compareDocumentPosition(b.element) &
            Node.DOCUMENT_POSITION_FOLLOWING
                ? -1
                : 1,
        );
}

/** The radio holding the tab stop: the checked one when enabled, else the first enabled one. */
function tabStopOf(entries: readonly RadioEntry[], value: string | null) {
    const enabled = inOrder(entries).filter((entry) => !entry.disabled);
    return enabled.find((entry) => entry.value === value) ?? enabled[0];
}

/**
 * A set of radios of which one can be checked (`v-model:value`; spec/radio-group.md, the APG
 * radio group): the `radiogroup`, one tab stop, the arrows move the focus and the check together.
 */
export const RadioGroup: PartComponent<
    RadioGroupProps,
    RadioGroupState,
    RadioGroupEmits
> = publicComponent(
    defineComponent({
        name: "RadioGroup",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: String as PropType<string | null>,
                default: undefined,
            },
            defaultValue: {
                type: String as PropType<string | null>,
                default: null,
            },
            disabled: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            orientation: {
                type: String as PropType<"horizontal" | "vertical">,
                default: undefined,
            },
            loopFocus: { type: Boolean, default: true },
        },
        emits: {
            "update:value": (_value: string | null) => true,
            valueChange: (_value: string | null, _details: ChangeDetails) =>
                true,
        },
        setup(props, { attrs, slots, emit }) {
            const own = useControllable<string | null, ChangeDetails>(
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
            const radios = shallowRef<readonly RadioEntry[]>([]);

            const tabStopElement = () =>
                tabStopOf(radios.value, value.value)?.element ?? null;
            // inside a Field, the group is the field's control (spec/field.md, "Integration
            // contract"): no labelable element; the validated element is its first enabled
            // radio's hidden input
            const field = useFieldControl({
                id: () => undefined,
                labelable: false,
                value: () => value.value,
                filled: () => value.value !== null,
                input: () =>
                    element.value?.querySelector<HTMLInputElement>(
                        'input[data-primitives-part="radio-input"]:not([disabled])',
                    ) ?? null,
                element: () => element.value,
                focusTarget: tabStopElement,
            });
            const disabled = () => props.disabled || field.disabled();

            const select = (next: string) => own.set(next, { reason: "none" });
            const navigate = (key: string, from: HTMLElement) => {
                const ordered = inOrder(radios.value);
                const index = ordered.findIndex(
                    (entry) => entry.element === from,
                );
                const group = element.value;
                if (index === -1 || group === null) {
                    return false;
                }
                const target = radioKeyTarget(key, index, ordered.length, {
                    rtl: getDirection(group, direction()) === "rtl",
                    loop: props.loopFocus,
                    skip: (candidate) => ordered[candidate]?.disabled ?? true,
                });
                const entry = target === null ? undefined : ordered[target];
                if (entry === undefined) {
                    return false;
                }
                entry.element.focus();
                select(entry.value);
                return true;
            };
            // every radio's hidden input reports its form's reset: the group resets once per reset
            let resetting = false;
            const reset = () => {
                if (resetting) {
                    return;
                }
                resetting = true;
                setTimeout(() => {
                    resetting = false;
                });
                field.reset();
                own.set(props.defaultValue, { reason: "none" });
            };
            const register = (entry: RadioEntry) => {
                radios.value = [...radios.value, entry];
                return () => {
                    radios.value = radios.value.filter(
                        (item) => item !== entry,
                    );
                };
            };
            // the roving tab stop: before the radios registered (on a server), the checked one
            const tabStop = computed(() =>
                radios.value.length === 0
                    ? value.value
                    : (tabStopOf(radios.value, value.value)?.value ?? null),
            );
            provide(RadioGroupKey, {
                value,
                disabled,
                required: () => props.required,
                name: () => field.name() ?? props.name,
                tabStop,
                select,
                navigate,
                reset,
                tabStopElement,
                register,
            });

            // focus within the group; touched once focus leaves it
            const onFocusin = () => field.onFocus();
            const onFocusout = (event: FocusEvent) => {
                const next = event.relatedTarget as Node | null;
                if (next === null || !element.value?.contains(next)) {
                    field.onBlur();
                }
            };
            return () => {
                const isDisabled = disabled();
                const { required, orientation } = props;
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    {
                        value: value.value,
                        disabled: isDisabled,
                        required,
                        orientation,
                    },
                    {
                        role: "radiogroup",
                        "aria-required": required ? "true" : undefined,
                        "aria-disabled": isDisabled ? "true" : undefined,
                        "aria-orientation": orientation,
                        ...field.aria(),
                        "data-primitives-part": "radio-group-root",
                        ...field.attributes(),
                        ...stateAttributes({
                            disabled: isDisabled,
                            required,
                            orientation,
                        }),
                        onFocusin,
                        onFocusout,
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
